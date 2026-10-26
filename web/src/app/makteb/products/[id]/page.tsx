import { notFound } from "next/navigation";
import { db } from "@/lib/db";
import { ProductForm, type ProductFormValues } from "@/components/admin/product-form";

export const dynamic = "force-dynamic";

export default async function EditProductPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const [product, categories] = await Promise.all([
    db.product.findUnique({
      where: { id },
      include: { images: { orderBy: { position: "asc" } } },
    }),
    db.category.findMany({ orderBy: { position: "asc" } }),
  ]);
  if (!product) notFound();

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
    images: product.images.map((i) => ({ url: i.url, alt: i.alt ?? "" })),
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
