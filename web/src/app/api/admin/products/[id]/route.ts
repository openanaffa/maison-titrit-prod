import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { requirePermission } from "@/lib/session";

export const dynamic = "force-dynamic";

/** Get one product (with images + category). */
export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { user, allowed } = await requirePermission("products:read");
  if (!user || !allowed) {
    return NextResponse.json({ error: "Non autorisé." }, { status: 403 });
  }
  const { id } = await params;
  const product = await db.product.findUnique({
    where: { id },
    include: { images: { orderBy: { position: "asc" } }, category: true },
  });
  if (!product) return NextResponse.json({ error: "Introuvable." }, { status: 404 });
  return NextResponse.json({ product });
}

/** Update a product. */
export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { user, allowed } = await requirePermission("products:write");
  if (!user || !allowed) {
    return NextResponse.json({ error: "Non autorisé." }, { status: 403 });
  }
  const { id } = await params;
  try {
    const body = await req.json();
    const data: Record<string, unknown> = {};
    for (const k of [
      "name", "nameAmazigh", "description", "shortStory", "materials", "colors",
      "sizes", "price", "salePrice", "currency", "inStock", "featured",
    ]) {
      if (k in body) data[k] = body[k];
    }
    if (body.categoryId !== undefined) data.categoryId = body.categoryId ?? null;

    if (Array.isArray(body.images)) {
      // replace images
      await db.image.deleteMany({ where: { productId: id } });
      for (let i = 0; i < body.images.length; i++) {
        const img = body.images[i];
        if (!img.url?.trim()) continue;
        await db.image.create({
          data: { productId: id, url: img.url.trim(), alt: img.alt ?? "", position: i },
        });
      }
    }

    const product = await db.product.update({ where: { id }, data });
    return NextResponse.json({ product });
  } catch (e) {
    console.error("PATCH /api/admin/products/[id] failed", e);
    return NextResponse.json({ error: "Mise à jour impossible." }, { status: 500 });
  }
}

/** Delete a product (cascade images). */
export async function DELETE(
  _req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { user, allowed } = await requirePermission("products:write");
  if (!user || !allowed) {
    return NextResponse.json({ error: "Non autorisé." }, { status: 403 });
  }
  const { id } = await params;
  try {
    await db.product.delete({ where: { id } });
    return NextResponse.json({ ok: true });
  } catch (e) {
    console.error("DELETE /api/admin/products/[id] failed", e);
    return NextResponse.json({ error: "Suppression impossible." }, { status: 500 });
  }
}
