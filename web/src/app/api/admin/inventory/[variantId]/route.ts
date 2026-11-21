import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { requirePermission } from "@/lib/session";
import { receiveStock, adjustStock, damageStock, returnStock, releaseReservation, commitStock, reconcileVariant } from "@/lib/inventory";
import { z } from "zod";

export const dynamic = "force-dynamic";

const adjustSchema = z.object({
	type: z.enum(["receive", "adjust", "damage", "return", "release", "commit"]),
	qty: z.number().int(),
	reason: z.string().optional(),
	actorId: z.string().optional(),
});

export async function GET(
	_req: Request,
	{ params }: { params: Promise<{ variantId: string }> },
) {
	const { allowed } = await requirePermission("products:read");
	if (!allowed) return NextResponse.json({ error: "Non autorisé." }, { status: 403 });
	const { variantId } = await params;
	const movements = await db.stockMovement.findMany({
		where: { variantId },
		orderBy: { createdAt: "desc" },
		take: 50,
	});
	const reconcile = await reconcileVariant(variantId);
	return NextResponse.json({ movements, reconcile });
}

export async function POST(
	req: Request,
	{ params }: { params: Promise<{ variantId: string }> },
) {
	const { user, allowed } = await requirePermission("products:write");
	if (!user || !allowed) return NextResponse.json({ error: "Non autorisé." }, { status: 403 });
	const { variantId } = await params;
	try {
		const body = await req.json();
		const parsed = adjustSchema.parse(body);
		const opts = { actorId: user.id, reason: parsed.reason ?? null };
		let result;
		switch (parsed.type) {
			case "receive":
				result = await receiveStock(variantId, parsed.qty, opts);
				break;
			case "adjust":
				result = await adjustStock(variantId, parsed.qty, opts);
				break;
			case "damage":
				result = await damageStock(variantId, Math.abs(parsed.qty), opts);
				break;
			case "return":
				result = await returnStock(variantId, Math.abs(parsed.qty), opts);
				break;
			case "release":
				result = await releaseReservation(variantId, Math.abs(parsed.qty), opts);
				break;
			case "commit":
				result = await commitStock(variantId, Math.abs(parsed.qty), opts);
				break;
		}
		return NextResponse.json({ result });
	} catch (e) {
		const msg = e instanceof Error ? e.message : "Erreur";
		return NextResponse.json({ error: msg }, { status: 400 });
	}
}
