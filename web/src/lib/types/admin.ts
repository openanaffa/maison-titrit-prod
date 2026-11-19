/** Admin/backoffice shapes: nav, team, dashboard stats and auth errors. */
import type { Permission } from "../roles";

export type TeamUser = {
	id: string;
	email: string;
	name: string | null;
	role: string;
	supabaseId: string | null;
	createdAt: string;
};

export type AdminNavItem = {
	href: string;
	icon: React.ElementType;
	labelKey: string;
	badgeKey?: "pendingOrders" | "products" | "customers" | "categories";
	permission?: Permission;
};

export type AdminUser = {
	id: string;
	name: string | null;
	email: string;
	role: string;
	image?: string | null;
	phone?: string | null;
};

export type ErrorParams = {
	error: string | null;
	code: string | null;
	description: string | null;
};

export type Stat = {
	products: number;
	orders: number;
	pendingOrders: number;
	customers: number;
	featured: number;
	outOfStock: number;
	revenue: number;
};

export type RecentOrder = {
	id: string;
	number: string;
	customerName: string;
	total: number;
	status: string;
	createdAt: string;
	itemCount: number;
};

export type AnalyticsForm = {
	gtmId: string;
	ga4Id: string;
	fbPixelId: string;
	pinterestTagId: string;
	tiktokPixelId: string;
	youtubeChannelId: string;
};

export type VerificationForm = {
	google: string;
	facebook: string;
	instagram: string;
	tiktok: string;
	customText: string; // paste <meta …> tags — parsed server-side
};
