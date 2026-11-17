import { FolderTree, LayoutDashboard, Megaphone, Package, PenLine, Settings, ShoppingCart, Tags, UserCog, Users } from "lucide-react";
import type { AdminNavItem, AnalyticsForm, VerificationForm } from ".";

export const ROLE_BADGE: Record<string, string> = {
  FOUNDER: "bg-bronze/15 text-bronze",
  DEVELOPER: "bg-terracotta/15 text-terracotta",
  ADMIN: "bg-henna/15 text-henna",
  MANAGER: "bg-ink/10 text-ink dark:bg-cream/10 dark:text-cream",
  MARKETER: "bg-olive/15 text-olive",
  CUSTOMER: "bg-ink/5 text-ink-soft dark:bg-cream/5 dark:text-cream/60",
};

export const STATUS_STYLES: Record<string, string> = {
  PENDING: "bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-200",
  CONFIRMED: "bg-blue-100 text-blue-800 dark:bg-blue-900/40 dark:text-blue-200",
  SHIPPED: "bg-indigo-100 text-indigo-800 dark:bg-indigo-900/40 dark:text-indigo-200",
  DELIVERED: "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-200",
  CANCELLED: "bg-rose-100 text-rose-800 dark:bg-rose-900/40 dark:text-rose-200",
};

export const STATUS_LABELS: Record<string, string> = {
  PENDING: "En attente",
  CONFIRMED: "Confirmée",
  SHIPPED: "Expédiée",
  DELIVERED: "Livrée",
  CANCELLED: "Annulée",
};

export const DAYS = [
  { key: "mon-fri", label: "Lundi — Vendredi" },
  { key: "sat", label: "Samedi" },
  { key: "sun", label: "Dimanche" },
];
export type DaysT = typeof DAYS

export const FLOW: string[] = ["PENDING", "CONFIRMED", "SHIPPED", "DELIVERED", "CANCELLED"];

export const mad = (n: number) => `${n.toLocaleString("fr-FR")} Dhs`;



export const EMPTY_ANALYTICS: AnalyticsForm = { gtmId: "", ga4Id: "", fbPixelId: "", pinterestTagId: "", tiktokPixelId: "", youtubeChannelId: "" };
export const EMPTY_VERIFICATION: VerificationForm = {
  google: "",
  facebook: "",
  instagram: "",
  tiktok: "",
  customText: "",
};

export const VERIFICATION_HINTS: { key: keyof Omit<VerificationForm, "customText">; label: string; meta: string }[] = [
  { key: "google", label: "Google Search Console", meta: "google-site-verification" },
  { key: "facebook", label: "Facebook (Meta)", meta: "facebook-domain-verification" },
  { key: "instagram", label: "Instagram", meta: "instagram-site-verification" },
  { key: "tiktok", label: "TikTok", meta: "tiktok-domain-verification" },
];

export const ADMIN_NAV: AdminNavItem[] = [
  { href: "/makteb", icon: LayoutDashboard, labelKey: "admin.nav.dashboard" },
  { href: "/makteb/marketing", icon: Megaphone, labelKey: "admin.nav.marketing" },
  { href: "/makteb/tags", icon: Tags, labelKey: "admin.nav.tags", permission: "integrations:write" },
  { href: "/makteb/products", icon: Package, labelKey: "admin.nav.products", badgeKey: "products", permission: "products:read" },
  { href: "/makteb/orders", icon: ShoppingCart, labelKey: "admin.nav.orders", badgeKey: "pendingOrders", permission: "orders:read" },
  { href: "/makteb/categories", icon: FolderTree, labelKey: "admin.nav.categories", badgeKey: "categories", permission: "categories:read" },
  { href: "/makteb/blog", icon: PenLine, labelKey: "admin.nav.blog" },
  { href: "/makteb/customers", icon: Users, labelKey: "admin.nav.customers", badgeKey: "customers", permission: "customers:read" },
  { href: "/makteb/team", icon: UserCog, labelKey: "admin.nav.team", permission: "users:manage" },
  { href: "/makteb/settings", icon: Settings, labelKey: "admin.nav.settings", permission: "settings:write" },
];
