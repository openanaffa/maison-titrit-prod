import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { requirePermission } from "@/lib/session";
import { slugify } from "@/lib/slug";

export const dynamic = "force-dynamic";

export async function GET() {
  const { user, allowed } = await requirePermission("products:read");
  if (!user || !allowed) return NextResponse.json({ error: "Non autorisé." }, { status: 403 });
  const categories = await db.category.findMany({ orderBy: { position: "asc" } });
  return NextResponse.json({ categories });
}

export async function POST(req: Request) {
  const { user, allowed } = await requirePermission("categories:write");
  if (!user || !allowed) return NextResponse.json({ error: "Non autorisé." }, { status: 403 });
  try {
    const body = await req.json();
    const name = String(body.name ?? "").trim();
    if (!name) return NextResponse.json({ error: "Nom requis." }, { status: 400 });
    const slug = body.slug?.trim() ? slugify(body.slug) : slugify(name);
    const max = await db.category.aggregate({ _max: { position: true } });
    const category = await db.category.create({
      data: { name, slug, position: (max._max.position ?? 0) + 1 },
    });
    return NextResponse.json({ category });
  } catch (e) {
    console.error("POST /api/admin/categories failed", e);
    return NextResponse.json({ error: "Création impossible." }, { status: 500 });
  }
}
