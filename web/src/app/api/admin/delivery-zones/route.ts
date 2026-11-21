import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { requirePermission } from "@/lib/session";
import { z } from "zod";

export const dynamic = "force-dynamic";

const schema = z.object({
	name: z.string().min(1),
	cities: z.string().min(1),
	fee: z.number().int().min(0),
	isActive: z.boolean().optional(),
});

export async function GET() {
	const { allowed } = await requirePermission("products:read");
	if (!allowed) return NextResponse.json({ error: "Non autorisé." }, { status: 403 });
	const zones = await db.deliveryZone.findMany({ orderBy: { name: "asc" } });
	return NextResponse.json({ zones });
}

export async function POST(req: Request) {
	const { allowed } = await requirePermission("products:write");
	if (!allowed) return NextResponse.json({ error: "Non autorisé." }, { status: 403 });
	try {
		const body = await req.json();
		const parsed = schema.parse(body);
		const zone = await db.deliveryZone.create({
			data: {
				name: parsed.name.trim(),
				cities: parsed.cities.trim(),
				fee: parsed.fee,
				isActive: parsed.isActive ?? true,
			},
		});
		return NextResponse.json({ zone });
	} catch (e) {
		return NextResponse.json({ error: "Données invalides." }, { status: 400 });
	}
}
