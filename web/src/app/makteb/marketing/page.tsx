import { MarketingClient } from "@/components/admin/marketing-client";
import { listMarketingOrders } from "@/lib/repositories/orders";
import { requirePagePermission } from "@/lib/session";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import type { MarketingData, OrderUtmRow } from "@/lib/types";

export const dynamic = "force-dynamic";

function aggregate(orders: OrderUtmRow[], periodDays: 30 | 0): MarketingData {
	const cutoff = periodDays ? Date.now() - periodDays * 24 * 60 * 60 * 1000 : 0;
	const scoped = orders.filter(
		(o) => !cutoff || new Date(o.createdAt).getTime() >= cutoff,
	);

	let revenue = 0;
	let attributed = 0;
	let attributedRevenue = 0;
	const bySource = new Map<string, { orders: number; revenue: number }>();
	const byCampaign = new Map<
		string,
		{ source: string; campaign: string; orders: number; revenue: number }
	>();
	const recentAttributed: OrderUtmRow[] = [];

	for (const o of scoped) {
		const cancelled = o.status === "CANCELLED";
		if (!cancelled) revenue += o.total;
		if (!o.utmSource) continue;
		attributed += 1;
		if (!cancelled) attributedRevenue += o.total;

		const source = o.utmSource
			.trim()
			.toLowerCase()
			.replace(/ms-egde/g, "ms-edge");
		const src = bySource.get(source) ?? { orders: 0, revenue: 0 };
		src.orders += 1;
		if (!cancelled) src.revenue += o.total;
		bySource.set(source, src);

		const campaign = o.utmCampaign || "—";
		const ck = `${source}||${campaign}`;
		const camp = byCampaign.get(ck) ?? {
			source,
			campaign,
			orders: 0,
			revenue: 0,
		};
		camp.orders += 1;
		if (!cancelled) camp.revenue += o.total;
		byCampaign.set(ck, camp);

		if (recentAttributed.length < 10) {
			recentAttributed.push({
				id: o.id,
				number: o.number,
				status: o.status,
				total: o.total,
				currency: o.currency,
				utmSource: o.utmSource,
				utmMedium: o.utmMedium,
				utmCampaign: o.utmCampaign,
				createdAt: o.createdAt,
			});
		}
	}

	return {
		period: periodDays,
		totals: { orders: scoped.length, revenue, attributed, attributedRevenue },
		bySource: [...bySource.entries()]
			.map(([source, v]) => ({ source, ...v }))
			.sort((a, b) => b.orders - a.orders),
		byCampaign: [...byCampaign.values()].sort((a, b) => b.orders - a.orders),
		orders: scoped.map((o) => ({
			id: o.id,
			number: o.number,
			status: o.status,
			total: o.total,
			currency: o.currency,
			utmSource: o.utmSource,
			utmMedium: o.utmMedium,
			utmCampaign: o.utmCampaign,
			createdAt: o.createdAt,
		})),
		recent: recentAttributed,
	};
}

export default async function MaktebMarketingPage({
	searchParams,
}: {
	searchParams: Promise<{ period?: string }>;
}) {
	await requirePagePermission("orders:read");
	const { period } = await searchParams;
	const periodDays = period === "all" ? 0 : 30;

	const supabase = await createSupabaseServerClient();
	const orders = await listMarketingOrders(supabase);

	const data = aggregate(orders as OrderUtmRow[], periodDays === 0 ? 0 : 30);
	return <MarketingClient data={data} />;
}
