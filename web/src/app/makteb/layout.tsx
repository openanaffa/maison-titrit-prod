import { redirect } from "next/navigation";
import { AdminShell } from "@/components/admin/admin-shell";
import { isStaffRole } from "@/lib/roles";
import { getCurrentUser } from "@/lib/session";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

export default async function MaktebLayout({
	children,
}: {
	children: React.ReactNode;
}) {
	const user = await getCurrentUser();
	if (!user) redirect("/auth/signin?callbackUrl=/makteb");
	const ok = isStaffRole(user.role);
	if (!ok) redirect("/compte");

	// counts for sidebar badges
	const supabase = await createSupabaseServerClient();
	const [
		productsResult,
		pendingOrdersResult,
		customersResult,
		categoriesResult,
		fulfilmentQueueResult,
	] = await Promise.all([
		supabase
			.from("Product")
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
			.from("Category")
			.select("id", { count: "exact", head: true })
			.throwOnError(),
		supabase
			.from("Order")
			.select("id", { count: "exact", head: true })
			.in("status", ["PENDING", "CONFIRMED", "PROCESSING"])
			.throwOnError(),
	]);

	return (
		<AdminShell
			user={user}
			stats={{
				products: productsResult.count ?? 0,
				pendingOrders: pendingOrdersResult.count ?? 0,
				customers: customersResult.count ?? 0,
				categories: categoriesResult.count ?? 0,
				fulfilmentQueue: fulfilmentQueueResult.count ?? 0,
			}}
		>
			{children}
		</AdminShell>
	);
}
