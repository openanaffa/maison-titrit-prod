import { ProductsTableClient } from "@/components/admin/products-table-client";
import { requirePagePermission } from "@/lib/session";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

export default async function MaktebProductsPage() {
  await requirePagePermission("products:read");
  const supabase = await createSupabaseServerClient();
  const [{ data: products }, { data: categories }] = await Promise.all([
    supabase.from("Product").select("*").order("createdAt", { ascending: false }).throwOnError(),
    supabase.from("Category").select("*").order("position", { ascending: true }).throwOnError(),
  ]);
  const productIds = products.map((product) => product.id);
  const { data: images } = productIds.length
    ? await supabase
        .from("Image")
        .select("productId,url,position")
        .in("productId", productIds)
        .order("position", { ascending: true })
        .throwOnError()
    : { data: [] };
  const categoryById = new Map(categories.map((category) => [category.id, category]));
  const imageByProductId = new Map<string, string>();
  for (const image of images) {
    if (!imageByProductId.has(image.productId)) imageByProductId.set(image.productId, image.url);
  }

  const rows = products.map((p) => ({
    id: p.id,
    ref: p.ref,
    name: p.name,
    price: p.price,
    salePrice: p.salePrice,
    currency: p.currency,
    category: categoryById.get(p.categoryId ?? "")?.name ?? "—",
    categorySlug: categoryById.get(p.categoryId ?? "")?.slug,
    inStock: p.inStock,
    featured: p.featured,
    image: imageByProductId.get(p.id) ?? null,
  }));

  const cats = categories.map((c) => ({ id: c.id, name: c.name, slug: c.slug }));

  return <ProductsTableClient rows={rows} categories={cats} />;
}
