import { requirePagePermission } from "@/lib/session";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { MarketingClient, type MarketingData, type OrderUtmRow } from "@/components/admin/marketing-client";

export const dynamic = "force-dynamic";

type OrderRow = {
  id: string;
  number: string;
  status: string;
  total: number;
  currency: string;
  utmSource: string | null;
  utmMedium: string | null;
  utmCampaign: string | null;
  createdAt: string;
};

function aggregate(orders: OrderRow[], periodDays: 30 | 0): MarketingData {
  const cutoff = periodDays ? Date.now() - periodDays * 24 * 60 * 60 * 1000 : 0;
  const scoped = orders.filter((o) => !cutoff || new Date(o.createdAt).getTime() >= cutoff);

  let revenue = 0;
  let attributed = 0;
  let attributedRevenue = 0;
  const bySource = new Map<string, { orders: number; revenue: number }>();
  const byCampaign = new Map<string, { source: string; campaign: string; orders: number; revenue: number }>();
  const recentAttributed: OrderUtmRow[] = [];

  for (const o of scoped) {
    const cancelled = o.status === "CANCELLED";
    if (!cancelled) revenue += o.total;
    if (!o.utmSource) continue;
    attributed += 1;
    if (!cancelled) attributedRevenue += o.total;

    const src = bySource.get(o.utmSource) ?? { orders: 0, revenue: 0 };
    src.orders += 1;
    if (!cancelled) src.revenue += o.total;
    bySource.set(o.utmSource, src);

    const campaign = o.utmCampaign || "—";
    const ck = `${o.utmSource}||${campaign}`;
    const camp = byCampaign.get(ck) ?? { source: o.utmSource, campaign, orders: 0, revenue: 0 };
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
  const { data: orders } = await supabase
    .from("Order")
    .select("id,number,status,total,currency,utmSource,utmMedium,utmCampaign,createdAt")
    .order("createdAt", { ascending: false })
    .throwOnError();

  const data = aggregate((orders ?? []) as OrderRow[], periodDays === 0 ? 0 : 30);
  return <MarketingClient data={data} />;
}
