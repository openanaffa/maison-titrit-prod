import { NextResponse } from "next/server";
import { recordCustomerAudit } from "@/lib/customer-audit";
import { db } from "@/lib/db";
import { requirePermission } from "@/lib/session";

export const dynamic = "force-dynamic";

/** Add a staff note to a customer (customers:write, audited). */
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
		const text =
			typeof body.body === "string" ? body.body.trim().slice(0, 2000) : "";
		if (!text) {
			return NextResponse.json({ error: "Note vide." }, { status: 400 });
		}
		const customer = await db.user.findFirst({
			where: { id, role: "CUSTOMER" },
			select: { id: true },
		});
		if (!customer) {
			return NextResponse.json({ error: "Introuvable." }, { status: 404 });
		}
		const note = await db.customerNote.create({
			data: { userId: id, authorId: user.id, body: text },
		});
		await recordCustomerAudit("NOTE_ADDED", {
			userId: id,
			actorId: user.id,
			detail: text.slice(0, 120),
		});
		return NextResponse.json({
			note: {
				id: note.id,
				body: note.body,
				authorName: user.name ?? "",
				createdAt: note.createdAt,
			},
		});
	} catch (e) {
		console.error("POST /api/admin/customers/[id]/notes failed", e);
		return NextResponse.json({ error: "Ajout impossible." }, { status: 500 });
	}
}
