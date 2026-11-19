import { NextResponse } from "next/server";
import { requirePermission } from "@/lib/session";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

/**
 * Notification ledger rows for one order (issue #121) — powers the retry
 * visibility and staff-triggered retries in the fulfilment queue.
 */
export async function GET(
	_req: Request,
	{ params }: { params: Promise<{ id: string }> },
) {
	const { user, allowed } = await requirePermission("orders:write");
	if (!user || !allowed) {
		return NextResponse.json({ error: "Non autorisé." }, { status: 403 });
	}
	const { id } = await params;
	try {
		const supabase = await createSupabaseServerClient();
		const { data, error } = await supabase
			.from("OrderNotification")
			.select("id,event,channel,to,status,attempts,lastError,lastAttemptAt")
			.eq("orderId", id)
			.order("createdAt", { ascending: false })
			.throwOnError();
		if (error) throw error;
		return NextResponse.json({ notifications: data ?? [] });
	} catch (e) {
		console.error("GET /api/admin/orders/[id]/notifications failed", e);
		return NextResponse.json({ error: "Lecture impossible." }, { status: 500 });
	}
}
