import { NextResponse } from "next/server";
import { requirePermission } from "@/lib/session";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { z } from "zod";

export const dynamic = "force-dynamic";

const schema = z.object({
	name: z.string().min(1),
	cities: z.string().min(1),
	fee: z.number().int().min(0),
	isActive: z.boolean().optional(),
});

export async function GET() {
	const { allowed } = await requirePermission("orders:write");
	if (!allowed) return NextResponse.json({ error: "Non autorisé." }, { status: 403 });
	const supabase = await createSupabaseServerClient();
	const { data, error } = await supabase
		.from("DeliveryZone")
		.select("*")
		.order("name", { ascending: true });
	if (error) return NextResponse.json({ error: error.message }, { status: 500 });
	return NextResponse.json({ zones: data ?? [] });
}

export async function POST(req: Request) {
	const { allowed } = await requirePermission("orders:write");
	if (!allowed) return NextResponse.json({ error: "Non autorisé." }, { status: 403 });
	try {
		const body = await req.json();
		const parsed = schema.parse(body);
		const supabase = await createSupabaseServerClient();
		const { data, error } = await supabase
			.from("DeliveryZone")
			.insert({
				id: crypto.randomUUID(),
				name: parsed.name.trim(),
				cities: parsed.cities.trim(),
				fee: parsed.fee,
				isActive: parsed.isActive ?? true,
				createdAt: new Date().toISOString(),
				updatedAt: new Date().toISOString(),
			})
			.select("*")
			.single();
		if (error) return NextResponse.json({ error: error.message }, { status: 500 });
		return NextResponse.json({ zone: data });
	} catch (e) {
		return NextResponse.json({ error: "Données invalides." }, { status: 400 });
	}
}
