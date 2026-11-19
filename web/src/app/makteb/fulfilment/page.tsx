import { FulfilmentQueueClient } from "@/components/admin/fulfilment-queue-client";
import { listFulfilmentOrders } from "@/lib/repositories/orders";
import { can } from "@/lib/roles";
import { getCurrentUser, requirePagePermission } from "@/lib/session";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { FULFILMENT_QUEUES } from "@/lib/types/constants";

export const dynamic = "force-dynamic";

/** Exceptions default to the last 30 days (issue #121 scope). */
const EXCEPTIONS_WINDOW_DAYS = 30;

function exceptionsFromBound(): string {
	const d = new Date();
	d.setUTCDate(d.getUTCDate() - EXCEPTIONS_WINDOW_DAYS);
	return d.toISOString();
}

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
	// The exceptions queue only shows recent cancellations unless staff
	// widen the window explicitly.
	const effectiveFrom =
		from ??
		(activeQueue.key === "exceptions" ? exceptionsFromBound() : undefined);

	const supabase = await createSupabaseServerClient();
	const rows = await listFulfilmentOrders(supabase, {
		statuses: activeQueue.statuses,
		search: q ?? undefined,
		from: effectiveFrom,
		to: to ?? undefined,
	});

	// Tab counts per queue, mirroring each queue's own default window.
	const countResults = await Promise.all(
		FULFILMENT_QUEUES.map((f) =>
			listFulfilmentOrders(supabase, {
				statuses: f.statuses,
				search: q ?? undefined,
				from:
					from ?? (f.key === "exceptions" ? exceptionsFromBound() : undefined),
				to: to ?? undefined,
			}),
		),
	);
	const counts = Object.fromEntries(
		FULFILMENT_QUEUES.map((f, i) => [f.key, countResults[i].length]),
	);

	const user = await getCurrentUser();
	const canWrite = user ? can(user.role, "orders:write") : false;

	return (
		<FulfilmentQueueClient
			queues={FULFILMENT_QUEUES}
			counts={counts}
			activeQueue={activeQueue.key}
			rows={rows}
			canWrite={canWrite}
		/>
	);
}
