import { NextResponse } from "next/server";
import { requirePermission } from "@/lib/session";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

const VALID = ["PENDING", "CONFIRMED", "SHIPPED", "DELIVERED", "CANCELLED"];

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
		if (!VALID.includes(status)) {
			return NextResponse.json({ error: "Statut invalide." }, { status: 400 });
		}
		const supabase = await createSupabaseServerClient();
		const { data: order } = await supabase
			.from("Order")
			.update({ status, updatedAt: new Date().toISOString() })
			.eq("id", id)
			.select("*")
			.maybeSingle()
			.throwOnError();
		if (!order)
			return NextResponse.json({ error: "Introuvable." }, { status: 404 });
		return NextResponse.json({ order });
	} catch (e) {
		console.error("PATCH /api/admin/orders/[id] failed", e);
		return NextResponse.json(
			{ error: "Mise à jour impossible." },
			{ status: 500 },
		);
	}
}
