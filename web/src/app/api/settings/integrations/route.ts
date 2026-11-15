import { NextResponse } from "next/server";
import { requirePermission } from "@/lib/session";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import {
  getIntegrations,
  sanitizeAnalytics,
  sanitizeVerification,
} from "@/lib/integrations";

export const dynamic = "force-dynamic";

/** Founder-only: view effective integrations (stored + fallbacks). */
export async function GET() {
  const { user, allowed } = await requirePermission("settings:write");
  if (!user || !allowed) {
    return NextResponse.json({ error: "Non autorisé." }, { status: 403 });
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

/** Founder-only: update integration settings (hot, ~60s cache TTL). */
export async function PATCH(req: Request) {
  const { user, allowed } = await requirePermission("settings:write");
  if (!user || !allowed) {
    return NextResponse.json({ error: "Non autorisé." }, { status: 403 });
  }
  try {
    const body = await req.json();
    const analytics = sanitizeAnalytics(body.analytics);
    const verification = sanitizeVerification(body.verification);
    const supabase = await createSupabaseServerClient();

    if (Object.keys(analytics).length) {
      await supabase.from("Setting").upsert(
        {
          key: "integration.analytics",
          value: JSON.stringify(analytics),
          updatedAt: new Date().toISOString(),
        },
        { onConflict: "key" },
      ).throwOnError();
    } else {
      await supabase.from("Setting").delete().eq("key", "integration.analytics").throwOnError();
    }

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

    return NextResponse.json({ analytics, verification });
  } catch (e) {
    console.error("PATCH /api/settings/integrations failed", e);
    return NextResponse.json({ error: "Mise à jour impossible." }, { status: 500 });
  }
}
