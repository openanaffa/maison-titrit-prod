"use client";

import { Search } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useT } from "@/i18n/locale-provider";
import type {
	CustomerListRow,
	CustomerSegment,
} from "@/lib/repositories/customers";

const SEGMENTS: { key: CustomerSegment | ""; labelKey: string }[] = [
	{ key: "", labelKey: "admin.customers.segment.all" },
	{ key: "has-orders", labelKey: "admin.customers.segment.hasOrders" },
	{ key: "guest-linked", labelKey: "admin.customers.segment.guestLinked" },
	{ key: "email-verified", labelKey: "admin.customers.segment.emailVerified" },
	{
		key: "marketing-consent",
		labelKey: "admin.customers.segment.marketingConsent",
	},
];

export function CustomersTableClient({
	rows,
	activeSegment,
	search,
}: {
	rows: CustomerListRow[];
	activeSegment: string;
	search: string;
}) {
	const { t } = useT();
	const router = useRouter();

	function navigate(next: { q?: string; segment?: string }) {
		const params = new URLSearchParams(window.location.search);
		for (const [k, v] of Object.entries(next)) {
			if (v) params.set(k, v);
			else params.delete(k);
		}
		router.push(`/makteb/customers?${params.toString()}`);
	}

	return (
		<div className="space-y-6">
			<div>
				<h1 className="heading-vintage-lg">{t("admin.customers.title")}</h1>
				<p className="mt-1 body-vintage">{t("admin.customers.subtitle")}</p>
			</div>

			{/* Search + segments */}
			<div className="flex flex-wrap items-center gap-3">
				<div className="relative w-full md:w-72">
					<Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 body-vintage-soft" />
					<input
						type="search"
						placeholder={t("admin.common.search")}
						defaultValue={search}
						onKeyDown={(e) => {
							if (e.key === "Enter") {
								navigate({ q: (e.target as HTMLInputElement).value });
							}
						}}
						className="w-full pl-9 pr-3 py-2 rounded border border-bronze/45 bg-transparent text-sm text-ink dark:text-cream placeholder-ink-soft dark:placeholder-cream/60 focus:border-bronze outline-none"
					/>
				</div>
				{SEGMENTS.map((s) => (
					<button
						type="button"
						key={s.key || "all"}
						onClick={() => navigate({ segment: s.key || undefined })}
						className={`rounded-full border px-3 py-1.5 font-label text-[0.62rem] uppercase tracking-[0.14em] ${s.key === activeSegment ? "border-ink bg-ink text-cream dark:border-cream dark:bg-cream dark:text-ink" : "border-bronze/45 text-ink-soft dark:text-cream/70"}`}
					>
						{t(s.labelKey)}
					</button>
				))}
			</div>

			{/* Table */}
			<div className="card-vintage overflow-hidden rounded-sm">
				<div className="overflow-x-auto">
					<table className="w-full text-sm">
						<thead className="border-b border-bronze/20 bg-muted/40">
							<tr>
								<th className="p-3 text-start label-vintage-wide">
									{t("admin.customers.col.customer")}
								</th>
								<th className="p-3 text-start label-vintage-wide">
									{t("admin.customers.col.email")}
								</th>
								<th className="p-3 text-end label-vintage-wide">
									{t("admin.customers.col.orders")}
								</th>
								<th className="p-3 text-start label-vintage-wide">
									{t("admin.customers.col.since")}
								</th>
							</tr>
						</thead>
						<tbody className="divide-y divide-bronze/15">
							{rows.length === 0 ? (
								<tr>
									<td
										colSpan={4}
										className="p-10 text-center body-vintage-muted"
									>
										{t("admin.customers.empty")}
									</td>
								</tr>
							) : (
								rows.map((c) => (
									<tr key={c.id} className="hover:bg-muted/30">
										<td className="p-3">
											<Link href={`/makteb/customers/${c.id}`}>
												<span className="heading-vintage-sm hover:underline">
													<div className="flex items-center gap-2.5">
														<div className="flex size-8 items-center justify-center rounded-full bg-bronze/20 font-display text-xs font-semibold text-ink">
															{(c.name?.[0] || c.email[0]).toUpperCase()}
														</div>
														{c.name || c.email}
														{!c.emailVerified && (
															<span className="font-label text-[0.55rem] uppercase tracking-[0.12em] text-ink-soft dark:text-cream/60">
																{t("admin.customers.unverified")}
															</span>
														)}
													</div>
												</span>
											</Link>
										</td>
										<td className="p-3 font-serif text-sm text-ink-soft dark:text-cream/80">
											{c.email}
										</td>
										<td className="p-3 text-end font-serif text-sm text-ink-soft dark:text-cream/80">
											{c.accountOrders}
											{c.matchedGuestOrders > 0 && (
												<span className="label-vintage-sm">
													{" + "}
													{c.matchedGuestOrders}
												</span>
											)}
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
