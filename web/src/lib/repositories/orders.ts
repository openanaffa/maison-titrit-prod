import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/lib/supabase/database.types";
import type { OrderView } from "@/lib/types";

type OrderRow = Database["public"]["Tables"]["Order"]["Row"];
type OrderUpdate = Database["public"]["Tables"]["Order"]["Update"];
type OrderItemRow = Database["public"]["Tables"]["OrderItem"]["Row"];
type ImageRow = Database["public"]["Tables"]["Image"]["Row"];
type UserRow = Database["public"]["Tables"]["User"]["Row"];

type OrderListRow = {
	id: string;
	number: string;
	customerName: string;
	customerPhone: string;
	customerEmail: string;
	city: string;
	address: string;
	notes: string;
	total: number;
	currency: string;
	status: string;
	payment: string;
	createdAt: string;
	itemCount: number;
	userId: string | null;
	userName: string | null;
};

type MarketingOrderRow = {
	id: string;
	number: string;
	status: string;
	total: number;
	currency: string;
	utmSource: string | null;
	utmMedium: string | null;
	utmCampaign: string | null;
	createdAt: string;
};

/**
 * Order repository — port for order data access.
 *
 * Exported as named async functions so they can be imported by route handlers
 * without tripping Next.js server-actions validation on non-function exports.
 */

/** List orders, newest first, with optional status and text search. */
export async function listOrders(
	supabase: SupabaseClient<Database>,
	opts: { status?: string; search?: string } = {},
): Promise<OrderListRow[]> {
	let query = supabase
		.from("Order")
		.select("*")
		.order("createdAt", { ascending: false });
	if (opts.status) query = query.eq("status", opts.status);
	if (opts.search) {
		const term = opts.search.replace(/[,%()]/g, "");
		query = query.or(
			`number.ilike.%${term}%,customerName.ilike.%${term}%,customerPhone.ilike.%${term}%`,
		);
	}
	const { data: orders, error } = await query.throwOnError();
	if (error) throw error;
	const orderRows = (orders ?? []) as OrderRow[];

	const orderIds = orderRows.map((order) => order.id);
	const userIds = [
		...new Set(orderRows.flatMap((o) => (o.userId ? [o.userId] : []))),
	];

	const { data: items } = orderIds.length
		? await supabase
				.from("OrderItem")
				.select("id,orderId")
				.in("orderId", orderIds)
				.throwOnError()
		: { data: [] as { id: string; orderId: string }[] };
	const { data: users } = userIds.length
		? await supabase
				.from("User")
				.select("id,name")
				.in("id", userIds)
				.throwOnError()
		: { data: [] as { id: string; name: string | null }[] };

	const itemCountByOrder = new Map<string, number>();
	for (const item of items ?? []) {
		itemCountByOrder.set(
			item.orderId,
			(itemCountByOrder.get(item.orderId) ?? 0) + 1,
		);
	}
	const userById = new Map((users ?? []).map((row) => [row.id, row]));

	return orderRows.map((o) => ({
		id: o.id,
		number: o.number,
		customerName: o.customerName,
		customerPhone: o.customerPhone,
		customerEmail: o.customerEmail ?? "",
		city: o.city ?? "",
		address: o.address ?? "",
		notes: o.notes ?? "",
		total: o.total,
		currency: o.currency,
		status: o.status,
		payment: o.payment,
		createdAt: o.createdAt,
		itemCount: itemCountByOrder.get(o.id) ?? 0,
		userId: o.userId ?? null,
		userName: userById.get(o.userId ?? "")?.name ?? null,
	}));
}

/** List orders with UTM fields for attribution reporting, newest first. */
export async function listMarketingOrders(
	supabase: SupabaseClient<Database>,
): Promise<MarketingOrderRow[]> {
	const { data, error } = await supabase
		.from("Order")
		.select(
			"id,number,status,total,currency,utmSource,utmMedium,utmCampaign,createdAt",
		)
		.order("createdAt", { ascending: false })
		.throwOnError();
	return (data ?? []) as MarketingOrderRow[];
}

/** Get a single order with its items, customer and product images. */
export async function getOrder(supabase: SupabaseClient<Database>, id: string) {
	const { data: order, error } = await supabase
		.from("Order")
		.select("*")
		.eq("id", id)
		.maybeSingle()
		.throwOnError();
	if (!order) return null;

	const { data: items, error: itemsError } = await supabase
		.from("OrderItem")
		.select("*")
		.eq("orderId", order.id)
		.throwOnError();
	if (itemsError) throw itemsError;

	const productIds = [...new Set(items.map((item) => item.productId))];
	const imagesByProduct = new Map<string, Array<{ url: string }>>();
	if (productIds.length) {
		const { data: images, error: imagesError } = await supabase
			.from("Image")
			.select("productId,url,position")
			.in("productId", productIds)
			.order("position")
			.throwOnError();
		if (imagesError) throw imagesError;
		for (const image of images ?? []) {
			const rows = imagesByProduct.get(image.productId) ?? [];
			rows.push({ url: image.url });
			imagesByProduct.set(image.productId, rows);
		}
	}

	let user: { id: string; name: string } | null = null;
	if (order.userId) {
		const { data: userResult } = await supabase
			.from("User")
			.select("id,name")
			.eq("id", order.userId)
			.maybeSingle()
			.throwOnError();
		if (userResult && userResult.name) {
			user = { id: userResult.id, name: userResult.name };
		}
	}

	const view: OrderView = {
		id: order.id,
		number: order.number,
		status: order.status,
		customerName: order.customerName,
		customerPhone: order.customerPhone,
		customerEmail: order.customerEmail ?? null,
		city: order.city ?? null,
		address: order.address ?? null,
		notes: order.notes ?? null,
		total: order.total,
		currency: order.currency,
		payment: order.payment,
		utmSource: order.utmSource ?? null,
		utmMedium: order.utmMedium ?? null,
		utmCampaign: order.utmCampaign ?? null,
		utmContent: order.utmContent ?? null,
		utmTerm: order.utmTerm ?? null,
		createdAt: new Date(order.createdAt),
		updatedAt: new Date(order.updatedAt),
		user,
		items: items.map((i) => ({
			id: i.id,
			ref: i.ref,
			name: i.name,
			size: i.size ?? null,
			price: i.price,
			quantity: i.quantity,
			product: {
				id: i.productId,
				images: imagesByProduct.get(i.productId) ?? [],
			},
		})),
	};
	return view;
}

/** Update an order's status. */
export async function updateStatus(
	supabase: SupabaseClient<Database>,
	id: string,
	status: string,
) {
	const { data, error } = await supabase
		.from("Order")
		.update({ status, updatedAt: new Date().toISOString() })
		.eq("id", id)
		.select("*")
		.single()
		.throwOnError();
	return data as OrderRow;
}
