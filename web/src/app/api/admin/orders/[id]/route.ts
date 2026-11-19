import { NextResponse } from "next/server";
import {
	isNotifyingEvent,
	queueCustomerNotifications,
} from "@/lib/order-notifications";
import {
	isAllowedTransition,
	ORDER_STATUSES,
	transitionOrder,
} from "@/lib/order-status";
import { requirePermission } from "@/lib/session";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import type { CustomerNotificationEvent } from "@/lib/types/notifications";

export const dynamic = "force-dynamic";

/** Acceptable delivery field payload: non-empty, bounded strings. */
function deliveryField(value: unknown): string | null {
	if (typeof value !== "string") return null;
	const trimmed = value.trim().slice(0, 120);
	return trimmed.length > 0 ? trimmed : null;
}

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
		// Delivery provider/reference capture (issue #121) — operational
		// bookkeeping, only accepted with a valid transition.
		const deliveryProvider = deliveryField(body.deliveryProvider);
		const deliveryReference = deliveryField(body.deliveryReference);
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
		if (deliveryProvider !== null || deliveryReference !== null) {
			const { error: deliveryError } = await supabase
				.from("Order")
				.update({
					...(deliveryProvider !== null ? { deliveryProvider } : {}),
					...(deliveryReference !== null ? { deliveryReference } : {}),
				})
				.eq("id", id)
				.throwOnError();
			if (deliveryError) throw deliveryError;
		}
		// Customer notification trigger (issue #121) — fire-and-forget after
		// the transition commit; a failed send never blocks the transition.
		if (isNotifyingEvent(status)) {
			void queueCustomerNotifications(
				{
					id,
					number: order.number,
					customerName: order.customerName,
					customerEmail: order.customerEmail ?? "",
					customerPhone: order.customerPhone,
					total: order.total,
					deliveryProvider: order.deliveryProvider ?? "",
					deliveryReference: order.deliveryReference ?? "",
				},
				status as CustomerNotificationEvent,
			);
		}
		return NextResponse.json({ order });
	} catch (e) {
		console.error("PATCH /api/admin/orders/[id] failed", e);
		return NextResponse.json(
			{ error: "Mise à jour impossible." },
			{ status: 500 },
		);
	}
}
