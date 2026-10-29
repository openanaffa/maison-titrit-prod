import { NextResponse, after } from "next/server";
import { rejectBots } from "@/lib/bot";
import { db } from "@/lib/db";
import { getCurrentUser } from "@/lib/session";
import { site } from "@/config/site";
import { parseCartLines, priceCart } from "@/lib/checkout";
import { notifyStaffNewOrder } from "@/lib/notify";
import { Prisma } from "@prisma/client";

export const dynamic = "force-dynamic";

/**
 * Create an order from the client cart (COD).
 * Body: { items: [{productId, qty, size}], customer: {name, phone, email, city, address, notes} }
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

    if (!cartLines) {
      return NextResponse.json({ error: "Panier vide ou invalide." }, { status: 400 });
    }
    if (typeof customer.name !== "string" || typeof customer.phone !== "string" ||
        !customer.name.trim() || !customer.phone.trim()) {
      return NextResponse.json({ error: "Nom et téléphone requis." }, { status: 400 });
    }

    const products = await db.product.findMany({
      where: { id: { in: cartLines.map((l) => l.productId) } },
      select: { id: true, ref: true, name: true, price: true, salePrice: true, inStock: true, sizes: true },
    });
    const priced = priceCart(cartLines, products);
    if (!priced.ok) {
      return NextResponse.json({ error: priced.error }, { status: 409 });
    }
    const { items, total } = priced;

    const order = await createOrderWithNumber({
        status: "PENDING",
        customerName: customer.name.trim(),
        customerPhone: customer.phone.trim(),
        customerEmail: customer.email?.trim() || null,
        city: customer.city?.trim() || null,
        address: customer.address?.trim() || null,
        notes: customer.notes?.trim() || null,
        total,
        currency: site.currency,
        payment: "COD",
        userId: user?.id ?? null,
        items: { create: items },
    });

    // Note: GA4/Meta purchase tracking happens client-side on the checkout
    // success screen (consent-gated). Here we just persist the order.

    // Build the WhatsApp summary deeplink
    const lines = [
      `Bonjour Maison Titrit 👋`,
      ``,
      `Nouvelle commande ${order.number}`,
      ``,
      ...items.map(
        (i) => `• ${i.name} — ${i.size ?? ""} × ${i.quantity} = ${(i.price * i.quantity).toLocaleString("fr-FR")} ${site.currency}`,
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

    after(() => notifyStaffNewOrder({
      number: order.number,
      customerName: order.customerName,
      customerPhone: order.customerPhone,
      items: items.map(({ name, size, price, quantity }) => ({ name, size, price, quantity })),
      total,
    }));

    return NextResponse.json({ order: { number: order.number, total }, whatsapp });
  } catch (e) {
    console.error("POST /api/checkout failed", e);
    return NextResponse.json({ error: "Commande impossible." }, { status: 500 });
  }
}

/**
 * Human-friendly sequential number (MT-1042). Concurrent checkouts can pick the
 * same count; the unique index rejects the loser, which retries with a fresh count.
 */
async function createOrderWithNumber(data: Omit<Prisma.OrderUncheckedCreateInput, "number">) {
  for (let attempt = 0; ; attempt++) {
    const count = await db.order.count();
    try {
      return await db.order.create({ data: { ...data, number: `MT-${1001 + count + attempt}` } });
    } catch (e) {
      const collision = e instanceof Prisma.PrismaClientKnownRequestError && e.code === "P2002";
      if (!collision || attempt >= 4) throw e;
    }
  }
}
