"use client";

import Link from "next/link";
import { CustomerNotesClient } from "@/components/admin/customer-notes-client";
import { useT } from "@/i18n/locale-provider";
import type { Customer360 } from "@/lib/repositories/customers";
import { STATUS_LABELS } from "@/lib/types/constants";

function useDateFormatter() {
	const { locale } = useT();
	return (iso: string) => {
		const tag = locale === "ar" ? "ar-MA" : locale === "en" ? "en-GB" : "fr-FR";
		return new Date(iso).toLocaleDateString(tag);
	};
}

export function Customer360Client({ customer }: { customer: Customer360 }) {
	const { t } = useT();
	const fmt = useDateFormatter();

	return (
		<div className="space-y-6">
			<div>
				<h1 className="heading-vintage-lg">
					{customer.name || customer.email}
				</h1>
				<p className="mt-1 body-vintage-muted">
					{t("admin.customers.detail.since")} {fmt(customer.createdAt)}
				</p>
			</div>

			{/* Identity card */}
			<div className="card-vintage rounded-sm p-5 space-y-2">
				<p className="body-vintage-sm">
					<span className="label-vintage-tight">
						{t("admin.customers.detail.email")}:{" "}
					</span>
					{customer.email}{" "}
					<span className="font-label text-[0.6rem] uppercase tracking-[0.12em] text-ink">
						{customer.emailVerified
							? t("admin.customers.verified")
							: t("admin.customers.unverified")}
					</span>
				</p>
				<p className="body-vintage-sm">
					<span className="label-vintage-tight">
						{t("admin.customers.detail.phone")}:{" "}
					</span>
					{customer.phone ? (
						<>
							{customer.phone}
							<span className="ml-2 font-label text-[0.6rem] uppercase tracking-[0.12em] text-ink-soft dark:text-cream/60">
								{t("admin.customers.unverified")}
							</span>
						</>
					) : (
						"—"
					)}
				</p>
				<p className="body-vintage-sm">
					<span className="label-vintage-tight">
						{t("admin.customers.detail.consent")}:{" "}
					</span>
					{customer.marketingConsent === "OPTED_IN"
						? t("admin.customers.consentIn")
						: customer.marketingConsent === "OPTED_OUT"
							? t("admin.customers.consentOut")
							: t("admin.customers.consentUnknown")}
				</p>
				<CustomerNotesClient customerId={customer.id} notes={customer.notes} />
			</div>

			{/* Order history */}
			<div className="card-vintage overflow-hidden rounded-sm">
				<div className="overflow-x-auto">
					<table className="w-full text-sm">
						<thead className="border-b border-bronze/20 bg-muted/40">
							<tr>
								<th className="p-3 text-start label-vintage-wide">
									{t("admin.orders.col.number")}
								</th>
								<th className="p-3 text-start label-vintage-wide">
									{t("admin.orders.col.status")}
								</th>
								<th className="p-3 text-end label-vintage-wide">
									{t("admin.orders.col.total")}
								</th>
								<th className="p-3 text-start label-vintage-wide">
									{t("admin.customers.detail.link")}
								</th>
								<th className="p-3 text-start label-vintage-wide">
									{t("admin.orders.col.date")}
								</th>
							</tr>
						</thead>
						<tbody className="divide-y divide-bronze/15">
							{customer.orders.length === 0 ? (
								<tr>
									<td
										colSpan={5}
										className="p-10 text-center body-vintage-muted"
									>
										{t("admin.customers.detail.noOrders")}
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
												<span className="font-label text-[0.6rem] uppercase tracking-[0.12em] text-ink">
													{t("admin.customers.detail.guestMatch")}
												</span>
											) : (
												<span className="font-label text-[0.6rem] uppercase tracking-[0.12em] text-olive">
													{t("admin.customers.detail.account")}
												</span>
											)}
										</td>
										<td className="p-3 font-serif text-xs text-ink-soft dark:text-cream/70">
											{fmt(o.createdAt)}
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
					<h2 className="heading-vintage-sm mb-3">
						{t("admin.customers.detail.notifications")}
					</h2>
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
									className={`font-label text-[0.6rem] uppercase tracking-[0.12em] ${n.status === "SENT" ? "text-olive" : n.status === "FAILED" ? "text-ink" : "text-ink-soft dark:text-cream/60"}`}
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
					{t("admin.customers.detail.audit")}
				</h2>
				<ul className="space-y-2">
					{customer.audit.length === 0 ? (
						<li className="body-vintage-muted">
							{t("admin.customers.detail.noAudit")}
						</li>
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
									— {a.actorName} · {fmt(a.createdAt)}
								</span>
							</li>
						))
					)}
				</ul>
			</div>
		</div>
	);
}
