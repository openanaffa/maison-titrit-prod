import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { requirePermission } from "@/lib/session";
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
    const [analytics, verification] = await Promise.all([
      db.setting.findUnique({ where: { key: "integration.analytics" } }),
      db.setting.findUnique({ where: { key: "integration.verification" } }),
    ]);
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

    if (Object.keys(analytics).length) {
      await db.setting.upsert({
        where: { key: "integration.analytics" },
        update: { value: JSON.stringify(analytics) },
        create: { key: "integration.analytics", value: JSON.stringify(analytics) },
      });
    } else {
      await db.setting.deleteMany({ where: { key: "integration.analytics" } });
    }

    if (
      Object.keys(verification).some((k) => k !== "custom") ||
      verification.custom.length
    ) {
      await db.setting.upsert({
        where: { key: "integration.verification" },
        update: { value: JSON.stringify(verification) },
        create: { key: "integration.verification", value: JSON.stringify(verification) },
      });
    } else {
      await db.setting.deleteMany({ where: { key: "integration.verification" } });
    }

    return NextResponse.json({ analytics, verification });
  } catch (e) {
    console.error("PATCH /api/settings/integrations failed", e);
    return NextResponse.json({ error: "Mise à jour impossible." }, { status: 500 });
  }
}
