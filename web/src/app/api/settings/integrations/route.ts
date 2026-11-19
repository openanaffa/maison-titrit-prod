import { NextResponse } from "next/server";
import {
	getIntegrations,
	sanitizeAnalytics,
	sanitizeVerification,
} from "@/lib/integrations";
import {
	getIntegrationsRaw,
	setIntegrations,
} from "@/lib/repositories/settings";
import { requirePermission } from "@/lib/session";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

/** Owner or marketer (tags): view integrations. Marketers see trackers only. */
export async function GET() {
	const { user, allowed: canSettings } =
		await requirePermission("settings:write");
	if (!user || !canSettings) {
		// Marketers manage tags — trackers only, no domain verifications.
		const { user: mUser, allowed: canInts } =
			await requirePermission("integrations:write");
		if (!mUser || !canInts) {
			return NextResponse.json({ error: "Non autorisé." }, { status: 403 });
		}
		try {
			const supabase = await createSupabaseServerClient();
			const { analytics } = await getIntegrationsRaw(supabase);
			const analyticsValue = analytics;
			const effective = await getIntegrations();
			return NextResponse.json({
				analyticsValue,
				effective: { analytics: effective.analytics },
			});
		} catch (e) {
			console.error("GET /api/settings/integrations failed", e);
			return NextResponse.json(
				{ error: "Lecture impossible." },
				{ status: 500 },
			);
		}
	}
	try {
		const supabase = await createSupabaseServerClient();
		const { analytics, verification } = await getIntegrationsRaw(supabase);
		const effective = await getIntegrations();
		// Key names match the client hook (useIntegrations) and the trackers
		// branch above; the form reads analyticsValue/verificationValue.
		return NextResponse.json({
			analyticsValue: analytics,
			verificationValue: verification,
			effective,
		});
	} catch (e) {
		console.error("GET /api/settings/integrations failed", e);
		return NextResponse.json({ error: "Lecture impossible." }, { status: 500 });
	}
}

/** Update integrations: trackers need integrations:write, domain
 *  verifications need settings:write — a marketer may PATCH analytics only. */
export async function PATCH(req: Request) {
	const { user, allowed: canSettings } =
		await requirePermission("settings:write");
	const { user: mUser, allowed: canInts } =
		await requirePermission("integrations:write");
	if (!user && !mUser) {
		return NextResponse.json({ error: "Non autorisé." }, { status: 403 });
	}
	try {
		const body = await req.json();
		const wantsAnalytics = body.analytics != null;
		const wantsVerification = body.verification != null;
		if ((wantsVerification && !canSettings) || (wantsAnalytics && !canInts)) {
			return NextResponse.json({ error: "Non autorisé." }, { status: 403 });
		}
		if (!wantsAnalytics && !wantsVerification) {
			return NextResponse.json(
				{ error: "Rien à mettre à jour." },
				{ status: 400 },
			);
		}
		const supabase = await createSupabaseServerClient();
		await setIntegrations(supabase, {
			analytics: wantsAnalytics ? sanitizeAnalytics(body.analytics) : undefined,
			verification: wantsVerification
				? sanitizeVerification(body.verification)
				: undefined,
		});
		const effective = await getIntegrations();
		return NextResponse.json({
			analytics: wantsAnalytics ? sanitizeAnalytics(body.analytics) : null,
			verification: wantsVerification
				? sanitizeVerification(body.verification)
				: null,
			effective,
		});
	} catch (e) {
		console.error("PATCH /api/settings/integrations failed", e);
		return NextResponse.json(
			{ error: "Mise à jour impossible." },
			{ status: 500 },
		);
	}
}
