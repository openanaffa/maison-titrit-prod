import { NextResponse } from "next/server";
import { randomUUID } from "node:crypto";
import { requirePermission } from "@/lib/session";
import { slugify } from "@/lib/slug";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import type { Tables } from "@/lib/supabase/database.types";

export const dynamic = "force-dynamic";

/** Create a new product. */
export async function POST(req: Request) {
  const { user, allowed } = await requirePermission("products:write");
  if (!user || !allowed) {
    return NextResponse.json({ error: "Non autorisé." }, { status: 403 });
  }
  try {
    const body = await req.json();
    const ref = body.ref?.toString().trim();
    if (!ref) return NextResponse.json({ error: "Réf. requise." }, { status: 400 });
    if (!body.name?.trim()) return NextResponse.json({ error: "Nom requis." }, { status: 400 });
    if (body.price == null) return NextResponse.json({ error: "Prix requis." }, { status: 400 });

    // resolve category
    let categoryId: string | null = null;
    const supabase = await createSupabaseServerClient();
    if (body.categoryId) {
      categoryId = body.categoryId;
    } else if (body.categoryName) {
      const slug = slugify(body.categoryName);
      const { data: existingCategory } = await supabase
        .from("Category")
        .select("id")
        .eq("slug", slug)
        .maybeSingle()
        .throwOnError();
      const { data: cat } = existingCategory
        ? await supabase
            .from("Category")
            .update({ name: body.categoryName, updatedAt: new Date().toISOString() })
            .eq("id", existingCategory.id)
            .select("id")
            .single()
            .throwOnError()
        : await supabase
            .from("Category")
            .insert({
              id: randomUUID(),
              name: body.categoryName,
              slug,
              position: 0,
              createdAt: new Date().toISOString(),
              updatedAt: new Date().toISOString(),
            })
            .select("id")
            .single()
            .throwOnError();
      categoryId = cat.id;
    }

    const productInput: Tables<"Product"> = {
        id: randomUUID(),
        ref,
        name: body.name.trim(),
        nameAmazigh: body.nameAmazigh?.trim() || null,
        description: body.description ?? "",
        shortStory: body.shortStory ?? "",
        materials: body.materials ?? "",
        colors: body.colors ?? "",
        sizes: body.sizes ?? "",
        price: Number(body.price),
        salePrice: body.salePrice ? Number(body.salePrice) : null,
        currency: body.currency ?? "MAD",
        inStock: body.inStock ?? true,
        featured: body.featured ?? false,
        categoryId,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
    };
    const { data: product } = await supabase
      .from("Product")
      .insert(productInput)
      .select("*")
      .single()
      .throwOnError();

    const images = Array.isArray(body.images) ? body.images : [];
    const imageRows: Tables<"Image">[] = images.flatMap((img: { url?: string; alt?: string | null }, index: number) => {
      if (!img.url?.trim()) return [];
      return [{
        id: randomUUID(),
        productId: product.id,
        url: img.url.trim(),
        alt: img.alt ?? product.name,
        position: index,
        createdAt: new Date().toISOString(),
      }];
    });
    if (imageRows.length) {
      await supabase.from("Image").insert(imageRows).throwOnError();
    }

    return NextResponse.json({ product });
  } catch (e) {
    console.error("POST /api/admin/products failed", e);
    return NextResponse.json({ error: "Création impossible." }, { status: 500 });
  }
}
