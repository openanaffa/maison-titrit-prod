import { NextResponse } from "next/server";
import {
	getDefaultLegalIdentity,
	getLegalIdentity,
	sanitizeLegalIdentity,
} from "@/lib/legal-identity";
import {
	getLegalIdentityRaw,
	setLegalIdentity,
} from "@/lib/repositories/legal-identity";
import { requirePermission } from "@/lib/session";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

/** Owner/founder: view stored and effective legal identity. */
export async function GET() {
	const { user, allowed } = await requirePermission("settings:write");
	if (!user || !allowed) {
		return NextResponse.json({ error: "Non autorisé." }, { status: 403 });
	}
	try {
		const supabase = await createSupabaseServerClient();
		const stored = await getLegalIdentityRaw(supabase);
		const effective = await getLegalIdentity();
		return NextResponse.json({
			stored: sanitizeLegalIdentity(stored),
			effective,
			defaults: getDefaultLegalIdentity(),
		});
	} catch (e) {
		console.error("GET /api/settings/legal failed", e);
		return NextResponse.json({ error: "Lecture impossible." }, { status: 500 });
	}
}

/** Owner/founder: update legal identity (all fields optional). */
export async function PATCH(req: Request) {
	const { user, allowed } = await requirePermission("settings:write");
	if (!user || !allowed) {
		return NextResponse.json({ error: "Non autorisé." }, { status: 403 });
	}
	try {
		const body = await req.json();
		const supabase = await createSupabaseServerClient();
		const stored = await setLegalIdentity(supabase, body);
		const effective = await getLegalIdentity();
		return NextResponse.json({ stored, effective });
	} catch (e) {
		console.error("PATCH /api/settings/legal failed", e);
		return NextResponse.json(
			{ error: "Mise à jour impossible." },
			{ status: 500 },
		);
	}
}
