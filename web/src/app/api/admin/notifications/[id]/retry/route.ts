import { NextResponse } from "next/server";
import { retryNotification } from "@/lib/order-notifications";
import { requirePermission } from "@/lib/session";

export const dynamic = "force-dynamic";

/**
 * Staff-triggered retry of a failed customer notification (issue #121).
 * Re-runs the transport attempt for one persisted notification row.
 */
export async function POST(
	_req: Request,
	{ params }: { params: Promise<{ id: string }> },
) {
	const { user, allowed } = await requirePermission("orders:write");
	if (!user || !allowed) {
		return NextResponse.json({ error: "Non autorisé." }, { status: 403 });
	}
	const { id } = await params;
	try {
		const result = await retryNotification(id);
		if (result === "NOT_FOUND") {
			return NextResponse.json({ error: "Introuvable." }, { status: 404 });
		}
		if (result === "ALREADY_SENT") {
			return NextResponse.json(
				{ error: "Notification déjà envoyée." },
				{ status: 409 },
			);
		}
		return NextResponse.json({ status: result });
	} catch (e) {
		console.error("POST /api/admin/notifications/[id]/retry failed", e);
		return NextResponse.json(
			{ error: "Nouvelle tentative impossible." },
			{ status: 500 },
		);
	}
}
