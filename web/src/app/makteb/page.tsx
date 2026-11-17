import {
	AlertCircle,
	Package,
	ShoppingCart,
	Star,
	TrendingUp,
	Users,
} from "lucide-react";
import Link from "next/link";
import { DashboardClient } from "@/components/admin/dashboard-client";
import { getCurrentUser } from "@/lib/session";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

export default async function MaktebDashboard() {
	const user = await getCurrentUser();
	const supabase = await createSupabaseServerClient();

	const [
		productsResult,
		ordersResult,
		pendingOrdersResult,
		customersResult,
		featuredResult,
		outOfStockResult,
		recentOrdersResult,
	] = await Promise.all([
		supabase
			.from("Product")
			.select("id", { count: "exact", head: true })
			.throwOnError(),
		supabase
			.from("Order")
			.select("id", { count: "exact", head: true })
			.throwOnError(),
		supabase
			.from("Order")
			.select("id", { count: "exact", head: true })
			.eq("status", "PENDING")
			.throwOnError(),
		supabase
			.from("User")
			.select("id", { count: "exact", head: true })
			.eq("role", "CUSTOMER")
			.throwOnError(),
		supabase
			.from("Product")
			.select("id", { count: "exact", head: true })
			.eq("featured", true)
			.throwOnError(),
		supabase
			.from("Product")
			.select("id", { count: "exact", head: true })
			.eq("inStock", false)
			.throwOnError(),
		supabase
			.from("Order")
			.select("*")
			.order("createdAt", { ascending: false })
			.limit(6)
			.throwOnError(),
	]);
	const recentOrders = recentOrdersResult.data;
	const recentOrderIds = recentOrders.map((order) => order.id);
	const { data: recentItems } = recentOrderIds.length
		? await supabase
				.from("OrderItem")
				.select("orderId")
				.in("orderId", recentOrderIds)
				.throwOnError()
		: { data: [] };
	const itemCountByOrder = new Map<string, number>();
	for (const item of recentItems) {
		itemCountByOrder.set(
			item.orderId,
			(itemCountByOrder.get(item.orderId) ?? 0) + 1,
		);
	}

	// revenue last 30 days (sum of DELIVERED or all non-cancelled)
	const since = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
	const { data: revenueRows } = await supabase
		.from("Order")
		.select("total")
		.gte("createdAt", since.toISOString())
		.neq("status", "CANCELLED")
		.throwOnError();
	const revenue = revenueRows.reduce((s, o) => s + o.total, 0);

	const stats = {
		products: productsResult.count ?? 0,
		orders: ordersResult.count ?? 0,
		pendingOrders: pendingOrdersResult.count ?? 0,
		customers: customersResult.count ?? 0,
		featured: featuredResult.count ?? 0,
		outOfStock: outOfStockResult.count ?? 0,
		revenue,
	};
	const recent = recentOrders.map((o) => ({
		id: o.id,
		number: o.number,
		customerName: o.customerName,
		total: o.total,
		status: o.status,
		createdAt: o.createdAt,
		itemCount: itemCountByOrder.get(o.id) ?? 0,
	}));

	return <DashboardClient user={user} stats={stats} recent={recent} />;
}
