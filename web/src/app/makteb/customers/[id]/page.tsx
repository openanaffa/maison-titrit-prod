import Link from "next/link";
import { CustomerNotesClient } from "@/components/admin/customer-notes-client";
import { recordCustomerAudit } from "@/lib/customer-audit";
import { digitsOf, getCustomer360 } from "@/lib/repositories/customers";
import { getCurrentUser, requirePagePermission } from "@/lib/session";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { STATUS_LABELS } from "@/lib/types/constants";

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
			<p className="body-vintage-muted p-10 text-center">Client introuvable.</p>
		);
	}

	return (
		<div className="space-y-6">
			<div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
				<div>
					<h1 className="heading-vintage-lg">
						{customer.name || customer.email}
					</h1>
					<p className="mt-1 body-vintage-muted">
						Inscrit le{" "}
						{new Date(customer.createdAt).toLocaleDateString("fr-FR")}
					</p>
				</div>
			</div>

			{/* Identity card */}
			<div className="card-vintage rounded-sm p-5 space-y-2">
				<p className="body-vintage-sm">
					<span className="label-vintage-tight">Email : </span>
					{customer.email}{" "}
					<span className="font-label text-[0.6rem] uppercase tracking-[0.12em] text-bronze">
						{customer.emailVerified ? "vérifié" : "non vérifié"}
					</span>
				</p>
				<p className="body-vintage-sm">
					<span className="label-vintage-tight">Téléphone : </span>
					{customer.phone ? (
						<>
							{customer.phone}
							<span className="ml-2 font-label text-[0.6rem] uppercase tracking-[0.12em] text-ink-soft dark:text-cream/60">
								{digitsOf(customer.phone)}
							</span>
							<span className="ml-2 font-label text-[0.6rem] uppercase tracking-[0.12em] text-ink-soft dark:text-cream/60">
								non vérifié
							</span>
						</>
					) : (
						"—"
					)}
				</p>
				<p className="body-vintage-sm">
					<span className="label-vintage-tight">Consentement marketing : </span>
					{customer.marketingConsent === "OPTED_IN"
						? "OPTED_IN"
						: customer.marketingConsent === "OPTED_OUT"
							? "OPTED_OUT"
							: "non défini"}
				</p>
				<CustomerNotesClient customerId={customer.id} notes={customer.notes} />
			</div>

			{/* Order history */}
			<div className="card-vintage overflow-hidden rounded-sm">
				<div className="overflow-x-auto">
					<table className="w-full text-sm">
						<thead className="border-b border-bronze/20 bg-muted/40">
							<tr>
								<th className="p-3 text-start label-vintage-wide">N°</th>
								<th className="p-3 text-start label-vintage-wide">Statut</th>
								<th className="p-3 text-end label-vintage-wide">Total</th>
								<th className="p-3 text-start label-vintage-wide">Lien</th>
								<th className="p-3 text-start label-vintage-wide">Date</th>
							</tr>
						</thead>
						<tbody className="divide-y divide-bronze/15">
							{customer.orders.length === 0 ? (
								<tr>
									<td
										colSpan={5}
										className="p-10 text-center body-vintage-muted"
									>
										Aucune commande.
									</td>
								</tr>
							) : (
								customer.orders.map((o) => (
									<tr key={o.id} className="hover:bg-muted/30">
										<td className="p-3 heading-vintage-sm">
											<Link
												href={`/makteb/orders/${o.id}`}
												className="hover:underline"
											>
												{o.number}
											</Link>
										</td>
										<td className="p-3 body-vintage-sm">
											{STATUS_LABELS[o.status] ?? o.status}
										</td>
										<td className="p-3 text-end font-serif text-sm">
											{o.total.toLocaleString("fr-FR")} {o.currency}
										</td>
										<td className="p-3">
											{o.linkedBy === "guest-match" ? (
												<span className="font-label text-[0.6rem] uppercase tracking-[0.12em] text-terracotta">
													correspondance tél./email (non vérifiée)
												</span>
											) : (
												<span className="font-label text-[0.6rem] uppercase tracking-[0.12em] text-olive">
													compte
												</span>
											)}
										</td>
										<td className="p-3 font-serif text-xs text-ink-soft dark:text-cream/70">
											{new Date(o.createdAt).toLocaleDateString("fr-FR")}
										</td>
									</tr>
								))
							)}
						</tbody>
					</table>
				</div>
			</div>

			{/* Notifications timeline */}
			{customer.notifications.length > 0 && (
				<div className="card-vintage rounded-sm p-5">
					<h2 className="heading-vintage-sm mb-3">Notifications client</h2>
					<ul className="space-y-2">
						{customer.notifications.slice(0, 10).map((n) => (
							<li
								key={n.id}
								className="body-vintage-sm flex flex-wrap items-center gap-2"
							>
								<span className="label-vintage-sm">{n.orderNumber}</span>
								<span className="label-vintage-sm">{n.channel}</span>
								<span className="label-vintage-sm">{n.event}</span>
								<span
									className={`font-label text-[0.6rem] uppercase tracking-[0.12em] ${n.status === "SENT" ? "text-olive" : n.status === "FAILED" ? "text-terracotta" : "text-ink-soft dark:text-cream/60"}`}
								>
									{n.status}
									{n.status === "FAILED" && n.attempts > 1
										? ` ×${n.attempts}`
										: ""}
								</span>
							</li>
						))}
					</ul>
				</div>
			)}

			{/* Audit trail */}
			<div className="card-vintage rounded-sm p-5">
				<h2 className="heading-vintage-sm mb-3">
					Journal d'accès et d'activité
				</h2>
				<ul className="space-y-2">
					{customer.audit.length === 0 ? (
						<li className="body-vintage-muted">Aucun évènement.</li>
					) : (
						customer.audit.map((a) => (
							<li
								key={a.id}
								className="body-vintage-sm flex flex-wrap items-center gap-2"
							>
								<span className="label-vintage-sm">{a.action}</span>
								{a.detail && (
									<span className="label-vintage-sm text-ink-soft dark:text-cream/60">
										{a.detail}
									</span>
								)}
								<span className="label-vintage-sm text-ink-soft dark:text-cream/60">
									— {a.actorName} ·{" "}
									{new Date(a.createdAt).toLocaleString("fr-FR")}
								</span>
							</li>
						))
					)}
				</ul>
			</div>
		</div>
	);
}
