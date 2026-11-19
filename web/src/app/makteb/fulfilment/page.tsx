import { FulfilmentQueueClient } from "@/components/admin/fulfilment-queue-client";
import { listFulfilmentOrders } from "@/lib/repositories/orders";
import { requirePagePermission } from "@/lib/session";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { FULFILMENT_QUEUES } from "@/lib/types/constants";

export const dynamic = "force-dynamic";

export default async function MaktebFulfilmentPage({
	searchParams,
}: {
	searchParams: Promise<{
		queue?: string;
		q?: string;
		from?: string;
		to?: string;
	}>;
}) {
	await requirePagePermission("orders:read");
	const { queue, q, from, to } = await searchParams;
	const activeQueue =
		FULFILMENT_QUEUES.find((f) => f.key === queue) ?? FULFILMENT_QUEUES[0];

	const supabase = await createSupabaseServerClient();
	const rows = await listFulfilmentOrders(supabase, {
		statuses: activeQueue.statuses,
		search: q ?? undefined,
		from: from ?? undefined,
		to: to ?? undefined,
	});

	// Tab counts come from one cross-queue pass (store-scale dataset).
	const countRows = await listFulfilmentOrders(supabase, {
		statuses: FULFILMENT_QUEUES.flatMap((f) => f.statuses),
	});
	const counts = Object.fromEntries(
		FULFILMENT_QUEUES.map((f) => [
			f.key,
			countRows.filter((r) => f.statuses.includes(r.status)).length,
		]),
	);

	return (
		<FulfilmentQueueClient
			queues={FULFILMENT_QUEUES}
			counts={counts}
			activeQueue={activeQueue.key}
			rows={rows}
		/>
	);
}
