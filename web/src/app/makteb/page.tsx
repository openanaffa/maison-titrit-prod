import Link from "next/link";
import { Package, ShoppingCart, Users, TrendingUp, AlertCircle, Star } from "lucide-react";
import { db } from "@/lib/db";
import { getCurrentUser } from "@/lib/session";
import { DashboardClient } from "@/components/admin/dashboard-client";

export const dynamic = "force-dynamic";

export default async function MaktebDashboard() {
  const user = await getCurrentUser();

  const [products, orders, pendingOrders, customers, featured, outOfStock, recentOrders] =
    await Promise.all([
      db.product.count(),
      db.order.count(),
      db.order.count({ where: { status: "PENDING" } }),
      db.user.count({ where: { role: "CUSTOMER" } }),
      db.product.count({ where: { featured: true } }),
      db.product.count({ where: { inStock: false } }),
      db.order.findMany({
        take: 6,
        orderBy: { createdAt: "desc" },
        include: { items: true },
      }),
    ]);

  // revenue last 30 days (sum of DELIVERED or all non-cancelled)
  const since = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
  const revenueRows = await db.order.findMany({
    where: { createdAt: { gte: since }, status: { not: "CANCELLED" } },
    select: { total: true },
  });
  const revenue = revenueRows.reduce((s, o) => s + o.total, 0);

  const stats = { products, orders, pendingOrders, customers, featured, outOfStock, revenue };
  const recent = recentOrders.map((o) => ({
    id: o.id,
    number: o.number,
    customerName: o.customerName,
    total: o.total,
    status: o.status,
    createdAt: o.createdAt.toISOString(),
    itemCount: o.items.length,
  }));

  return <DashboardClient user={user} stats={stats} recent={recent} />;
}
