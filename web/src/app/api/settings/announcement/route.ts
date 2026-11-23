import { NextResponse } from "next/server";
import { setAnnouncement } from "@/lib/repositories/settings";
import { requirePermission } from "@/lib/session";
import { createSupabasePublicClient } from "@/lib/supabase/public";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

const DEFAULT = { active: false, message: "", link: "" };

/** Public: get the current announcement bar (no auth). */
export async function GET() {
	const { data: row, error } = await createSupabasePublicClient()
		.from("Setting")
		.select("value")
		.eq("key", "announcement")
		.maybeSingle();
	if (error) {
		console.error("GET /api/settings/announcement failed", error);
		return NextResponse.json({ error: "Lecture impossible." }, { status: 500 });
	}
	const bar = row ? { ...DEFAULT, ...JSON.parse(row.value) } : DEFAULT;
	return NextResponse.json({ bar });
}

/** Founder-only: update the announcement bar. */
export async function PATCH(req: Request) {
	const { user, allowed } = await requirePermission("settings:write");
	if (!user || !allowed) {
		return NextResponse.json({ error: "Non autorisé." }, { status: 403 });
	}
	try {
		const body = await req.json();
		const bar = {
			active: !!body.active,
			message: String(body.message ?? "").slice(0, 200),
			link: String(body.link ?? "").slice(0, 200),
		};
		const supabase = await createSupabaseServerClient();
		await setAnnouncement(supabase, bar);
		return NextResponse.json({ bar });
	} catch (e) {
		console.error("PATCH /api/settings/announcement failed", e);
		return NextResponse.json(
			{ error: "Mise à jour impossible." },
			{ status: 500 },
		);
	}
}
