import { OrdersTableClient } from "@/components/admin/orders-table-client";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

export default async function MaktebOrdersPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  const { q } = await searchParams;
  const supabase = await createSupabaseServerClient();
  let ordersQuery = supabase.from("Order").select("*").order("createdAt", { ascending: false });
  if (q) {
    const term = q.replace(/[,%()]/g, "");
    ordersQuery = ordersQuery.or(
      `number.ilike.%${term}%,customerName.ilike.%${term}%,customerPhone.ilike.%${term}%`,
    );
  }
  const { data: orders } = await ordersQuery.throwOnError();
  const orderIds = orders.map((order) => order.id);
  const userIds = [...new Set(orders.flatMap((order) => order.userId ? [order.userId] : []))];
  const { data: items } = orderIds.length
    ? await supabase.from("OrderItem").select("id,orderId").in("orderId", orderIds).throwOnError()
    : { data: [] as { id: string; orderId: string }[] };
  const { data: users } = userIds.length
    ? await supabase.from("User").select("id,name").in("id", userIds).throwOnError()
    : { data: [] as { id: string; name: string | null }[] };
  const itemCountByOrder = new Map<string, number>();
  for (const item of items) {
    itemCountByOrder.set(item.orderId, (itemCountByOrder.get(item.orderId) ?? 0) + 1);
  }
  const userById = new Map(users.map((row) => [row.id, row]));

  const rows = orders.map((o) => ({
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

  return <OrdersTableClient rows={rows} />;
}
