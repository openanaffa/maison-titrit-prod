import { CustomersTableClient } from "@/components/admin/customers-table-client";
import { isCustomerSegment, listCustomers } from "@/lib/repositories/customers";
import { requirePagePermission } from "@/lib/session";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

export default async function MaktebCustomersPage({
	searchParams,
}: {
	searchParams: Promise<{ q?: string; segment?: string }>;
}) {
	await requirePagePermission("customers:read");
	const { q, segment } = await searchParams;
	const activeSegment = isCustomerSegment(segment) ? segment : undefined;
	const supabase = await createSupabaseServerClient();
	const rows = await listCustomers(supabase, {
		search: q ?? undefined,
		segment: activeSegment,
	});

	return (
		<CustomersTableClient
			rows={rows}
			activeSegment={activeSegment ?? ""}
			search={q ?? ""}
		/>
	);
}
