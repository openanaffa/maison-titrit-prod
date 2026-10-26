import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { requirePermission } from "@/lib/session";
import { slugify } from "@/lib/slug";

export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  const { user, allowed } = await requirePermission("content:write");
  if (!user || !allowed) return NextResponse.json({ error: "Non autorisé." }, { status: 403 });
  try {
    const body = await req.json();
    const title = String(body.title ?? "").trim();
    if (!title) return NextResponse.json({ error: "Titre requis." }, { status: 400 });
    const slug = (body.slug?.trim() ? slugify(body.slug) : slugify(title)) || slugify(title);
    const published = !!body.published;
    const article = await db.article.create({
      data: {
        slug,
        title,
        excerpt: body.excerpt ?? "",
        body: body.body ?? "",
        coverImage: body.coverImage || null,
        authorName: body.authorName || "Maison Titrit",
        tags: body.tags ?? "",
        published,
        publishedAt: published ? new Date() : null,
      },
    });
    return NextResponse.json({ article });
  } catch (e) {
    console.error("POST /api/admin/articles failed", e);
    return NextResponse.json({ error: "Création impossible." }, { status: 500 });
  }
}
