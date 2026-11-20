import { NextResponse } from "next/server";
import { recordCustomerAudit } from "@/lib/customer-audit";
import { db } from "@/lib/db";
import { requirePermission } from "@/lib/session";

export const dynamic = "force-dynamic";

/** Staff-recorded marketing consent (customers:write, audited). */
export async function POST(
	req: Request,
	{ params }: { params: Promise<{ id: string }> },
) {
	const { user, allowed } = await requirePermission("customers:write");
	if (!user || !allowed) {
		return NextResponse.json({ error: "Non autorisé." }, { status: 403 });
	}
	const { id } = await params;
	try {
		const body = await req.json();
		// Strict validation (Codex P2): unsupported values are rejected; an
		// explicit null is the only way to unset consent — a typo must not
		// silently clear a customer's recorded consent.
		let consent: string | null;
		if (body.consent === null) {
			consent = null;
		} else if (body.consent === "OPTED_IN" || body.consent === "OPTED_OUT") {
			consent = body.consent as string;
		} else {
			return NextResponse.json(
				{ error: "Valeur de consentement invalide." },
				{ status: 400 },
			);
		}
		const customer = await db.user.findFirst({
			where: { id, role: "CUSTOMER" },
			select: { id: true, marketingConsent: true },
		});
		if (!customer) {
			return NextResponse.json({ error: "Introuvable." }, { status: 404 });
		}
		await db.user.update({
			where: { id },
			data: { marketingConsent: consent },
		});
		await recordCustomerAudit("CONSENT_CHANGED", {
			userId: id,
			actorId: user.id,
			detail: `${customer.marketingConsent ?? "UNKNOWN"} → ${consent ?? "UNKNOWN"}`,
		});
		return NextResponse.json({ consent });
	} catch (e) {
		console.error("POST /api/admin/customers/[id]/consent failed", e);
		return NextResponse.json(
			{ error: "Mise à jour impossible." },
			{ status: 500 },
		);
	}
}
