import { OrdersTableClient } from "@/components/admin/orders-table-client";
import { listOrders } from "@/lib/repositories/orders";
import { requirePagePermission } from "@/lib/session";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

export default async function MaktebOrdersPage({
	searchParams,
}: {
	searchParams: Promise<{ q?: string }>;
}) {
	await requirePagePermission("orders:read");
	const { q } = await searchParams;
	const supabase = await createSupabaseServerClient();
	const rows = await listOrders(supabase, {
		search: q ?? undefined,
	});

	return <OrdersTableClient rows={rows} />;
}
