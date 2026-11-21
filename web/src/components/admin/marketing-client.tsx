"use client";

import {
	ChevronDown,
	ChevronRight,
	Compass,
	Download,
	Megaphone,
	Search,
	ShoppingBag,
	TrendingUp,
} from "lucide-react";
import Link from "next/link";
import type * as React from "react";
import { useMemo, useRef, useState } from "react";
import { OrnamentDivider } from "@/components/maison/motifs";
import { useT } from "@/i18n/locale-provider";
import type { MarketingData, OrderUtmRow } from "@/lib/types";
import { mad } from "@/lib/types/constants";
import { cn } from "@/lib/utils";

export function Kpi({
	icon: Icon,
	label,
	value,
}: {
	icon: React.ElementType;
	label: string;
	value: string;
}) {
	return (
		<div className="card-vintage rounded-sm p-5">
			<div className="flex items-start justify-between">
				<div>
					<p className="font-label text-[0.62rem] uppercase tracking-[0.2em] text-bronze">
						{label}
					</p>
					<p className="mt-2 heading-vintage-md">{value}</p>
				</div>
				<span className="inline-flex size-9 items-center justify-center rounded-full bg-bronze/15 text-bronze">
					<Icon className="size-4" />
				</span>
			</div>
		</div>
	);
}

export function share(orders: number, total: number) {
	if (!total) return "0%";
	return `${Math.round((orders / total) * 100)}%`;
}

function isTestValue(v?: string | null) {
	// Match explicit test markers as tokens — a bare substring would
	// misclassify legitimate values like "contest" or "latest".
	const s = (v ?? "").toLowerCase();
	return /(^|[^a-z])(test|dev|staging|e2e)([^a-z]|$)/.test(s);
}

type MediumNode = {
	id: string;
	medium: string;
	orders: OrderUtmRow[];
	ordersCount: number;
	revenue: number;
};

type CampaignNode = {
	id: string;
	campaign: string;
	orders: number;
	revenue: number;
	mediums: MediumNode[];
};

type SourceNode = {
	id: string;
	source: string;
	orders: number;
	revenue: number;
	campaigns: CampaignNode[];
	suspectedTypo: boolean;
};

export function MarketingClient({ data }: { data: MarketingData }) {
	const { t } = useT();
	const [query, setQuery] = useState("");
	const [excludeTest, setExcludeTest] = useState(true);
	const [sortKey, setSortKey] = useState<"source" | "orders" | "revenue">(
		"orders",
	);
	const [sortDir, setSortDir] = useState<"asc" | "desc">("desc");
	const [expanded, setExpanded] = useState<Set<string>>(
		() => new Set(data.bySource.map((s) => `src:${s.source}`)),
	);
	const [focusIndex, setFocusIndex] = useState(0);
	const [selectedId, setSelectedId] = useState<string | null>(null);
	const nodeRefs = useRef<Map<string, HTMLElement>>(new Map());

	const tree = useMemo<SourceNode[]>(() => {
		const q = query.trim().toLowerCase();
		const match = (v?: string | null) => (v ?? "").toLowerCase().includes(q);

		const sources = data.bySource
			.filter((s) => !(excludeTest && isTestValue(s.source)))
			.map((s): SourceNode | null => {
				const campaigns = data.byCampaign
					.filter(
						(c) =>
							c.source === s.source &&
							!(
								excludeTest &&
								(isTestValue(c.source) || isTestValue(c.campaign))
							),
					)
					.map((c): CampaignNode | null => {
						const orders = data.recent.filter(
							(o) =>
								o.utmSource === s.source &&
								(o.utmCampaign || "—") === c.campaign &&
								!(
									excludeTest &&
									(isTestValue(o.utmSource) ||
										isTestValue(o.utmCampaign) ||
										isTestValue(o.utmMedium) ||
										isTestValue(o.number))
								) &&
								(!q ||
									match(o.number) ||
									match(o.utmSource) ||
									match(o.utmCampaign) ||
									match(o.utmMedium)),
						);

						const mediumMap = new Map<string, typeof orders>();
						for (const o of orders) {
							const m = o.utmMedium || "—";
							if (!mediumMap.has(m)) mediumMap.set(m, []);
							const bucket = mediumMap.get(m);
							if (bucket) bucket.push(o);
						}
						const mediums: MediumNode[] = [...mediumMap.entries()]
							.map(([medium, ords]) => ({
								id: `med:${s.source}::${c.campaign}::${medium}`,
								medium,
								orders: ords,
								ordersCount: ords.length,
								revenue: ords.reduce(
									(a, o) => a + (o.status === "CANCELLED" ? 0 : o.total),
									0,
								),
							}))
							.filter(
								(m) =>
									!q ||
									match(m.medium) ||
									m.orders.some(
										(o) =>
											match(o.number) ||
											match(o.utmSource) ||
											match(o.utmCampaign) ||
											match(o.utmMedium),
									),
							);

						const campaignMatches =
							!q ||
							match(c.campaign) ||
							match(s.source) ||
							orders.length > 0 ||
							mediums.length > 0;
						if (!campaignMatches) return null;

						const filteredCampaignOrders = orders.length;
						const filteredCampaignRevenue = orders.reduce(
							(a, o) => a + (o.status === "CANCELLED" ? 0 : o.total),
							0,
						);

						return {
							id: `cmp:${s.source}::${c.campaign}`,
							campaign: c.campaign,
							orders: filteredCampaignOrders,
							revenue: filteredCampaignRevenue,
							mediums,
						};
					})
					.filter((c): c is CampaignNode => c !== null);

				const sourceMatches = !q || match(s.source) || campaigns.length > 0;
				if (!sourceMatches) return null;

				// Derive source totals from the same filtered orders the campaign
				// nodes use — unfiltered aggregates would disagree with the visible
				// children when the test filter excludes only some orders.
				const sourceOrders = campaigns.reduce((a, c) => a + c.orders, 0);
				const sourceRevenue = campaigns.reduce((a, c) => a + c.revenue, 0);
				return {
					id: `src:${s.source}`,
					source: s.source,
					orders: sourceOrders,
					revenue: sourceRevenue,
					campaigns,
					suspectedTypo: s.source.toLowerCase() === "ms-egde",
				};
			})
			.filter((s): s is SourceNode => s !== null);

		sources.sort((a, b) => {
			let va: string | number;
			let vb: string | number;
			switch (sortKey) {
				case "source":
					va = a.source;
					vb = b.source;
					break;
				case "orders":
					va = a.orders;
					vb = b.orders;
					break;
				case "revenue":
					va = a.revenue;
					vb = b.revenue;
					break;
				default:
					va = a.orders;
					vb = b.orders;
			}
			if (typeof va === "string") {
				const cmp = va.localeCompare(vb as string);
				return sortDir === "asc" ? cmp : -cmp;
			}
			const cmp = (va as number) - (vb as number);
			return sortDir === "asc" ? cmp : -cmp;
		});

		return sources;
	}, [data, query, excludeTest, sortKey, sortDir]);

	const totalOrders =
		tree.reduce((a, s) => a + s.orders, 0) || data.totals.orders || 1;

	const visibleNodes = useMemo(() => {
		const list: Array<{
			id: string;
			level: number;
			kind: string;
			// biome-ignore lint/suspicious/noExplicitAny: heterogeneous tree node payload
			payload: any;
			hasChildren: boolean;
			parentId: string | null;
		}> = [];
		for (const s of tree) {
			list.push({
				id: s.id,
				level: 1,
				kind: "source",
				payload: s,
				hasChildren: s.campaigns.length > 0,
				parentId: null,
			});
			if (expanded.has(s.id)) {
				for (const c of s.campaigns) {
					list.push({
						id: c.id,
						level: 2,
						kind: "campaign",
						payload: c,
						hasChildren: c.mediums.length > 0,
						parentId: s.id,
					});
					if (expanded.has(c.id)) {
						for (const m of c.mediums) {
							list.push({
								id: m.id,
								level: 3,
								kind: "medium",
								payload: m,
								hasChildren: m.orders.length > 0,
								parentId: c.id,
							});
							if (expanded.has(m.id)) {
								for (const o of m.orders) {
									list.push({
										id: `ord:${o.id}`,
										level: 4,
										kind: "order",
										payload: o,
										hasChildren: false,
										parentId: m.id,
									});
								}
							}
						}
					}
				}
			}
		}
		return list;
	}, [tree, expanded]);
	// Filtering can shrink the tree below the remembered focus index —
	// clamp so a tab stop always exists among the visible rows.
	const clampedFocusIndex = Math.max(
		0,
		Math.min(focusIndex, visibleNodes.length - 1),
	);

	const toggle = (id: string) =>
		setExpanded((prev) => {
			const next = new Set(prev);
			if (next.has(id)) next.delete(id);
			else next.add(id);
			return next;
		});

	const handleKeyDown = (index: number) => (e: React.KeyboardEvent) => {
		const node = visibleNodes[index];
		if (!node) return;
		const target = e.target as HTMLElement | null;
		if (target?.closest("a")) return;
		switch (e.key) {
			case "ArrowDown":
				e.preventDefault();
				if (index < visibleNodes.length - 1) {
					const next = index + 1;
					setFocusIndex(next);
					nodeRefs.current.get(visibleNodes[next].id)?.focus();
				}
				break;
			case "ArrowUp":
				e.preventDefault();
				if (index > 0) {
					const prev = index - 1;
					setFocusIndex(prev);
					nodeRefs.current.get(visibleNodes[prev].id)?.focus();
				}
				break;
			case "ArrowRight":
				e.preventDefault();
				if (node.hasChildren) {
					if (!expanded.has(node.id)) toggle(node.id);
					else if (index < visibleNodes.length - 1) {
						const next = index + 1;
						setFocusIndex(next);
						nodeRefs.current.get(visibleNodes[next].id)?.focus();
					}
				}
				break;
			case "ArrowLeft":
				e.preventDefault();
				if (node.hasChildren && expanded.has(node.id)) {
					toggle(node.id);
				} else if (node.parentId) {
					const parentIndex = visibleNodes.findIndex(
						(n) => n.id === node.parentId,
					);
					if (parentIndex >= 0) {
						setFocusIndex(parentIndex);
						nodeRefs.current.get(node.parentId)?.focus();
					}
				}
				break;
			case "Enter":
			case " ":
				e.preventDefault();
				if (node.hasChildren) toggle(node.id);
				break;
			default:
				break;
		}
	};

	function csvCell(value: unknown) {
		const s = String(value);
		return /^[=+\-@\t\r]/.test(s) ? `'${s}` : s;
	}

	const exportCsv = () => {
		const rows: string[] = [];
		rows.push(["Source", "Campagne", "Support", "Commande", "Total"].join(","));
		for (const s of tree) {
			for (const c of s.campaigns) {
				for (const m of c.mediums) {
					for (const o of m.orders) {
						rows.push(
							[s.source, c.campaign, m.medium, o.number, o.total]
								.map((v) => `"${csvCell(v).replace(/"/g, '""')}"`)
								.join(","),
						);
					}
				}
			}
		}
		if (rows.length === 1) {
			for (const s of tree) {
				rows.push(
					[s.source, "", "", "", s.revenue]
						.map((v) => `"${csvCell(v).replace(/"/g, '""')}"`)
						.join(","),
				);
			}
		}
		const blob = new Blob([rows.join("\n")], {
			type: "text/csv;charset=utf-8",
		});
		const url = URL.createObjectURL(blob);
		const a = document.createElement("a");
		a.href = url;
		a.download = "attribution-marketing.csv";
		a.click();
		URL.revokeObjectURL(url);
	};

	const direct = data.totals.orders - data.totals.attributed;
	const statusMessage = `${data.totals.orders} commandes, ${mad(data.totals.revenue)}, ${data.totals.attributed} attribuées, ${direct} direct / organique${
		excludeTest ? " (trafic test exclu)" : ""
	}${query ? ` — filtre « ${query} »` : ""}`;

	return (
		<div className="space-y-8">
			<div className="flex flex-wrap items-end justify-between gap-3">
				<div>
					<h1 className="heading-vintage-lg">{t("admin.marketing.title")}</h1>
					<p className="mt-1 body-vintage">{t("admin.marketing.subtitle")}</p>
				</div>
				<nav
					className="flex gap-1 rounded-sm border border-border p-1"
					aria-label={t("admin.marketing.period")}
				>
					{(
						[
							{
								key: "30",
								href: "/makteb/marketing",
								label: t("admin.marketing.period30"),
							},
							{
								key: "all",
								href: "/makteb/marketing?period=all",
								label: t("admin.marketing.periodAll"),
							},
						] as const
					).map((p) => {
						const active = (data.period === 0 ? "all" : "30") === p.key;
						return (
							<Link
								key={p.key}
								href={p.href}
								aria-selected={active}
								aria-current={active ? "page" : undefined}
								className={`rounded-sm px-3 py-1.5 font-label text-[0.62rem] uppercase tracking-[0.14em] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-terracotta ${
									active
										? "bg-terracotta text-cream"
										: "text-ink-soft hover:bg-sidebar-accent/60 dark:text-cream/70"
								}`}
							>
								{p.label}
							</Link>
						);
					})}
				</nav>
			</div>

			<OrnamentDivider />

			{/* KPIs */}
			<div aria-live="polite" aria-atomic="true" className="sr-only">
				{statusMessage}
			</div>
			<div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
				<Kpi
					icon={ShoppingBag}
					label={t("admin.marketing.kpiOrders")}
					value={String(data.totals.orders)}
				/>
				<Kpi
					icon={TrendingUp}
					label={t("admin.marketing.kpiRevenue")}
					value={mad(data.totals.revenue)}
				/>
				<Kpi
					icon={Megaphone}
					label={t("admin.marketing.kpiAttributed")}
					value={String(data.totals.attributed)}
				/>
				<Kpi
					icon={Compass}
					label={t("admin.marketing.kpiDirect")}
					value={String(direct)}
				/>
			</div>

			{/* Hidden logical headings for the three original sections */}
			<h2 id="marketing-sources-heading" className="sr-only">
				{t("admin.marketing.sources")}
			</h2>
			<h2 id="marketing-campaigns-heading" className="sr-only">
				{t("admin.marketing.campaigns")}
			</h2>
			<h2 id="marketing-recent-heading" className="sr-only">
				{t("admin.marketing.recent")}
			</h2>

			{/* Unified attribution tree */}
			<section
				aria-labelledby="marketing-sources-heading"
				className="space-y-3"
			>
				<div className="flex flex-wrap items-center justify-between gap-3">
					<h2 className="label-vintage-lg">{t("admin.marketing.sources")}</h2>
					<div className="flex flex-wrap items-center gap-2">
						<label className="relative">
							<Search
								className="pointer-events-none absolute start-2 top-1/2 size-3.5 -translate-y-1/2 text-bronze"
								aria-hidden="true"
							/>
							<input
								type="search"
								value={query}
								onChange={(e) => setQuery(e.target.value)}
								placeholder={t("admin.marketing.searchPlaceholder")}
								aria-label={t("admin.marketing.search")}
								className="rounded-sm border border-border bg-background ps-8 pe-3 py-1.5 font-label text-[0.62rem] uppercase tracking-[0.14em] text-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-terracotta"
							/>
						</label>
						<button
							type="button"
							onClick={() => setExcludeTest((v) => !v)}
							aria-pressed={excludeTest}
							className="rounded-sm border border-border px-3 py-1.5 font-label text-[0.62rem] uppercase tracking-[0.14em] text-ink transition-colors hover:bg-sidebar-accent/60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-terracotta"
						>
							{excludeTest
								? t("admin.marketing.testTrafficHide")
								: t("admin.marketing.testTrafficShow")}
						</button>
						<select
							aria-label={t("admin.marketing.sortBy")}
							value={sortKey}
							onChange={(e) =>
								setSortKey(e.target.value as "source" | "orders" | "revenue")
							}
							className="rounded-sm border border-border bg-background px-3 py-1.5 font-label text-[0.62rem] uppercase tracking-[0.14em] text-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-terracotta"
						>
							<option value="orders">{t("admin.marketing.colOrders")}</option>
							<option value="revenue">{t("admin.marketing.colRevenue")}</option>
							<option value="source">{t("admin.marketing.colSource")}</option>
						</select>
						<select
							aria-label={t("admin.marketing.sortOrder")}
							value={sortDir}
							onChange={(e) => setSortDir(e.target.value as "asc" | "desc")}
							className="rounded-sm border border-border bg-background px-3 py-1.5 font-label text-[0.62rem] uppercase tracking-[0.14em] text-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-terracotta"
						>
							<option value="desc">Desc</option>
							<option value="asc">Asc</option>
						</select>
						<button
							type="button"
							onClick={exportCsv}
							className="inline-flex items-center gap-1.5 rounded-sm border border-border px-3 py-1.5 font-label text-[0.62rem] uppercase tracking-[0.14em] text-ink transition-colors hover:bg-sidebar-accent/60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-terracotta"
						>
							<Download className="size-3.5" aria-hidden="true" />
							{t("admin.marketing.exportCsv")}
						</button>
					</div>
				</div>

				{tree.length === 0 ? (
					<p className="card-vintage rounded-sm p-6 text-center font-serif text-sm body-vintage-soft">
						{t("admin.marketing.empty")}
					</p>
				) : (
					<>
						<div
							className="hidden sm:grid grid-cols-[minmax(0,1fr)_5rem_7rem_4rem] gap-4 px-4 py-2 font-label text-[0.6rem] uppercase tracking-[0.18em] text-ink/70"
							aria-hidden="true"
						>
							<span>Source / Campagne / Support</span>
							<span className="text-end">{t("admin.marketing.colOrders")}</span>
							<span className="text-end">
								{t("admin.marketing.colRevenue")}
							</span>
							<span className="text-end">{t("admin.marketing.colShare")}</span>
						</div>
						<div
							role="tree"
							aria-label={t("admin.marketing.title")}
							className="card-vintage rounded-sm divide-y divide-border/60"
						>
							{visibleNodes.map((node, index) => {
								const isExpanded = expanded.has(node.id);
								return (
									<div
										key={node.id}
										role="treeitem"
										aria-level={node.level}
										aria-expanded={node.hasChildren ? isExpanded : undefined}
										aria-selected={node.id === selectedId}
										tabIndex={index === clampedFocusIndex ? 0 : -1}
										ref={(el) => {
											if (el) nodeRefs.current.set(node.id, el);
											else nodeRefs.current.delete(node.id);
										}}
										onKeyDown={handleKeyDown(index)}
										onClick={() => {
											setFocusIndex(index);
											setSelectedId(node.id);
											if (node.hasChildren) toggle(node.id);
										}}
										className={cn(
											"flex items-center gap-3 py-2.5 pe-4 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-terracotta",
											node.level === 1 && "ps-4",
										)}
										style={{
											paddingInlineStart: `${(node.level - 1) * 1.25 + 1}rem`,
										}}
									>
										{node.hasChildren ? (
											<button
												type="button"
												onClick={(e) => {
													e.stopPropagation();
													toggle(node.id);
												}}
												aria-label={isExpanded ? "Réduire" : "Développer"}
												className="inline-flex size-5 items-center justify-center rounded text-bronze focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-terracotta"
											>
												{isExpanded ? (
													<ChevronDown
														className="size-3.5"
														aria-hidden="true"
													/>
												) : (
													<ChevronRight
														className="size-3.5"
														aria-hidden="true"
													/>
												)}
											</button>
										) : (
											<span className="size-5" aria-hidden="true" />
										)}

										{node.kind === "source" && (
											<>
												<span className="flex-1 font-serif text-sm text-ink">
													{node.payload.source}
												</span>
												{node.payload.suspectedTypo && (
													<span className="rounded-full bg-terracotta/15 px-2 py-0.5 text-[0.55rem] text-terracotta">
														typo ? ms-edge
													</span>
												)}
												<span className="w-16 text-end text-sm text-ink/80">
													{node.payload.orders}
												</span>
												<span className="w-24 text-end text-sm text-ink/80">
													{mad(node.payload.revenue)}
												</span>
												<span className="w-12 text-end text-sm text-ink/80">
													{share(node.payload.orders, totalOrders)}
												</span>
											</>
										)}

										{node.kind === "campaign" && (
											<>
												<span className="flex-1 font-serif text-sm text-ink">
													{node.payload.campaign}
												</span>
												<span className="w-16 text-end text-sm text-ink/80">
													{node.payload.orders}
												</span>
												<span className="w-24 text-end text-sm text-ink/80">
													{mad(node.payload.revenue)}
												</span>
												<span className="w-12 text-end text-sm text-ink/80">
													—
												</span>
											</>
										)}

										{node.kind === "medium" && (
											<>
												<span className="flex-1 font-serif text-sm text-ink">
													{node.payload.medium}
												</span>
												<span className="w-16 text-end text-sm text-ink/80">
													{node.payload.ordersCount}
												</span>
												<span className="w-24 text-end text-sm text-ink/80">
													{mad(node.payload.revenue)}
												</span>
												<span className="w-12 text-end text-sm text-ink/80">
													—
												</span>
											</>
										)}

										{node.kind === "order" && (
											<>
												<Link
													href={`/makteb/orders/${node.payload.id}`}
													className="flex-1 font-serif text-sm text-ink underline decoration-bronze/40 underline-offset-4 hover:text-bronze"
												>
													{node.payload.number}
												</Link>
												<span className="text-xs text-ink/70">
													{node.payload.utmCampaign || "—"} ·{" "}
													{node.payload.utmMedium || "—"}
												</span>
												<span className="w-24 text-end text-sm text-ink/80">
													{mad(node.payload.total)}
												</span>
											</>
										)}
									</div>
								);
							})}
						</div>
					</>
				)}
			</section>
		</div>
	);
}
