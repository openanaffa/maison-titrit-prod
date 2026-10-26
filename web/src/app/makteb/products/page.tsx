import { db } from "@/lib/db";
import { ProductsTableClient } from "@/components/admin/products-table-client";

export const dynamic = "force-dynamic";

export default async function MaktebProductsPage() {
  const [products, categories] = await Promise.all([
    db.product.findMany({
      orderBy: { createdAt: "desc" },
      include: { category: true, images: { orderBy: { position: "asc" }, take: 1 } },
    }),
    db.category.findMany({ orderBy: { position: "asc" } }),
  ]);

  const rows = products.map((p) => ({
    id: p.id,
    ref: p.ref,
    name: p.name,
    price: p.price,
    salePrice: p.salePrice,
    currency: p.currency,
    category: p.category?.name ?? "—",
    categorySlug: p.category?.slug ?? undefined,
    inStock: p.inStock,
    featured: p.featured,
    image: p.images[0]?.url ?? null,
  }));

  const cats = categories.map((c) => ({ id: c.id, name: c.name, slug: c.slug }));

  return <ProductsTableClient rows={rows} categories={cats} />;
}
