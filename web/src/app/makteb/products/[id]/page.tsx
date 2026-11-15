import { notFound } from "next/navigation";
import { ProductForm, type ProductFormValues } from "@/components/admin/product-form";
import { requirePagePermission } from "@/lib/session";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

export default async function EditProductPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  await requirePagePermission("products:read");
  const { id } = await params;
  const supabase = await createSupabaseServerClient();
  const [{ data: product }, { data: categories }] = await Promise.all([
    supabase.from("Product").select("*").eq("id", id).maybeSingle().throwOnError(),
    supabase.from("Category").select("*").order("position", { ascending: true }).throwOnError(),
  ]);
  if (!product) notFound();
  const { data: images } = await supabase
    .from("Image")
    .select("*")
    .eq("productId", id)
    .order("position", { ascending: true })
    .throwOnError();

  const initial: ProductFormValues = {
    ref: product.ref,
    name: product.name,
    nameAmazigh: product.nameAmazigh ?? "",
    description: product.description,
    shortStory: product.shortStory,
    materials: product.materials,
    colors: product.colors,
    sizes: product.sizes,
    price: product.price,
    salePrice: product.salePrice,
    currency: product.currency,
    inStock: product.inStock,
    featured: product.featured,
    categoryId: product.categoryId,
    images: images.map((i) => ({ url: i.url, alt: i.alt ?? "" })),
  };

  return (
    <ProductForm
      mode="edit"
      initial={initial}
      categories={categories.map((c) => ({ id: c.id, name: c.name }))}
      productId={product.id}
    />
  );
}
