import { NextResponse } from "next/server";
import { requirePermission } from "@/lib/session";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import {
  getIntegrations,
  sanitizeAnalytics,
  sanitizeVerification,
} from "@/lib/integrations";

export const dynamic = "force-dynamic";

/** Owner or marketer (tags): view integrations. Marketers see trackers only. */
export async function GET() {
  const { user, allowed: canSettings } = await requirePermission("settings:write");
  if (!user || !canSettings) {
    // Marketers manage tags — trackers only, no domain verifications.
    const { user: mUser, allowed: canInts } = await requirePermission("integrations:write");
    if (!mUser || !canInts) {
      return NextResponse.json({ error: "Non autorisé." }, { status: 403 });
    }
    try {
      const supabase = await createSupabaseServerClient();
      const { data: settings } = await supabase
        .from("Setting")
        .select("key,value")
        .eq("key", "integration.analytics")
        .throwOnError();
      const analytics = settings?.find((setting) => setting.key === "integration.analytics");
      const analyticsValue = analytics ? sanitizeAnalytics(JSON.parse(analytics.value)) : {};
      const effective = await getIntegrations();
      return NextResponse.json({ analyticsValue, effective: { analytics: effective.analytics } });
    } catch (e) {
      console.error("GET /api/settings/integrations failed", e);
      return NextResponse.json({ error: "Lecture impossible." }, { status: 500 });
    }
  }
  try {
    const supabase = await createSupabaseServerClient();
    const { data: settings } = await supabase
      .from("Setting")
      .select("key,value")
      .in("key", ["integration.analytics", "integration.verification"])
      .throwOnError();
    const analytics = settings.find((setting) => setting.key === "integration.analytics");
    const verification = settings.find((setting) => setting.key === "integration.verification");
    const analyticsValue = analytics ? sanitizeAnalytics(JSON.parse(analytics.value)) : {};
    const verificationValue = verification
      ? sanitizeVerification(JSON.parse(verification.value))
      : {};
    const effective = await getIntegrations();
    return NextResponse.json({ analyticsValue, verificationValue, effective });
  } catch (e) {
    console.error("GET /api/settings/integrations failed", e);
    return NextResponse.json({ error: "Lecture impossible." }, { status: 500 });
  }
}

/** Update integrations: trackers need integrations:write, domain
 *  verifications need settings:write — a marketer may PATCH analytics only. */
export async function PATCH(req: Request) {
  const { user, allowed: canSettings } = await requirePermission("settings:write");
  const { user: mUser, allowed: canInts } = await requirePermission("integrations:write");
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
      return NextResponse.json({ error: "Rien à mettre à jour." }, { status: 400 });
    }
    const verification = wantsVerification ? sanitizeVerification(body.verification) : null;
    const analytics = wantsAnalytics ? sanitizeAnalytics(body.analytics) : null;
    const supabase = await createSupabaseServerClient();

    if (analytics && Object.keys(analytics).length) {
      await supabase.from("Setting").upsert(
        {
          key: "integration.analytics",
          value: JSON.stringify(analytics),
          updatedAt: new Date().toISOString(),
        },
        { onConflict: "key" },
      ).throwOnError();
    } else if (analytics) {
      await supabase.from("Setting").delete().eq("key", "integration.analytics").throwOnError();
    }

    if (verification) {
      if (
        Object.keys(verification).some((k) => k !== "custom") ||
        verification.custom.length
      ) {
        await supabase.from("Setting").upsert(
          {
            key: "integration.verification",
            value: JSON.stringify(verification),
            updatedAt: new Date().toISOString(),
          },
          { onConflict: "key" },
        ).throwOnError();
      } else {
        await supabase.from("Setting").delete().eq("key", "integration.verification").throwOnError();
      }
    }

    return NextResponse.json({ analytics, verification });
  } catch (e) {
    console.error("PATCH /api/settings/integrations failed", e);
    return NextResponse.json({ error: "Mise à jour impossible." }, { status: 500 });
  }
}
