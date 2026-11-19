import { requirePagePermission } from "@/lib/session";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

export default async function MaktebCustomersPage() {
	await requirePagePermission("customers:read");
	const supabase = await createSupabaseServerClient();
	const { data: customers } = await supabase
		.from("User")
		.select("id,name,email,createdAt")
		.eq("role", "CUSTOMER")
		.order("createdAt", { ascending: false })
		.throwOnError();
	const customerIds = customers.map((customer) => customer.id);
	const { data: orders } = customerIds.length
		? await supabase
				.from("Order")
				.select("userId")
				.in("userId", customerIds)
				.throwOnError()
		: { data: [] };
	const orderCountByUser = new Map<string, number>();
	for (const order of orders) {
		if (order.userId) {
			orderCountByUser.set(
				order.userId,
				(orderCountByUser.get(order.userId) ?? 0) + 1,
			);
		}
	}

	return (
		<div className="space-y-6">
			<div>
				<h1 className="heading-vintage-lg">Clients</h1>
				<p className="mt-1 body-vintage">Comptes clients inscrits.</p>
			</div>

			<div className="card-vintage overflow-hidden rounded-sm">
				<div className="overflow-x-auto">
					<table className="w-full text-sm">
						<thead className="border-b border-bronze/20 bg-muted/40">
							<tr>
								<th className="p-3 text-start label-vintage-wide">Client</th>
								<th className="p-3 text-start label-vintage-wide">Email</th>
								<th className="p-3 text-end label-vintage-wide">Commandes</th>
								<th className="p-3 text-start label-vintage-wide">
									Inscrit le
								</th>
							</tr>
						</thead>
						<tbody className="divide-y divide-bronze/15">
							{customers.length === 0 ? (
								<tr>
									<td
										colSpan={4}
										className="p-10 text-center body-vintage-muted"
									>
										Aucun client inscrit pour l'instant.
									</td>
								</tr>
							) : (
								customers.map((c) => (
									<tr key={c.id} className="hover:bg-muted/30">
										<td className="p-3 heading-vintage-sm">
											<div className="flex items-center gap-2.5">
												<div className="flex size-8 items-center justify-center rounded-full bg-bronze/20 font-display text-xs font-semibold text-bronze">
													{(c.name?.[0] || c.email[0]).toUpperCase()}
												</div>
												{c.name || c.email}
											</div>
										</td>
										<td className="p-3 font-serif text-sm text-ink-soft dark:text-cream/80">
											{c.email}
										</td>
										<td className="p-3 text-end font-serif text-sm text-ink-soft dark:text-cream/80">
											{orderCountByUser.get(c.id) ?? 0}
										</td>
										<td className="p-3 font-serif text-xs text-ink-soft dark:text-cream/70">
											{new Date(c.createdAt).toLocaleDateString("fr-FR")}
										</td>
									</tr>
								))
							)}
						</tbody>
					</table>
				</div>
			</div>
		</div>
	);
}
