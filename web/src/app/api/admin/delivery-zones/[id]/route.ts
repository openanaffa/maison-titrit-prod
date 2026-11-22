import { NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";
import { requirePermission } from "@/lib/session";

export const dynamic = "force-dynamic";

const schema = z.object({
	name: z.string().min(1).optional(),
	cities: z.string().min(1).optional(),
	fee: z.number().int().min(0).optional(),
	isActive: z.boolean().optional(),
});

export async function PATCH(
	req: Request,
	{ params }: { params: Promise<{ id: string }> },
) {
	const { allowed } = await requirePermission("orders:write");
	if (!allowed)
		return NextResponse.json({ error: "Non autorisé." }, { status: 403 });
	const { id } = await params;
	try {
		const body = await req.json();
		const parsed = schema.parse(body);
		const zone = await db.deliveryZone.update({
			where: { id },
			data: {
				...(parsed.name !== undefined ? { name: parsed.name.trim() } : {}),
				...(parsed.cities !== undefined
					? { cities: parsed.cities.trim() }
					: {}),
				...(parsed.fee !== undefined ? { fee: parsed.fee } : {}),
				...(parsed.isActive !== undefined ? { isActive: parsed.isActive } : {}),
			},
		});
		return NextResponse.json({ zone });
	} catch {
		return NextResponse.json({ error: "Données invalides." }, { status: 400 });
	}
}

export async function DELETE(
	_req: Request,
	{ params }: { params: Promise<{ id: string }> },
) {
	const { allowed } = await requirePermission("orders:write");
	if (!allowed)
		return NextResponse.json({ error: "Non autorisé." }, { status: 403 });
	const { id } = await params;
	try {
		await db.deliveryZone.delete({ where: { id } });
		return NextResponse.json({ ok: true });
	} catch {
		return NextResponse.json(
			{ error: "Suppression impossible." },
			{ status: 500 },
		);
	}
}
