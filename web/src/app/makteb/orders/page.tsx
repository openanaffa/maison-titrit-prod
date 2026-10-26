import { db } from "@/lib/db";
import { OrdersTableClient } from "@/components/admin/orders-table-client";

export const dynamic = "force-dynamic";

export default async function MaktebOrdersPage() {
  const orders = await db.order.findMany({
    orderBy: { createdAt: "desc" },
    include: { items: true, user: true },
  });

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
    createdAt: o.createdAt.toISOString(),
    itemCount: o.items.length,
    userId: o.userId ?? null,
    userName: o.user?.name ?? null,
  }));

  return <OrdersTableClient rows={rows} />;
}
