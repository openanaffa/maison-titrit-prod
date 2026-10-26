import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getCurrentUser } from "@/lib/session";

export const dynamic = "force-dynamic";

/** Update the authenticated user's profile (name + phone). */
export async function PATCH(req: Request) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Non authentifié." }, { status: 401 });
  try {
    const body = await req.json();
    const name = String(body.name ?? "").trim() || null;
    const phone = String(body.phone ?? "").trim() || null;
    const updated = await db.user.update({
      where: { id: user.id },
      data: { name, phone },
      select: { id: true, name: true, phone: true },
    });
    return NextResponse.json({ user: updated });
  } catch (e) {
    console.error("PATCH /api/compte/profile failed", e);
    return NextResponse.json({ error: "Mise à jour impossible." }, { status: 500 });
  }
}
