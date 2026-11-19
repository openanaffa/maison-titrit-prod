import { NextResponse } from "next/server";
import { requirePermission } from "@/lib/session";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { z } from "zod";

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
	if (!allowed) return NextResponse.json({ error: "Non autorisé." }, { status: 403 });
	const { id } = await params;
	try {
		const body = await req.json();
		const parsed = schema.parse(body);
		const supabase = await createSupabaseServerClient();
		const update: Record<string, unknown> = { updatedAt: new Date().toISOString() };
		if (parsed.name !== undefined) update.name = parsed.name.trim();
		if (parsed.cities !== undefined) update.cities = parsed.cities.trim();
		if (parsed.fee !== undefined) update.fee = parsed.fee;
		if (parsed.isActive !== undefined) update.isActive = parsed.isActive;
		const { data, error } = await supabase
			.from("DeliveryZone")
			.update(update)
			.eq("id", id)
			.select("*")
			.single();
		if (error) return NextResponse.json({ error: error.message }, { status: 500 });
		return NextResponse.json({ zone: data });
	} catch (e) {
		return NextResponse.json({ error: "Données invalides." }, { status: 400 });
	}
}

export async function DELETE(
	_req: Request,
	{ params }: { params: Promise<{ id: string }> },
) {
	const { allowed } = await requirePermission("orders:write");
	if (!allowed) return NextResponse.json({ error: "Non autorisé." }, { status: 403 });
	const { id } = await params;
	const supabase = await createSupabaseServerClient();
	const { error } = await supabase.from("DeliveryZone").delete().eq("id", id);
	if (error) return NextResponse.json({ error: error.message }, { status: 500 });
	return NextResponse.json({ ok: true });
}
