import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { requirePermission } from "@/lib/session";

export const dynamic = "force-dynamic";

const DEFAULT = { active: false, message: "", link: "" };

/** Public: get the current announcement bar (no auth). */
export async function GET() {
  const row = await db.setting.findUnique({ where: { key: "announcement" } });
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
    await db.setting.upsert({
      where: { key: "announcement" },
      update: { value: JSON.stringify(bar) },
      create: { key: "announcement", value: JSON.stringify(bar) },
    });
    return NextResponse.json({ bar });
  } catch (e) {
    console.error("PATCH /api/settings/announcement failed", e);
    return NextResponse.json({ error: "Mise à jour impossible." }, { status: 500 });
  }
}

