import { Prisma } from "@prisma/client";
import { SeverityNumber } from "@opentelemetry/api-logs";
import { after, NextResponse } from "next/server";
import { site } from "@/config/site";
import { posthogLogger, posthogLoggerProvider } from "@/instrumentation";
import { rejectBots } from "@/lib/bot";
import { parseCartLines, priceCart } from "@/lib/checkout";
import { db } from "@/lib/db";
import { getDeliveryQuote } from "@/lib/delivery";
import { releaseReservation, reserveStock } from "@/lib/inventory";
import { notifyStaffNewOrder } from "@/lib/notify";
import { getCurrentUser } from "@/lib/session";

export const dynamic = "force-dynamic";

/**
 * Create an order from the client cart (COD).
 * Body: { items: [{productId, qty, size}], customer: {...}, idempotencyKey?: string }
 * Prices, names and availability are read from the DB; client prices are ignored.
 * Returns { order: { number, total }, whatsapp: <deeplink with summary> }
 */
export async function POST(req: Request) {
	const blocked = await rejectBots();
	if (blocked) return blocked;
	const user = await getCurrentUser();
	try {
		const body = await req.json();
		const cartLines = parseCartLines(body.items);
		const customer = body.customer ?? {};
		const idempotencyKey =
			typeof body.idempotencyKey === "string" && body.idempotencyKey.trim()
				? body.idempotencyKey.trim()
				: `checkout:${crypto.randomUUID()}`;

		if (!cartLines) {
			return NextResponse.json(
				{ error: "Panier vide ou invalide." },
				{ status: 400 },
			);
		}
		if (
			typeof customer.name !== "string" ||
			typeof customer.phone !== "string" ||
			!customer.name.trim() ||
			!customer.phone.trim()
		) {
			return NextResponse.json(
				{ error: "Nom et téléphone requis." },
				{ status: 400 },
			);
		}

		// Idempotent replay: return the existing order instead of creating a duplicate.
		if (idempotencyKey) {
			const existing = await db.order.findUnique({
				where: { idempotencyKey },
				include: { items: true },
			});
			if (existing) {
				const whatsapp = buildWhatsappLink(existing, site);
				return NextResponse.json({
					order: { number: existing.number, total: existing.total },
					whatsapp,
					idempotent: true,
				});
			}
		}

		const products = await db.product.findMany({
			where: { id: { in: cartLines.map((l) => l.productId) } },
			select: {
				id: true,
				ref: true,
				name: true,
				price: true,
				salePrice: true,
				inStock: true,
				sizes: true,
				colors: true,
			},
		});
		const priced = priceCart(cartLines, products);
		if (!priced.ok) {
			return NextResponse.json({ error: priced.error }, { status: 409 });
		}
		const { items, total: itemsTotal } = priced;

		// Delivery quote (server-side source of truth).
		const quote = await getDeliveryQuote(
			typeof customer.city === "string" ? customer.city : null,
		);
		if (!quote.covered) {
			return NextResponse.json(
				{ error: "Destination de livraison non couverte." },
				{ status: 409 },
			);
		}
		const total = itemsTotal + quote.fee;

		// Resolve variants per line and reserve stock. Track reservations so we
		// can release them if any later step fails (compensation).
		const reservations: {
			variantId: string;
			qty: number;
			key: string;
			owned: boolean;
		}[] = [];
		const lineVariants: (string | null)[] = [];
		const lineVariantSkus: (string | null)[] = [];
		try {
			for (let i = 0; i < cartLines.length; i++) {
				const line = cartLines[i];
				const product = products.find((p) => p.id === line.productId);
				if (!product) throw new Error("OUT_OF_STOCK");
				// Per-variant inventory enforcement (issue #145 follow-up): if the
				// product carries variant rows but none matches the requested
				// size, the size is not purchasable — do NOT fall back to the
				// product-level inStock flag. The legacy product-level fallback
				// applies only to products with zero variant rows.
				const variant = await db.productVariant.findFirst({
					where: { productId: line.productId, size: line.size, color: null },
					select: { id: true, sku: true },
				});
				if (!variant) {
					const variantCount = await db.productVariant.count({
						where: { productId: line.productId },
					});
					if (variantCount > 0) throw new Error("OUT_OF_STOCK");
				}
				lineVariants.push(variant?.id ?? null);
				lineVariantSkus.push(variant?.sku ?? null);
				if (variant) {
					const resKey = `${idempotencyKey}:reserve:${i}`;
					// If the original reservation was compensated (released after a
					// failed order creation), replay detection on resKey would wrongly
					// skip a new stock hold — advance to the next reservation
					// generation instead (Codex P2).
					let effectiveKey = resKey;
					const released = await db.stockMovement.findUnique({
						where: { idempotencyKey: `${resKey}:release` },
						select: { id: true },
					});
					if (released) {
						let gen = 1;
						while (
							await db.stockMovement.findUnique({
								where: { idempotencyKey: `${resKey}:g${gen}` },
								select: { id: true },
							})
						) {
							gen++;
						}
						effectiveKey = `${resKey}:g${gen}`;
					}
					const res = await reserveStock(variant.id, line.qty, {
						idempotencyKey: effectiveKey,
						sourceRef: "checkout",
					});
					if (!res.replayed) {
						reservations.push({
							variantId: variant.id,
							qty: line.qty,
							key: effectiveKey,
							owned: true,
						});
					}
				} else if (!product.inStock) {
					throw new Error("OUT_OF_STOCK");
				}
			}
		} catch (e) {
			// Release any reservations already made.
			for (const r of reservations) {
				try {
					await releaseReservation(r.variantId, r.qty, {
						idempotencyKey: `${r.key}:release`,
						sourceRef: "checkout-rollback",
					});
				} catch {
					// best effort
				}
			}
			const msg =
				e instanceof Error && e.message === "OUT_OF_STOCK"
					? "Un article du panier n'est plus disponible."
					: "Stock insuffisant.";
			return NextResponse.json({ error: msg }, { status: 409 });
		}

		const userId = user ? await getOrderUserId(user) : null;
		let order: Awaited<ReturnType<typeof createOrderWithNumber>>;
		try {
			order = await createOrderWithNumber({
				status: "PENDING",
				customerName: customer.name.trim(),
				customerPhone: customer.phone.trim(),
				customerEmail: customer.email?.trim() || null,
				city: customer.city?.trim() || null,
				address: customer.address?.trim() || null,
				notes: customer.notes?.trim() || null,
				utmSource: customer.utmSource || null,
				utmMedium: customer.utmMedium || null,
				utmCampaign: customer.utmCampaign || null,
				utmContent: customer.utmContent || null,
				utmTerm: customer.utmTerm || null,
				total,
				currency: site.currency,
				payment: "COD",
				userId,
				idempotencyKey,
				deliveryZoneId: quote.zoneId,
				deliveryZoneName: quote.zoneName,
				deliveryFee: quote.fee,
				items: {
					create: items.map((it, idx) => ({
						productId: it.productId,
						variantId: lineVariants[idx],
						sku: lineVariantSkus[idx] ?? it.ref,
						ref: it.ref,
						name: it.name,
						price: it.price,
						quantity: it.quantity,
						size: it.size,
						color: null,
					})),
				},
			});
		} catch (e) {
			// Release reservations on order creation failure.
			for (const r of reservations) {
				try {
					await releaseReservation(r.variantId, r.qty, {
						idempotencyKey: `${r.key}:release`,
						sourceRef: "checkout-rollback",
					});
				} catch {
					// best effort
				}
			}
			// Idempotency race: another request created the order first.
			if (
				e instanceof Prisma.PrismaClientKnownRequestError &&
				e.code === "P2002" &&
				idempotencyKey
			) {
				const existing = await db.order.findUnique({
					where: { idempotencyKey },
					include: { items: true },
				});
				if (existing) {
					const whatsapp = buildWhatsappLink(existing, site);
					return NextResponse.json({
						order: { number: existing.number, total: existing.total },
						whatsapp,
						idempotent: true,
					});
				}
			}
			throw e;
		}

		const pricedItems = items.map((i) => ({
			name: i.name,
			size: i.size,
			price: i.price,
			quantity: i.quantity,
		}));

		// Note: GA4/Meta purchase tracking happens client-side on the checkout
		// success screen (consent-gated). Here we just persist the order.

		const lines = [
			`Bonjour Maison Titrit 👋`,
			``,
			`Nouvelle commande ${order.number}`,
			``,
			...pricedItems.map(
				(i) =>
					`• ${i.name} — ${i.size ?? ""} × ${i.quantity} = ${(i.price * i.quantity).toLocaleString("fr-FR")} ${site.currency}`,
			),
			``,
			`Total : ${total.toLocaleString("fr-FR")} ${site.currency}`,
			`Paiement : ${order.payment}`,
			``,
			`Client : ${order.customerName}`,
			`Téléphone : ${order.customerPhone}`,
			order.customerEmail ? `Email : ${order.customerEmail}` : null,
			order.city ? `Ville : ${order.city}` : null,
			order.address ? `Adresse : ${order.address}` : null,
			order.notes ? `Notes : ${order.notes}` : null,
		].filter(Boolean);
		const text = encodeURIComponent(lines.join("\n"));
		const whatsapp = `https://wa.me/${site.whatsapp.chat}?text=${text}`;

		posthogLogger?.emit({
			body: "Checkout order created",
			severityNumber: SeverityNumber.INFO,
			attributes: {
				endpoint: "/api/checkout",
				item_count: items.length,
				currency: site.currency,
			},
		});
		flushPosthogLogs();

		after(() =>
			notifyStaffNewOrder({
				number: order.number,
				customerName: order.customerName,
				customerPhone: order.customerPhone,
				items: pricedItems,
				total,
			}),
		);

		return NextResponse.json({
			order: { number: order.number, total },
			whatsapp,
		});
	} catch (e) {
		posthogLogger?.emit({
			body: "Checkout order creation failed",
			severityNumber: SeverityNumber.ERROR,
			attributes: { endpoint: "/api/checkout" },
		});
		flushPosthogLogs();
		console.error("POST /api/checkout failed", e);
		return NextResponse.json(
			{ error: "Commande impossible." },
			{ status: 500 },
		);
	}
}

function flushPosthogLogs() {
	if (posthogLoggerProvider) {
		after(async () => {
			await posthogLoggerProvider.forceFlush().catch(() => {});
		});
	}
}

async function getOrderUserId(
	user: NonNullable<Awaited<ReturnType<typeof getCurrentUser>>>,
) {
	if (!process.env.DATABASE_URL?.startsWith("file:")) return user.id;
	const localUser = await db.user.upsert({
		where: { email: user.email },
		update: { supabaseId: user.supabaseId, name: user.name, role: user.role },
		create: {
			supabaseId: user.supabaseId,
			email: user.email,
			name: user.name,
			role: user.role,
		},
		select: { id: true },
	});
	return localUser.id;
}

async function createOrderWithNumber(
	data: Omit<Prisma.OrderUncheckedCreateInput, "number">,
) {
	for (let attempt = 0; ; attempt++) {
		const count = await db.order.count();
		try {
			return await db.order.create({
				data: { ...data, number: `MT-${1001 + count + attempt}` },
			});
		} catch (e) {
			const collision =
				e instanceof Prisma.PrismaClientKnownRequestError && e.code === "P2002";
			if (!collision || attempt >= 4) throw e;
		}
	}
}

function buildWhatsappLink(
	order: {
		number: string;
		total: number;
		customerName: string;
		customerPhone: string;
		customerEmail: string | null;
		city: string | null;
		address: string | null;
		notes: string | null;
		payment: string;
		items: {
			name: string;
			size: string | null;
			price: number;
			quantity: number;
		}[];
	},
	siteCfg: typeof site,
) {
	const lines = [
		`Bonjour Maison Titrit 👋`,
		``,
		`Nouvelle commande ${order.number}`,
		``,
		...order.items.map(
			(i) =>
				`• ${i.name} — ${i.size ?? ""} × ${i.quantity} = ${(i.price * i.quantity).toLocaleString("fr-FR")} ${siteCfg.currency}`,
		),
		``,
		`Total : ${order.total.toLocaleString("fr-FR")} ${siteCfg.currency}`,
		`Paiement : ${order.payment}`,
		``,
		`Client : ${order.customerName}`,
		`Téléphone : ${order.customerPhone}`,
		order.customerEmail ? `Email : ${order.customerEmail}` : null,
		order.city ? `Ville : ${order.city}` : null,
		order.address ? `Adresse : ${order.address}` : null,
		order.notes ? `Notes : ${order.notes}` : null,
	].filter(Boolean);
	const text = encodeURIComponent(lines.join("\n"));
	return `https://wa.me/${siteCfg.whatsapp.chat}?text=${text}`;
}
