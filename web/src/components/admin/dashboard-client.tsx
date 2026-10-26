"use client";

import Link from "next/link";
import { Package, ShoppingCart, Users, TrendingUp, AlertCircle, Star, ArrowRight } from "lucide-react";
import { useT } from "@/i18n/locale-provider";
import { StatusBadge } from "@/components/admin/status-badge";

type Stat = {
  products: number;
  orders: number;
  pendingOrders: number;
  customers: number;
  featured: number;
  outOfStock: number;
  revenue: number;
};
type RecentOrder = {
  id: string;
  number: string;
  customerName: string;
  total: number;
  status: string;
  createdAt: string;
  itemCount: number;
};

export function DashboardClient({
  user,
  stats,
  recent,
}: {
  user: { name: string | null; email: string; role: string } | null;
  stats: Stat;
  recent: RecentOrder[];
}) {
  const { t } = useT();
  const cards = [
    { key: "products", icon: Package, value: stats.products, label: t("admin.dashboard.products"), href: "/makteb/products" },
    { key: "orders", icon: ShoppingCart, value: stats.orders, label: t("admin.dashboard.orders"), sub: `${stats.pendingOrders} ${t("admin.dashboard.pending")}`, href: "/makteb/orders" },
    { key: "revenue", icon: TrendingUp, value: `${stats.revenue.toLocaleString("fr-FR")} MAD`, label: t("admin.dashboard.revenue"), href: "/makteb/orders" },
    { key: "customers", icon: Users, value: stats.customers, label: t("admin.dashboard.customers"), href: "/makteb/customers" },
    { key: "featured", icon: Star, value: stats.featured, label: t("admin.dashboard.featured"), href: "/makteb/products" },
    { key: "lowStock", icon: AlertCircle, value: stats.outOfStock, label: t("admin.dashboard.lowStock"), href: "/makteb/products" },
  ];

  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-display text-3xl font-semibold text-ink dark:text-cream">
          {t("admin.dashboard.welcome", { name: user?.name || user?.email || "" })}
        </h1>
        <p className="mt-1 font-serif text-base text-ink-soft dark:text-cream/70">
          {t("admin.dashboard.subtitle")}
        </p>
      </div>

      {/* Stat cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {cards.map((c) => {
          const Icon = c.icon;
          return (
            <Link
              key={c.key}
              href={c.href}
              className="card-vintage group rounded-sm p-5 transition-all hover:-translate-y-0.5"
            >
              <div className="flex items-start justify-between">
                <div>
                  <p className="font-label text-[0.62rem] uppercase tracking-[0.2em] text-bronze">
                    {c.label}
                  </p>
                  <p className="mt-2 font-display text-3xl font-semibold text-ink dark:text-cream">
                    {c.value}
                  </p>
                  {"sub" in c && c.sub && (
                    <p className="mt-1 font-serif text-xs text-ink-soft/80 dark:text-cream/60">
                      {c.sub}
                    </p>
                  )}
                </div>
                <span className="inline-flex size-9 items-center justify-center rounded-full bg-bronze/15 text-bronze transition-colors group-hover:bg-terracotta group-hover:text-cream">
                  <Icon className="size-4" />
                </span>
              </div>
            </Link>
          );
        })}
      </div>

      {/* Recent orders */}
      <div className="card-vintage rounded-sm">
        <div className="flex items-center justify-between border-b border-bronze/20 p-5">
          <h2 className="font-display text-lg font-semibold text-ink dark:text-cream">
            {t("admin.dashboard.recentOrders")}
          </h2>
          <Link
            href="/makteb/orders"
            className="inline-flex items-center gap-1 font-label text-[0.62rem] uppercase tracking-[0.18em] text-bronze hover:text-terracotta"
          >
            {t("admin.orders.title")} <ArrowRight className="size-3" />
          </Link>
        </div>
        {recent.length === 0 ? (
          <p className="p-6 font-serif text-sm text-ink-soft dark:text-cream/70">
            {t("admin.dashboard.noOrders")}
          </p>
        ) : (
          <ul className="divide-y divide-bronze/15">
            {recent.map((o) => (
              <li key={o.id} className="flex items-center justify-between p-4">
                <div className="min-w-0">
                  <p className="font-display text-sm font-semibold text-ink dark:text-cream">
                    {o.number} · {o.customerName}
                  </p>
                  <p className="font-serif text-xs text-ink-soft dark:text-cream/60">
                    {new Date(o.createdAt).toLocaleDateString("fr-FR")} · {o.itemCount} article(s)
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <span className="font-display text-sm font-semibold text-ink dark:text-cream">
                    {o.total.toLocaleString("fr-FR")} MAD
                  </span>
                  <StatusBadge status={o.status} />
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
