/** Marketing attribution shapes. */
import type { OrderUtmRow } from "./order/order";

export type MarketingData = {
	period: 30 | 0;
	totals: {
		orders: number;
		revenue: number;
		attributed: number;
		attributedRevenue: number;
	};
	bySource: Array<{ source: string; orders: number; revenue: number }>;
	byCampaign: Array<{
		source: string;
		campaign: string;
		orders: number;
		revenue: number;
	}>;
	recent: OrderUtmRow[];
};
