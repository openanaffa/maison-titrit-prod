/* biome-ignore-all lint/a11y/noNoninteractiveElementToInteractiveRole: the semantic table is intentionally enhanced as a WAI-ARIA treegrid. */
/* biome-ignore-all lint/a11y/useSemanticElements: ARIA treegrid metadata extends semantic table rows and cells. */
/* biome-ignore-all lint/a11y/useFocusableInteractive: roving tabindex on table rows manages treegrid keyboard access. */
"use client";

import { ChevronDown, ChevronRight, Download, Search } from "lucide-react";
import Link from "next/link";
import * as React from "react";
import { OrnamentDivider } from "@/components/maison/motifs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useT } from "@/i18n/locale-provider";
import type { MarketingData } from "@/lib/types";
import { mad } from "@/lib/types/constants";
import type { OrderUtmRow } from "@/lib/types/order/order";

type TreeNode = {
	id: string;
	kind: "source" | "campaign" | "medium" | "order";
	label: string;
	orders: OrderUtmRow[];
	children: TreeNode[];
};

function cleanSource(value: string | null, missingSource: string) {
	const source = value
		?.trim()
		.toLowerCase()
		.replace(/ms-egde/g, "ms-edge");
	return source || missingSource;
}

function isTestTraffic(order: OrderUtmRow) {
	const fields = [order.utmSource, order.utmMedium, order.utmCampaign]
		.filter(Boolean)
		.join(" ")
		.toLowerCase();
	return /(?:^|[\s_-])(?:dev-test|direct-test)(?:$|[\s_-])/.test(fields);
}

function csvCell(value: string | number) {
	return `"${String(value).replaceAll('"', '""')}"`;
}

function buildTree(
	orders: OrderUtmRow[],
	query: string,
	sort: string,
	ascending: boolean,
	fallbacks: { source: string; campaign: string; medium: string },
) {
	const filtered = orders.filter((order) => {
		const source = cleanSource(order.utmSource, fallbacks.source);
		const searchable = [
			order.number,
			source,
			order.utmCampaign,
			order.utmMedium,
		]
			.filter(Boolean)
			.join(" ")
			.toLowerCase();
		return searchable.includes(query.trim().toLowerCase());
	});
	const compareOrders = (a: OrderUtmRow, b: OrderUtmRow) => {
		const result =
			sort === "total"
				? a.total - b.total
				: sort === "order"
					? a.number.localeCompare(b.number)
					: new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
		return ascending ? result : -result;
	};
	const sources = new Map<string, Map<string, Map<string, OrderUtmRow[]>>>();
	for (const order of filtered) {
		const source = cleanSource(order.utmSource, fallbacks.source);
		const campaign = order.utmCampaign?.trim() || fallbacks.campaign;
		const medium = order.utmMedium?.trim() || fallbacks.medium;
		const campaigns = sources.get(source) ?? new Map();
		const media = campaigns.get(campaign) ?? new Map();
		const groupedOrders = media.get(medium) ?? [];
		groupedOrders.push(order);
		media.set(medium, groupedOrders);
		campaigns.set(campaign, media);
		sources.set(source, campaigns);
	}
	const compareGroups = (
		a: { orders: OrderUtmRow[]; label: string },
		b: { orders: OrderUtmRow[]; label: string },
	) => {
		const value = (group: { orders: OrderUtmRow[]; label: string }) =>
			sort === "total"
				? revenue(group.orders)
				: sort === "order"
					? group.orders.length
					: Math.max(
							...group.orders.map((order) =>
								new Date(order.createdAt).getTime(),
							),
							0,
						);
		const aValue = value(a);
		const bValue = value(b);
		const result =
			aValue === bValue ? a.label.localeCompare(b.label) : aValue - bValue;
		return ascending ? result : -result;
	};
	const tree = [...sources.entries()]
		.map(([source, campaigns]) => {
			const sourceOrders = [...campaigns.values()].flatMap((media) =>
				[...media.values()].flat(),
			);
			const children = [...campaigns.entries()]
				.map(([campaign, media]) => {
					const campaignOrders = [...media.values()].flat();
					return {
						id: `campaign:${source}:${campaign}`,
						kind: "campaign" as const,
						label: campaign,
						orders: campaignOrders,
						children: [...media.entries()]
							.map(([medium, mediumOrders]) => ({
								id: `medium:${source}:${campaign}:${medium}`,
								kind: "medium" as const,
								label: medium,
								orders: mediumOrders,
								children: [...mediumOrders]
									.sort(compareOrders)
									.map((order) => ({
										id: `order:${order.id}`,
										kind: "order" as const,
										label: order.number,
										orders: [order],
										children: [],
									})),
							}))
							.sort(compareGroups),
					};
				})
				.sort(compareGroups);
			return {
				id: `source:${source}`,
				kind: "source" as const,
				label: source,
				orders: sourceOrders,
				children,
			};
		})
		.sort(compareGroups);
	return { filtered, tree };
}

function revenue(orders: OrderUtmRow[]) {
	return orders.reduce(
		(total, order) => total + (order.status === "CANCELLED" ? 0 : order.total),
		0,
	);
}

export function Kpi({ label, value }: { label: string; value: string }) {
	return (
		<div className="card-vintage rounded-sm p-5">
			<p className="font-label text-[0.68rem] font-semibold uppercase tracking-[0.16em] text-ink-soft dark:text-cream/80">
				{label}
			</p>
			<p className="mt-2 heading-vintage-md">{value}</p>
		</div>
	);
}

export function share(orders: number, total: number) {
	if (!total) return "0%";
	return `${Math.round((orders / total) * 100)}%`;
}

export function MarketingClient({ data }: { data: MarketingData }) {
	const { t } = useT();
	const missingSource = t("admin.marketing.missingSource");
	const missingCampaign = t("admin.marketing.missingCampaign");
	const missingMedium = t("admin.marketing.missingMedium");
	const [excludeTest, setExcludeTest] = React.useState(true);
	const [query, setQuery] = React.useState("");
	const [sort, setSort] = React.useState("date");
	const [ascending, setAscending] = React.useState(false);
	const [expanded, setExpanded] = React.useState<Set<string>>(() => new Set());
	const [focusId, setFocusId] = React.useState("");
	const visibleOrders = React.useMemo(
		() =>
			excludeTest
				? data.orders.filter((order) => !isTestTraffic(order))
				: data.orders,
		[data.orders, excludeTest],
	);
	const { filtered, tree } = React.useMemo(
		() =>
			buildTree(visibleOrders, query, sort, ascending, {
				source: missingSource,
				campaign: missingCampaign,
				medium: missingMedium,
			}),
		[
			visibleOrders,
			query,
			sort,
			ascending,
			missingSource,
			missingCampaign,
			missingMedium,
		],
	);
	const attributedOrders = filtered.filter((order) => order.utmSource);
	const direct = filtered.filter((order) => !order.utmSource);
	const flatRows = React.useMemo(() => {
		const rows: Array<{
			node: TreeNode;
			depth: number;
			parentId: string | null;
		}> = [];
		const visit = (
			nodes: TreeNode[],
			depth: number,
			parentId: string | null,
		) => {
			for (const node of nodes) {
				rows.push({ node, depth, parentId });
				if (expanded.has(node.id)) visit(node.children, depth + 1, node.id);
			}
		};
		visit(tree, 1, null);
		return rows;
	}, [tree, expanded]);
	React.useEffect(() => {
		setExpanded(
			new Set(
				tree.flatMap((source) => [
					source.id,
					...source.children.map((campaign) => campaign.id),
					...source.children.flatMap((campaign) =>
						campaign.children.map((medium) => medium.id),
					),
				]),
			),
		);
	}, [tree]);
	React.useEffect(() => {
		if (!flatRows.some(({ node }) => node.id === focusId))
			setFocusId(flatRows[0]?.node.id ?? "");
	}, [flatRows, focusId]);

	const toggle = (id: string) =>
		setExpanded((current) => {
			const next = new Set(current);
			if (next.has(id)) next.delete(id);
			else next.add(id);
			return next;
		});
	const handleTreeKeyDown = (
		event: React.KeyboardEvent<HTMLDivElement>,
		index: number,
		node: TreeNode,
		parentId: string | null,
	) => {
		if (event.key === "ArrowDown" || event.key === "ArrowUp") {
			event.preventDefault();
			const next =
				flatRows[
					Math.max(
						0,
						Math.min(
							flatRows.length - 1,
							index + (event.key === "ArrowDown" ? 1 : -1),
						),
					)
				];
			setFocusId(next?.node.id ?? "");
			document.getElementById(next?.node.id ?? "")?.focus();
		} else if (event.key === "ArrowRight" && node.children.length) {
			event.preventDefault();
			if (!expanded.has(node.id)) toggle(node.id);
			else {
				const child = flatRows[index + 1];
				if (child) {
					setFocusId(child.node.id);
					document.getElementById(child.node.id)?.focus();
				}
			}
		} else if (event.key === "ArrowLeft") {
			event.preventDefault();
			if (expanded.has(node.id)) toggle(node.id);
			else if (parentId) {
				setFocusId(parentId);
				document.getElementById(parentId)?.focus();
			}
		} else if (
			(event.key === "Enter" || event.key === " ") &&
			node.children.length
		) {
			event.preventDefault();
			toggle(node.id);
		}
	};
	const exportCsv = () => {
		const rows = [
			[
				"Commande",
				"Source",
				"Campagne",
				"Support",
				"Statut",
				"Total MAD",
				"Date",
			],
			...filtered.map((order) => [
				order.number,
				cleanSource(order.utmSource, missingSource),
				order.utmCampaign || "",
				order.utmMedium || "",
				order.status,
				order.total,
				order.createdAt,
			]),
		];
		const csv = `\uFEFF${rows.map((row) => row.map(csvCell).join(",")).join("\r\n")}`;
		const url = URL.createObjectURL(
			new Blob([csv], { type: "text/csv;charset=utf-8" }),
		);
		const anchor = document.createElement("a");
		anchor.href = url;
		anchor.download = `attribution-${data.period === 0 ? "tout" : "30-jours"}.csv`;
		anchor.click();
		URL.revokeObjectURL(url);
	};
	return (
		<div className="space-y-8">
			<header className="flex flex-wrap items-end justify-between gap-3">
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
					).map((period) => (
						<Link
							key={period.key}
							href={period.href}
							aria-current={
								(data.period === 0 ? "all" : "30") === period.key
									? "page"
									: undefined
							}
							className={`inline-flex min-h-11 items-center rounded-sm px-4 font-label text-xs font-semibold uppercase tracking-[0.12em] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ink dark:focus-visible:ring-cream ${(data.period === 0 ? "all" : "30") === period.key ? "bg-terracotta text-white" : "text-ink-soft hover:bg-sidebar-accent/60 dark:text-cream/80"}`}
						>
							{period.label}
						</Link>
					))}
				</nav>
			</header>
			<OrnamentDivider />
			<section aria-labelledby="marketing-kpis">
				<h2 id="marketing-kpis" className="sr-only">
					{t("admin.marketing.kpis")}
				</h2>
				<div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
					<Kpi
						label={t("admin.marketing.kpiOrders")}
						value={String(filtered.length)}
					/>
					<Kpi
						label={t("admin.marketing.kpiRevenue")}
						value={mad(revenue(filtered))}
					/>
					<Kpi
						label={t("admin.marketing.kpiAttributed")}
						value={String(attributedOrders.length)}
					/>
					<Kpi
						label={t("admin.marketing.kpiDirect")}
						value={String(direct.length)}
					/>
				</div>
				<p aria-live="polite" aria-atomic="true" className="sr-only">
					{t("admin.marketing.announcement", {
						orders: filtered.length,
						attributed: attributedOrders.length,
						revenue: mad(revenue(filtered)),
					})}
				</p>
			</section>
			<section aria-labelledby="marketing-controls" className="space-y-4">
				<h2 id="marketing-controls" className="sr-only">
					{t("admin.marketing.controls")}
				</h2>
				<div className="flex flex-wrap items-center gap-3">
					<div className="relative min-w-56 flex-1">
						<Search
							aria-hidden="true"
							className="absolute start-3 top-1/2 size-4 -translate-y-1/2 text-ink-soft"
						/>
						<label htmlFor="marketing-search" className="sr-only">
							{t("admin.marketing.search")}
						</label>
						<Input
							id="marketing-search"
							value={query}
							onChange={(event) => setQuery(event.target.value)}
							placeholder={t("admin.marketing.searchPlaceholder")}
							className="min-h-11 border-bronze/45 ps-10"
						/>
					</div>
					<label className="flex min-h-11 items-center gap-2 text-xs font-semibold text-ink dark:text-cream">
						<span>{t("admin.marketing.sort")}</span>
						<select
							value={sort}
							onChange={(event) => {
								setSort(event.target.value);
								setAscending(false);
							}}
							className="min-h-11 rounded-sm border border-bronze/50 bg-background px-3 text-sm font-normal text-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ink dark:text-cream dark:focus-visible:ring-cream"
						>
							<option value="date">{t("admin.marketing.sortDate")}</option>
							<option value="order">{t("admin.marketing.sortOrder")}</option>
							<option value="total">{t("admin.marketing.sortTotal")}</option>
						</select>
					</label>
					<Button
						type="button"
						variant="outline"
						aria-label={
							ascending
								? t("admin.marketing.sortDescending")
								: t("admin.marketing.sortAscending")
						}
						onClick={() => setAscending((value) => !value)}
						className="min-h-11 border-bronze/50 font-label text-xs font-semibold uppercase tracking-wide"
					>
						{ascending ? "↑" : "↓"}
					</Button>
					<Button
						type="button"
						variant={excludeTest ? "default" : "outline"}
						aria-pressed={excludeTest}
						onClick={() => setExcludeTest((value) => !value)}
						className="min-h-11 border-bronze/50 font-label text-xs font-semibold uppercase tracking-wide"
					>
						{excludeTest
							? t("admin.marketing.excludeTestOn")
							: t("admin.marketing.excludeTestOff")}
					</Button>
					<Button
						type="button"
						variant="outline"
						onClick={exportCsv}
						className="min-h-11 border-bronze/50 font-label text-xs font-semibold uppercase tracking-wide"
					>
						<Download aria-hidden="true" className="size-4" />
						{t("admin.marketing.export")}
					</Button>
				</div>
				<p className="text-sm text-ink-soft dark:text-cream/80">
					{t("admin.marketing.normalizedSources")}
				</p>
			</section>
			<section aria-labelledby="marketing-tree-heading" className="space-y-3">
				<div>
					<h2 id="marketing-tree-heading" className="label-vintage-lg">
						{t("admin.marketing.sources")}
					</h2>
					<h3 className="mt-1 label-vintage-lg">
						{t("admin.marketing.campaigns")}
					</h3>
				</div>
				<div className="card-vintage overflow-x-auto rounded-sm">
					<table
						role="treegrid"
						aria-labelledby="marketing-tree-heading"
						aria-colcount={4}
						aria-rowcount={flatRows.length + 1}
						className="min-w-[42rem] w-full border-collapse text-sm"
					>
						<thead>
							<tr className="grid grid-cols-[minmax(14rem,2fr)_minmax(8rem,1fr)_minmax(8rem,1fr)_minmax(6rem,.7fr)] border-b border-bronze/35 bg-bronze/10">
								{[
									t("admin.marketing.colSource"),
									t("admin.marketing.colOrders"),
									t("admin.marketing.colRevenue"),
									t("admin.marketing.colShare"),
								].map((label, index) => (
									<th
										scope="col"
										key={label}
										className="px-4 py-3 text-start font-label text-xs font-bold uppercase tracking-wider text-ink dark:text-cream"
									>
										{label}
										{index === 0 && (
											<span className="sr-only">
												{" "}
												— {t("admin.marketing.treeKeyHelp")}
											</span>
										)}
									</th>
								))}
							</tr>
						</thead>
						<tbody>
							{flatRows.map(({ node, depth, parentId }, index) => {
								const order = node.kind === "order" ? node.orders[0] : null;
								const count = node.kind === "order" ? 1 : node.orders.length;
								return (
									<tr
										key={node.id}
										id={node.id}
										aria-level={depth}
										aria-posinset={index + 1}
										aria-setsize={flatRows.length}
										aria-expanded={
											node.children.length ? expanded.has(node.id) : undefined
										}
										tabIndex={focusId === node.id ? 0 : -1}
										onFocus={() => setFocusId(node.id)}
										onKeyDown={(event) =>
											handleTreeKeyDown(event, index, node, parentId)
										}
										className="grid grid-cols-[minmax(14rem,2fr)_minmax(8rem,1fr)_minmax(8rem,1fr)_minmax(6rem,.7fr)] border-b border-border/60 last:border-0 focus-visible:z-10 focus-visible:outline focus-visible:outline-2 focus-visible:outline-ink dark:focus-visible:outline-cream"
									>
										<td
											className="flex min-h-12 items-center gap-2 px-3 py-2"
											style={{ paddingInlineStart: `${12 + depth * 18}px` }}
										>
											{node.children.length > 0 ? (
												<button
													type="button"
													tabIndex={-1}
													aria-label={`${expanded.has(node.id) ? t("admin.marketing.collapse") : t("admin.marketing.expand")} ${node.label}`}
													onClick={() => toggle(node.id)}
													className="inline-flex size-8 shrink-0 items-center justify-center rounded focus-visible:outline focus-visible:outline-2 focus-visible:outline-ink dark:focus-visible:outline-cream"
												>
													{expanded.has(node.id) ? (
														<ChevronDown
															aria-hidden="true"
															className="size-4"
														/>
													) : (
														<ChevronRight
															aria-hidden="true"
															className="size-4"
														/>
													)}
												</button>
											) : (
												<span className="w-8 shrink-0" />
											)}
											<span
												className={
													node.kind === "source"
														? "font-semibold text-ink dark:text-cream"
														: "text-ink-soft dark:text-cream/85"
												}
											>
												{order ? (
													<Link
														href={`/makteb/orders/${order.id}`}
														className="underline decoration-bronze/60 underline-offset-4 hover:text-terracotta focus-visible:outline focus-visible:outline-2 focus-visible:outline-ink dark:focus-visible:outline-cream"
														onKeyDown={(event) => {
															if (event.key === "Enter")
																event.stopPropagation();
														}}
													>
														{order.number}
													</Link>
												) : (
													node.label
												)}
											</span>
											{node.kind !== "order" && (
												<span className="ms-auto text-xs text-ink-soft dark:text-cream/75">
													{node.kind === "source"
														? t("admin.marketing.treeSource")
														: node.kind === "campaign"
															? t("admin.marketing.treeCampaign")
															: t("admin.marketing.treeMedium")}
												</span>
											)}
										</td>
										<td className="flex min-h-12 items-center px-4 py-2 text-ink-soft dark:text-cream/85">
											{count}
										</td>
										<td className="flex min-h-12 items-center px-4 py-2 text-ink-soft dark:text-cream/85">
											{mad(revenue(node.orders))}
										</td>
										<td className="flex min-h-12 items-center px-4 py-2 text-ink-soft dark:text-cream/85">
											{share(count, filtered.length)}
										</td>
									</tr>
								);
							})}
						</tbody>
					</table>
					{flatRows.length === 0 && (
						<p className="p-6 text-center text-sm text-ink-soft dark:text-cream/80">
							{t("admin.marketing.empty")}
						</p>
					)}
				</div>
				<p className="text-xs text-ink-soft dark:text-cream/75">
					{t("admin.marketing.treeKeyHelp")}
				</p>
			</section>
			<section aria-labelledby="marketing-recent-heading" className="space-y-3">
				<h2 id="marketing-recent-heading" className="label-vintage-lg">
					{t("admin.marketing.recent")}
				</h2>
				<div className="card-vintage overflow-x-auto rounded-sm">
					<table className="w-full text-start">
						<thead>
							<tr className="border-b border-bronze/35 bg-bronze/10">
								{[
									t("admin.marketing.colOrder"),
									t("admin.marketing.colSource"),
									t("admin.marketing.colCampaign"),
									t("admin.marketing.colMedium"),
									t("admin.marketing.colTotal"),
								].map((label) => (
									<th
										key={label}
										scope="col"
										className="px-4 py-3 text-start font-label text-xs font-bold uppercase tracking-wider text-ink dark:text-cream"
									>
										{label}
									</th>
								))}
							</tr>
						</thead>
						<tbody>
							{[...attributedOrders]
								.sort(
									(a, b) =>
										new Date(b.createdAt).getTime() -
										new Date(a.createdAt).getTime(),
								)
								.slice(0, 10)
								.map((order) => (
									<tr
										key={order.id}
										className="border-b border-border/60 last:border-0"
									>
										<td className="px-4 py-3 text-ink dark:text-cream">
											<Link
												href={`/makteb/orders/${order.id}`}
												className="underline decoration-bronze/60 underline-offset-4 hover:text-terracotta focus-visible:outline focus-visible:outline-2 focus-visible:outline-ink dark:focus-visible:outline-cream"
											>
												{order.number}
											</Link>
										</td>
										<td className="px-4 py-3 text-ink-soft dark:text-cream/85">
											{cleanSource(order.utmSource, missingSource)}
										</td>
										<td className="px-4 py-3 text-ink-soft dark:text-cream/85">
											{order.utmCampaign || "—"}
										</td>
										<td className="px-4 py-3 text-ink-soft dark:text-cream/85">
											{order.utmMedium || "—"}
										</td>
										<td className="px-4 py-3 text-ink-soft dark:text-cream/85">
											{mad(order.total)}
										</td>
									</tr>
								))}
						</tbody>
					</table>
				</div>
			</section>
		</div>
	);
}
