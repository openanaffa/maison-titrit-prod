import Link from "next/link";
import { Customer360Client } from "@/components/admin/customer-360-client";
import { recordCustomerAudit } from "@/lib/customer-audit";
import { getCustomer360 } from "@/lib/repositories/customers";
import { getCurrentUser, requirePagePermission } from "@/lib/session";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

export default async function MaktebCustomerDetailPage({
	params,
}: {
	params: Promise<{ id: string }>;
}) {
	await requirePagePermission("customers:read");
	const { id } = await params;
	const supabase = await createSupabaseServerClient();
	const customer = await getCustomer360(supabase, id);
	// Privacy: every access of a customer's 360 view is audited (#122).
	const user = await getCurrentUser();
	if (customer && user) {
		await recordCustomerAudit("VIEW_CUSTOMER", {
			userId: customer.id,
			actorId: user.id,
		});
	}
	if (!customer) {
		return (
			<p className="body-vintage-muted p-10 text-center">
				<Link href="/makteb/customers" className="hover:underline">
					Client introuvable.
				</Link>
			</p>
		);
	}

	return <Customer360Client customer={customer} />;
}
