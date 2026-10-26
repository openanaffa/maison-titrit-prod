import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { requirePermission } from "@/lib/session";
import { slugify } from "@/lib/slug";

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
    if (body.categoryId) {
      categoryId = body.categoryId;
    } else if (body.categoryName) {
      const cat = await db.category.upsert({
        where: { slug: slugify(body.categoryName) },
        update: { name: body.categoryName },
        create: { name: body.categoryName, slug: slugify(body.categoryName) },
      });
      categoryId = cat.id;
    }

    const product = await db.product.create({
      data: {
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
      },
    });

    // images
    const images = Array.isArray(body.images) ? body.images : [];
    for (let i = 0; i < images.length; i++) {
      const img = images[i];
      if (!img.url?.trim()) continue;
      await db.image.create({
        data: { productId: product.id, url: img.url.trim(), alt: img.alt ?? product.name, position: i },
      });
    }

    return NextResponse.json({ product });
  } catch (e) {
    console.error("POST /api/admin/products failed", e);
    return NextResponse.json({ error: "Création impossible." }, { status: 500 });
  }
}
