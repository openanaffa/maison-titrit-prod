"use client";

import { Compass, Megaphone, ShoppingBag, TrendingUp } from "lucide-react";
import Link from "next/link";
import type * as React from "react";
import { OrnamentDivider } from "@/components/maison/motifs";
import { useT } from "@/i18n/locale-provider";
import type { MarketingData } from "@/lib/types";
import { mad } from "@/lib/types/constants";

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

export function MarketingClient({ data }: { data: MarketingData }) {
	const { t } = useT();
	const direct = data.totals.orders - data.totals.attributed;

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
					).map((p) => (
						<Link
							key={p.key}
							href={p.href}
							aria-current={
								(data.period === 0 ? "all" : "30") === p.key
									? "page"
									: undefined
							}
							className={`rounded-sm px-3 py-1.5 font-label text-[0.62rem] uppercase tracking-[0.14em] transition-colors ${
								(data.period === 0 ? "all" : "30") === p.key
									? "bg-terracotta text-cream"
									: "text-ink-soft hover:bg-sidebar-accent/60 dark:text-cream/70"
							}`}
						>
							{p.label}
						</Link>
					))}
				</nav>
			</div>

			<OrnamentDivider />

			{/* KPIs */}
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

			{/* By source */}
			<section className="space-y-3">
				<h2 className="label-vintage-lg">{t("admin.marketing.sources")}</h2>
				{data.bySource.length === 0 ? (
					<p className="card-vintage rounded-sm p-6 text-center font-serif text-sm body-vintage-soft">
						{t("admin.marketing.empty")}
					</p>
				) : (
					<div className="card-vintage overflow-x-auto rounded-sm">
						<table className="w-full text-start">
							<thead>
								<tr className="border-b border-border">
									{[
										t("admin.marketing.colSource"),
										t("admin.marketing.colOrders"),
										t("admin.marketing.colRevenue"),
										t("admin.marketing.colShare"),
									].map((h) => (
										<th
											key={h}
											className="px-4 py-3 text-start font-label text-[0.6rem] uppercase tracking-[0.18em] body-vintage-soft"
										>
											{h}
										</th>
									))}
								</tr>
							</thead>
							<tbody>
								{data.bySource.map((s) => (
									<tr
										key={s.source}
										className="border-b border-border/60 last:border-0"
									>
										<td className="px-4 py-3 body-vintage-sm">{s.source}</td>
										<td className="px-4 py-3 body-vintage-muted">{s.orders}</td>
										<td className="px-4 py-3 body-vintage-muted">
											{mad(s.revenue)}
										</td>
										<td className="px-4 py-3 body-vintage-muted">
											{share(s.orders, data.totals.orders)}
										</td>
									</tr>
								))}
							</tbody>
						</table>
					</div>
				)}
			</section>

			{/* By campaign */}
			{data.byCampaign.length > 0 && (
				<section className="space-y-3">
					<h2 className="label-vintage-lg">{t("admin.marketing.campaigns")}</h2>
					<div className="card-vintage overflow-x-auto rounded-sm">
						<table className="w-full">
							<thead>
								<tr className="border-b border-border">
									{[
										t("admin.marketing.colSource"),
										t("admin.marketing.colCampaign"),
										t("admin.marketing.colOrders"),
										t("admin.marketing.colRevenue"),
									].map((h) => (
										<th
											key={h}
											className="px-4 py-3 text-start font-label text-[0.6rem] uppercase tracking-[0.18em] body-vintage-soft"
										>
											{h}
										</th>
									))}
								</tr>
							</thead>
							<tbody>
								{data.byCampaign.map((c) => (
									<tr
										key={`${c.source}||${c.campaign}`}
										className="border-b border-border/60 last:border-0"
									>
										<td className="px-4 py-3 body-vintage-sm">{c.source}</td>
										<td className="px-4 py-3 body-vintage-muted">
											{c.campaign}
										</td>
										<td className="px-4 py-3 body-vintage-muted">{c.orders}</td>
										<td className="px-4 py-3 body-vintage-muted">
											{mad(c.revenue)}
										</td>
									</tr>
								))}
							</tbody>
						</table>
					</div>
				</section>
			)}

			{/* Recent attributed orders */}
			{data.recent.length > 0 && (
				<section className="space-y-3">
					<h2 className="label-vintage-lg">{t("admin.marketing.recent")}</h2>
					<div className="card-vintage overflow-x-auto rounded-sm">
						<table className="w-full">
							<thead>
								<tr className="border-b border-border">
									{[
										t("admin.marketing.colOrder"),
										t("admin.marketing.colSource"),
										t("admin.marketing.colCampaign"),
										t("admin.marketing.colMedium"),
										t("admin.marketing.colTotal"),
									].map((h) => (
										<th
											key={h}
											className="px-4 py-3 text-start font-label text-[0.6rem] uppercase tracking-[0.18em] body-vintage-soft"
										>
											{h}
										</th>
									))}
								</tr>
							</thead>
							<tbody>
								{data.recent.map((o) => (
									<tr
										key={o.id}
										className="border-b border-border/60 last:border-0"
									>
										<td className="px-4 py-3 font-serif text-sm">
											<Link
												href={`/makteb/orders/${o.id}`}
												className="text-ink underline decoration-bronze/40 underline-offset-4 hover:text-bronze dark:text-cream"
											>
												{o.number}
											</Link>
										</td>
										<td className="px-4 py-3 body-vintage-muted">
											{o.utmSource}
										</td>
										<td className="px-4 py-3 body-vintage-muted">
											{o.utmCampaign || "—"}
										</td>
										<td className="px-4 py-3 body-vintage-muted">
											{o.utmMedium || "—"}
										</td>
										<td className="px-4 py-3 body-vintage-muted">
											{mad(o.total)}
										</td>
									</tr>
								))}
							</tbody>
						</table>
					</div>
				</section>
			)}
		</div>
	);
}
