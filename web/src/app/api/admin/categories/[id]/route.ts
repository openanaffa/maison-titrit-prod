import { NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import type { Tables } from "@/lib/supabase/database.types";
import { requirePermission } from "@/lib/session";
import { slugify } from "@/lib/slug";

export const dynamic = "force-dynamic";

/** Update a category (name / slug / position). */
export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { user, allowed } = await requirePermission("categories:write");
  if (!user || !allowed) return NextResponse.json({ error: "Non autorisé." }, { status: 403 });
  const { id } = await params;
  try {
    const body = await req.json();
    const data: Partial<Tables<"Category">> = {};
    if (typeof body.name === "string") {
      const name = body.name.trim();
      if (!name) return NextResponse.json({ error: "Nom requis." }, { status: 400 });
      data.name = name;
    }
    if (typeof body.slug === "string") {
      const slug = body.slug.trim();
      if (!slug) return NextResponse.json({ error: "Slug requis." }, { status: 400 });
      data.slug = slugify(slug);
    }
    if (typeof body.position === "number") data.position = body.position;
    if (Object.keys(data).length === 0) {
      return NextResponse.json({ error: "Aucun champ à mettre à jour." }, { status: 400 });
    }
    const supabase = await createSupabaseServerClient();
    const { data: category } = await supabase
      .from("Category")
      .update({ ...data, updatedAt: new Date().toISOString() })
      .eq("id", id)
      .select("*")
      .maybeSingle()
      .throwOnError();
    if (!category) return NextResponse.json({ error: "Introuvable." }, { status: 404 });
    return NextResponse.json({ category });
  } catch (e) {
    console.error("PATCH /api/admin/categories/[id] failed", e);
    return NextResponse.json({ error: "Mise à jour impossible." }, { status: 500 });
  }
}

export async function DELETE(
  _req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { user, allowed } = await requirePermission("categories:write");
  if (!user || !allowed) return NextResponse.json({ error: "Non autorisé." }, { status: 403 });
  const { id } = await params;
  try {
    const supabase = await createSupabaseServerClient();
    const { error: unlinkError } = await supabase
      .from("Product")
      .update({ categoryId: null, updatedAt: new Date().toISOString() })
      .eq("categoryId", id);
    if (unlinkError) throw unlinkError;
    await supabase.from("Category").delete().eq("id", id).throwOnError();
    return NextResponse.json({ ok: true });
  } catch (e) {
    console.error("DELETE /api/admin/categories/[id] failed", e);
    return NextResponse.json({ error: "Suppression impossible." }, { status: 500 });
  }
}
