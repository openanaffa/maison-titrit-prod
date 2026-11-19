import { NextResponse } from "next/server";
import {
	isAllowedTransition,
	ORDER_STATUSES,
	transitionOrder,
} from "@/lib/order-status";
import { requirePermission } from "@/lib/session";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

export async function PATCH(
	req: Request,
	{ params }: { params: Promise<{ id: string }> },
) {
	const { user, allowed } = await requirePermission("orders:write");
	if (!user || !allowed) {
		return NextResponse.json({ error: "Non autorisé." }, { status: 403 });
	}
	const { id } = await params;
	try {
		const body = await req.json();
		const status = String(body.status ?? "").toUpperCase();
		if (!ORDER_STATUSES.includes(status as (typeof ORDER_STATUSES)[number])) {
			return NextResponse.json({ error: "Statut invalide." }, { status: 400 });
		}
		const supabase = await createSupabaseServerClient();
		// Load current status to validate the transition before mutating.
		const { data: current } = await supabase
			.from("Order")
			.select("status")
			.eq("id", id)
			.maybeSingle();
		if (!current) {
			return NextResponse.json({ error: "Introuvable." }, { status: 404 });
		}
		if (current.status === status) {
			return NextResponse.json({ status: current.status });
		}
		if (!isAllowedTransition(current.status, status)) {
			return NextResponse.json(
				{ error: "Transition non autorisée." },
				{ status: 409 },
			);
		}
		const order = await transitionOrder(id, status, {
			actorId: user.id,
			reason: typeof body.reason === "string" ? body.reason : null,
		});
		return NextResponse.json({ order });
	} catch (e) {
		console.error("PATCH /api/admin/orders/[id] failed", e);
		return NextResponse.json(
			{ error: "Mise à jour impossible." },
			{ status: 500 },
		);
	}
}
