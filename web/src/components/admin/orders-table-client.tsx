"use client";

import { Search } from "lucide-react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import * as React from "react";
import { OrderDetailDialog } from "@/components/admin/order-detail-dialog";
import { StatusBadge } from "@/components/admin/status-badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useT } from "@/i18n/locale-provider";
import type { OrderRow } from "@/lib/types";
import { FLOW, STATUS_LABELS } from "@/lib/types/constants";

export function OrdersTableClient({ rows }: { rows: OrderRow[] }) {
	const { t } = useT();
	const router = useRouter();
	const searchParams = useSearchParams();
	const [filter, setFilter] = React.useState<string>("all");
	const [selected, setSelected] = React.useState<OrderRow | null>(null);

	const currentQ = searchParams.get("q") ?? "";

	function handleSearchChange(e: React.ChangeEvent<HTMLInputElement>) {
		const value = e.target.value;
		router.push(`/makteb/orders?q=${encodeURIComponent(value)}`);
	}

	const filtered = rows.filter((r) => filter === "all" || r.status === filter);

	return (
		<div className="space-y-6">
			<div>
				<h1 className="heading-vintage-lg">{t("admin.orders.title")}</h1>
				<p className="mt-1 body-vintage">{t("admin.orders.subtitle")}</p>
			</div>

			{/* Search + status filter */}
			<div className="flex flex-wrap items-center gap-3">
				<div className="relative w-full md:w-72">
					<Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 body-vintage-soft" />
					<input
						type="search"
						placeholder={t("admin.common.search")}
						defaultValue={currentQ}
						onChange={handleSearchChange}
						className="w-full pl-9 pr-3 py-2 rounded border border-bronze/45 bg-transparent text-sm text-ink dark:text-cream placeholder-ink-soft dark:placeholder-cream/60 focus:border-bronze outline-none"
					/>
				</div>
				<button
					type="button"
					onClick={() => setFilter("all")}
					className={`rounded-full border px-3 py-1.5 font-label text-[0.62rem] uppercase tracking-[0.14em] ${filter === "all" ? "border-ink bg-ink text-cream" : "border-bronze/45 text-ink-soft dark:text-cream/70"}`}
				>
					Toutes ({rows.length})
				</button>
				{FLOW.map((s) => {
					const n = rows.filter((r) => r.status === s).length;
					return (
						<button
							type="button"
							key={s}
							onClick={() => setFilter(s)}
							className={`rounded-full border px-3 py-1.5 font-label text-[0.62rem] uppercase tracking-[0.14em] ${filter === s ? "border-ink bg-ink text-cream" : "border-bronze/45 text-ink-soft dark:text-cream/70"}`}
						>
							{STATUS_LABELS[s] ?? s} ({n})
						</button>
					);
				})}
			</div>

			{/* Table */}
			<div className="card-vintage overflow-hidden rounded-sm">
				<div className="overflow-x-auto">
					<table className="w-full text-sm">
						<thead className="border-b border-bronze/20 bg-muted/40">
							<tr>
								<th className="p-3 text-start label-vintage-wide">
									{t("admin.orders.col.number")}
								</th>
								<th className="p-3 text-start label-vintage-wide">
									{t("admin.orders.col.customer")}
								</th>
								<th className="p-3 text-end label-vintage-wide">
									{t("admin.orders.col.total")}
								</th>
								<th className="p-3 text-center label-vintage-wide">
									{t("admin.orders.col.status")}
								</th>
								<th className="p-3 text-start label-vintage-wide">
									{t("admin.orders.col.date")}
								</th>
								<th className="p-3 text-end label-vintage-wide">
									{t("admin.orders.col.actions")}
								</th>
							</tr>
						</thead>
						<tbody className="divide-y divide-bronze/15">
							{filtered.length === 0 ? (
								<tr>
									<td
										colSpan={6}
										className="p-10 text-center body-vintage-muted"
									>
										{t("admin.orders.empty")}
									</td>
								</tr>
							) : (
								filtered.map((o) => (
									<tr key={o.id} className="hover:bg-muted/30">
										<td className="p-3">
											<Link href={`/makteb/orders/${o.id}`}>
												<span className="heading-vintage-sm hover:underline">
													{o.number}
												</span>
											</Link>
										</td>
										<td className="p-3">
											<p className="body-vintage-sm">{o.customerName}</p>
											<p className="label-vintage-sm">{o.customerPhone}</p>
										</td>
										<td className="p-3 text-end heading-vintage-sm">
											{o.total.toLocaleString("fr-FR")} {o.currency}
										</td>
										<td className="p-3 text-center">
											<StatusBadge status={o.status} />
										</td>
										<td className="p-3 font-serif text-xs text-ink-soft dark:text-cream/70">
											{new Date(o.createdAt).toLocaleDateString("fr-FR")}
										</td>
										<td className="p-3 text-end">
											<Button
												type="button"
												onClick={() => setSelected(o)}
												className="font-label text-[0.62rem] uppercase tracking-[0.16em] text-ink hover:text-ink"
											>
												Détails
											</Button>
										</td>
									</tr>
								))
							)}
						</tbody>
					</table>
				</div>
			</div>

			{/* Order detail dialog */}
			<OrderDetailDialog order={selected} onClose={() => setSelected(null)} />
		</div>
	);
}
