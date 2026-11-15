import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/session";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

/** Update the authenticated user's profile (name + phone). */
export async function PATCH(req: Request) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Non authentifié." }, { status: 401 });
  try {
    const body = await req.json();
    const name = String(body.name ?? "").trim() || null;
    const phone = String(body.phone ?? "").trim() || null;
    const supabase = await createSupabaseServerClient();
    const { data: updated } = await supabase
      .from("User")
      .update({ name, phone, updatedAt: new Date().toISOString() })
      .eq("id", user.id)
      .select("id,name,phone")
      .maybeSingle()
      .throwOnError();
    if (!updated) return NextResponse.json({ error: "Profil introuvable." }, { status: 404 });
    return NextResponse.json({ user: updated });
  } catch (e) {
    console.error("PATCH /api/compte/profile failed", e);
    return NextResponse.json({ error: "Mise à jour impossible." }, { status: 500 });
  }
}
