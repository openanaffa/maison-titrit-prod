import { NextResponse } from "next/server";
import { randomUUID } from "node:crypto";
import { requirePermission } from "@/lib/session";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import type { ImageRow, ProductRow } from "@/lib/supabase/database.types";

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
  const supabase = await createSupabaseServerClient();
  const { data: product } = await supabase
    .from("Product")
    .select("*")
    .eq("id", id)
    .maybeSingle()
    .throwOnError();
  if (!product) return NextResponse.json({ error: "Introuvable." }, { status: 404 });
  const [{ data: images }, categoryResult] = await Promise.all([
    supabase.from("Image").select("*").eq("productId", id).order("position").throwOnError(),
    product.categoryId
      ? supabase.from("Category").select("*").eq("id", product.categoryId).maybeSingle().throwOnError()
      : Promise.resolve({ data: null }),
  ]);
  return NextResponse.json({ product: { ...product, images, category: categoryResult.data } });
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
    const data: Partial<ProductRow> = {};
    for (const k of [
      "name", "nameAmazigh", "description", "shortStory", "materials", "colors",
      "sizes", "price", "salePrice", "currency", "inStock", "featured",
    ]) {
      if (k in body) data[k as keyof ProductRow] = body[k];
    }
    if (body.categoryId !== undefined) data.categoryId = body.categoryId ?? null;

    if (Array.isArray(body.images)) {
      // replace images
      const supabase = await createSupabaseServerClient();
      await supabase.from("Image").delete().eq("productId", id).throwOnError();
      const imageRows: ImageRow[] = body.images.flatMap(
        (img: { url?: string; alt?: string | null }, index: number) => {
          if (!img.url?.trim()) return [];
          return [{
            id: randomUUID(),
            productId: id,
            url: img.url.trim(),
            alt: img.alt ?? "",
            position: index,
            createdAt: new Date().toISOString(),
          }];
        },
      );
      if (imageRows.length) {
        await supabase.from("Image").insert(imageRows).throwOnError();
      }
    }

    const supabase = await createSupabaseServerClient();
    const { data: product } = await supabase
      .from("Product")
      .update({ ...data, updatedAt: new Date().toISOString() })
      .eq("id", id)
      .select("*")
      .maybeSingle()
      .throwOnError();
    if (!product) return NextResponse.json({ error: "Introuvable." }, { status: 404 });
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
  const supabase = await createSupabaseServerClient();
  const { count: orderedCount } = await supabase
    .from("OrderItem")
    .select("id", { count: "exact", head: true })
    .eq("productId", id)
    .throwOnError();
  if ((orderedCount ?? 0) > 0) {
    return NextResponse.json(
      {
        error:
          "Ce produit figure dans des commandes passées : il ne peut pas être supprimé. Désactivez-le ou modifiez-le à la place.",
      },
      { status: 409 },
    );
  }
  try {
    await supabase.from("Image").delete().eq("productId", id).throwOnError();
    await supabase.from("Product").delete().eq("id", id).throwOnError();
    return NextResponse.json({ ok: true });
  } catch (e) {
    console.error("DELETE /api/admin/products/[id] failed", e);
    return NextResponse.json({ error: "Suppression impossible." }, { status: 500 });
  }
}
