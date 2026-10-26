"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut } from "next-auth/react";
import {
  LayoutDashboard,
  Package,
  ShoppingCart,
  FolderTree,
  Users,
  Settings,
  LogOut,
  Menu,
  X,
  Sparkles,
  ExternalLink,
  PenLine,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useT } from "@/i18n/locale-provider";

type NavItem = {
  href: string;
  icon: React.ElementType;
  labelKey: string;
  badgeKey?: "pendingOrders" | "products" | "customers" | "categories";
  founderOnly?: boolean;
};

const NAV: NavItem[] = [
  { href: "/makteb", icon: LayoutDashboard, labelKey: "admin.nav.dashboard" },
  { href: "/makteb/products", icon: Package, labelKey: "admin.nav.products", badgeKey: "products" },
  { href: "/makteb/orders", icon: ShoppingCart, labelKey: "admin.nav.orders", badgeKey: "pendingOrders" },
  { href: "/makteb/categories", icon: FolderTree, labelKey: "admin.nav.categories", badgeKey: "categories" },
  { href: "/makteb/blog", icon: PenLine, labelKey: "admin.nav.blog" },
  { href: "/makteb/customers", icon: Users, labelKey: "admin.nav.customers", badgeKey: "customers", founderOnly: true },
  { href: "/makteb/settings", icon: Settings, labelKey: "admin.nav.settings", founderOnly: true },
];

type AdminUser = { id: string; name: string | null; email: string; role: string; image?: string | null; phone?: string | null };

export function AdminShell({
  user,
  stats,
  children,
}: {
  user: AdminUser;
  stats: { products: number; pendingOrders: number; customers: number; categories: number };
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const { t } = useT();
  const [open, setOpen] = React.useState(false);

  const isFounder = user.role === "FOUNDER";
  const items = NAV.filter((n) => !n.founderOnly || isFounder);

  return (
    <div className="flex min-h-screen bg-background text-foreground">
      {/* Sidebar */}
      <aside
        className={cn(
          "fixed inset-y-0 start-0 z-50 flex w-64 flex-col border-e border-border bg-sidebar text-sidebar-foreground transition-transform duration-300 lg:static lg:translate-x-0",
          open ? "translate-x-0" : "-translate-x-full lg:translate-x-0",
        )}
      >
        {/* Brand */}
        <div className="flex h-16 items-center justify-between border-b border-sidebar-border px-5">
          <Link href="/makteb" className="flex items-center gap-2.5">
            <img
              src="/assets/titrit-logo-gold.svg"
              alt=""
              aria-hidden="true"
              className="titrit-logo-mark h-8 w-8"
              draggable={false}
            />
            <div className="flex flex-col leading-none">
              <span className="wordmark text-sm uppercase text-ink dark:text-cream">
                Maison Titrit
              </span>
              <span className="font-label text-[0.52rem] uppercase tracking-[0.22em] text-bronze">
                / makteb
              </span>
            </div>
          </Link>
          <button
            onClick={() => setOpen(false)}
            className="lg:hidden"
            aria-label="Fermer"
          >
            <X className="size-5" />
          </button>
        </div>

        {/* Nav */}
        <nav className="flex-1 space-y-1 overflow-y-auto p-3">
          {items.map((item) => {
            const active = pathname === item.href || (item.href !== "/makteb" && pathname.startsWith(item.href));
            const Icon = item.icon;
            const badge = item.badgeKey ? stats[item.badgeKey] : undefined;
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setOpen(false)}
                className={cn(
                  "flex items-center gap-3 rounded-sm px-3 py-2.5 font-label text-[0.72rem] uppercase tracking-[0.14em] transition-colors",
                  active
                    ? "bg-sidebar-accent text-sidebar-accent-foreground"
                    : "text-sidebar-foreground/80 hover:bg-sidebar-accent/60 hover:text-sidebar-accent-foreground",
                )}
              >
                <Icon className="size-4" />
                <span className="flex-1">{t(item.labelKey)}</span>
                {badge !== undefined && badge > 0 && (
                  <span className="rounded-full bg-terracotta px-1.5 py-0.5 text-[0.55rem] text-cream">
                    {badge}
                  </span>
                )}
              </Link>
            );
          })}
        </nav>

        {/* Footer — view site + sign out */}
        <div className="border-t border-sidebar-border p-3">
          <Link
            href="/"
            className="flex items-center gap-3 rounded-sm px-3 py-2.5 font-label text-[0.68rem] uppercase tracking-[0.14em] text-sidebar-foreground/70 transition-colors hover:bg-sidebar-accent/60"
          >
            <ExternalLink className="size-4" />
            Voir le site
          </Link>
          <button
            onClick={() => signOut({ callbackUrl: "/" })}
            className="flex w-full items-center gap-3 rounded-sm px-3 py-2.5 font-label text-[0.68rem] uppercase tracking-[0.14em] text-sidebar-foreground/70 transition-colors hover:bg-terracotta hover:text-cream"
          >
            <LogOut className="size-4" />
            Déconnexion
          </button>
        </div>
      </aside>

      {/* Mobile overlay */}
      {open && (
        <button
          aria-label="Fermer"
          onClick={() => setOpen(false)}
          className="fixed inset-0 z-40 bg-ink/40 lg:hidden"
        />
      )}

      {/* Main */}
      <div className="flex min-w-0 flex-1 flex-col">
        <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b border-border bg-background/90 px-4 backdrop-blur sm:px-6">
          <button
            onClick={() => setOpen(true)}
            className="lg:hidden"
            aria-label="Menu"
          >
            <Menu className="size-5" />
          </button>
          <div className="hidden font-label text-[0.62rem] uppercase tracking-[0.22em] text-bronze sm:block">
            Tableau de bord · {user.role}
          </div>
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2.5">
              <div className="flex size-8 items-center justify-center rounded-full bg-bronze/20 font-display text-sm font-semibold text-bronze">
                {(user.name?.[0] || user.email[0]).toUpperCase()}
              </div>
              <div className="hidden flex-col leading-none sm:flex">
                <span className="font-serif text-sm text-ink dark:text-cream">
                  {user.name || user.email}
                </span>
                <span className="font-label text-[0.54rem] uppercase tracking-[0.18em] text-bronze">
                  {user.role}
                </span>
              </div>
            </div>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">{children}</main>
      </div>
    </div>
  );
}
