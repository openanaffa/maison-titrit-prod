import { NextResponse } from "next/server";
import { recordCustomerAudit } from "@/lib/customer-audit";
import { db } from "@/lib/db";
import { requirePermission } from "@/lib/session";

export const dynamic = "force-dynamic";

/** Remove a staff note (customers:write, audited). */
export async function DELETE(
	_req: Request,
	{ params }: { params: Promise<{ id: string; noteId: string }> },
) {
	const { user, allowed } = await requirePermission("customers:write");
	if (!user || !allowed) {
		return NextResponse.json({ error: "Non autorisé." }, { status: 403 });
	}
	const { id, noteId } = await params;
	try {
		const note = await db.customerNote.findUnique({
			where: { id: noteId },
			select: { id: true, userId: true, body: true },
		});
		if (!note || note.userId !== id) {
			return NextResponse.json({ error: "Introuvable." }, { status: 404 });
		}
		await db.customerNote.delete({ where: { id: noteId } });
		await recordCustomerAudit("NOTE_REMOVED", {
			userId: id,
			actorId: user.id,
			detail: note.body.slice(0, 120),
		});
		return NextResponse.json({ ok: true });
	} catch (e) {
		console.error("DELETE /api/admin/customers/[id]/notes/[noteId] failed", e);
		return NextResponse.json(
			{ error: "Suppression impossible." },
			{ status: 500 },
		);
	}
}
