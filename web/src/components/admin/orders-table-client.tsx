"use client";

import { Search } from "lucide-react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import * as React from "react";
import { ChipButton } from "@/components/admin/chip-button";
import { OrderDetailDialog } from "@/components/admin/order-detail-dialog";
import { StatusBadge } from "@/components/admin/status-badge";
import { Button } from "@/components/ui/button";
import { useT } from "@/i18n/locale-provider";
import type { OrderRow } from "@/lib/types";
import { FLOW, STATUS_LABELS } from "@/lib/types/constants";

const SEARCH_DEBOUNCE_MS = 300;

export function OrdersTableClient({ rows }: { rows: OrderRow[] }) {
	const { t } = useT();
	const router = useRouter();
	const searchParams = useSearchParams();

	const currentQ = searchParams.get("q") ?? "";
	const searchRef = React.useRef<HTMLInputElement>(null);
	const [query, setQuery] = React.useState(currentQ);
	const [filter, setFilter] = React.useState<string>("all");
	const [selected, setSelected] = React.useState<OrderRow | null>(null);
	const [isPending, startTransition] = React.useTransition();

	// Debounced URL sync: the server filters on `q`, so push at most one
	// navigation per pause in typing instead of on every keystroke.
	React.useEffect(() => {
		const timer = setTimeout(() => {
			if (query === currentQ) return;
			startTransition(() => {
				const next = query.trim();
				router.push(
					next
						? `/makteb/orders?q=${encodeURIComponent(next)}`
						: "/makteb/orders",
				);
			});
		}, SEARCH_DEBOUNCE_MS);
		return () => clearTimeout(timer);
	}, [query, currentQ, router]);

	// Keep the field in sync when the URL changes (back/forward, external links)
	// without clobbering in-progress typing while the field has focus.
	React.useEffect(() => {
		if (document.activeElement === searchRef.current) return;
		setQuery(currentQ);
	}, [currentQ]);

	const filtered = React.useMemo(
		() => rows.filter((r) => filter === "all" || r.status === filter),
		[rows, filter],
	);
	const statusCounts = React.useMemo(() => {
		const counts = new Map<string, number>();
		for (const r of rows) counts.set(r.status, (counts.get(r.status) ?? 0) + 1);
		return counts;
	}, [rows]);

	return (
		<div className="space-y-6">
			<div>
				<h1 className="heading-vintage-lg">{t("admin.orders.title")}</h1>
				<p className="mt-1 body-vintage">{t("admin.orders.subtitle")}</p>
			</div>

			{/* Search + status filter */}
			<div className="flex flex-wrap items-center gap-3">
				<div className="relative w-full md:w-72">
					<Search
						aria-hidden="true"
						className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 body-vintage-soft"
					/>
					<input
						ref={searchRef}
						type="search"
						value={query}
						onChange={(e) => setQuery(e.target.value)}
						placeholder={t("admin.common.search")}
						aria-label={t("admin.common.search")}
						className="w-full pl-9 pr-3 py-2 rounded border border-bronze/45 bg-transparent text-sm text-ink dark:text-cream placeholder-ink-soft dark:placeholder-cream/60 focus:border-bronze outline-none focus-visible:ring-[3px] focus-visible:ring-ring/50"
					/>
				</div>
				<fieldset className="m-0 flex flex-wrap items-center gap-2 border-0 p-0">
					<legend className="sr-only">{t("admin.orders.filters")}</legend>
					<ChipButton
						active={filter === "all"}
						onClick={() => setFilter("all")}
					>
						{t("admin.orders.filterAll")} ({rows.length})
					</ChipButton>
					{FLOW.map((s) => (
						<ChipButton
							key={s}
							active={filter === s}
							onClick={() => setFilter(s)}
						>
							{STATUS_LABELS[s] ?? s} ({statusCounts.get(s) ?? 0})
						</ChipButton>
					))}
				</fieldset>
			</div>

			{/* Live region so screen readers hear the result of a search or filter change. */}
			<p aria-live="polite" className="sr-only">
				{t("admin.orders.resultsCount", { count: filtered.length })}
			</p>

			{/* Table */}
			<div
				className="card-vintage overflow-hidden rounded-sm"
				aria-busy={isPending}
			>
				<div className="overflow-x-auto">
					<table className="w-full text-sm">
						<caption className="sr-only">
							{t("admin.orders.tableCaption")}
						</caption>
						<thead className="border-b border-bronze/20 bg-muted/40">
							<tr>
								<th scope="col" className="p-3 text-start label-vintage-wide">
									{t("admin.orders.col.number")}
								</th>
								<th scope="col" className="p-3 text-start label-vintage-wide">
									{t("admin.orders.col.customer")}
								</th>
								<th scope="col" className="p-3 text-end label-vintage-wide">
									{t("admin.orders.col.total")}
								</th>
								<th scope="col" className="p-3 text-center label-vintage-wide">
									{t("admin.orders.col.status")}
								</th>
								<th scope="col" className="p-3 text-start label-vintage-wide">
									{t("admin.orders.col.date")}
								</th>
								<th scope="col" className="p-3 text-end label-vintage-wide">
									<span aria-hidden="true">
										{t("admin.orders.col.actions")}
									</span>
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
										{rows.length === 0
											? t("admin.orders.empty")
											: t("admin.orders.emptyFilter")}
									</td>
								</tr>
							) : (
								filtered.map((o) => (
									<tr key={o.id} className="hover:bg-muted/30">
										<td className="p-3">
											<Link
												href={`/makteb/orders/${o.id}`}
												className="heading-vintage-sm hover:underline focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-ring/50"
											>
												{o.number}
											</Link>
										</td>
										<td className="p-3">
											<p className="body-vintage-sm">{o.customerName}</p>
											<p className="label-vintage-sm">
												<a
													href={`tel:${o.customerPhone}`}
													className="hover:underline focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-ring/50"
												>
													{o.customerPhone}
												</a>
											</p>
										</td>
										<td className="p-3 text-end heading-vintage-sm">
											{o.total.toLocaleString("fr-FR")} {o.currency}
										</td>
										<td className="p-3 text-center">
											<StatusBadge status={o.status} />
										</td>
										<td className="p-3 font-serif text-xs text-ink-soft dark:text-cream/70">
											<time
												dateTime={new Date(o.createdAt)
													.toISOString()
													.slice(0, 10)}
											>
												{new Date(o.createdAt).toLocaleDateString("fr-FR")}
											</time>
										</td>
										<td className="p-3 text-end">
											<Button
												type="button"
												variant="outline"
												size="sm"
												onClick={() => setSelected(o)}
												className="border-bronze/45 bg-transparent font-label text-[0.62rem] uppercase tracking-[0.16em] text-ink-soft hover:border-terracotta hover:bg-muted/50 hover:text-ink dark:border-cream/30 dark:text-cream/70 dark:hover:text-cream"
											>
												{t("admin.orders.row.details")}
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
