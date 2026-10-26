import { db } from "@/lib/db";
import { ProductForm, type ProductFormValues } from "@/components/admin/product-form";

export const dynamic = "force-dynamic";

export default async function NewProductPage() {
  const categories = await db.category.findMany({ orderBy: { position: "asc" } });
  const initial: ProductFormValues = {
    ref: `MT-${Math.floor(Math.random() * 9000 + 1000)}`,
    name: "",
    nameAmazigh: "",
    description: "",
    shortStory: "",
    materials: "",
    colors: "",
    sizes: "",
    price: 0,
    salePrice: null,
    currency: "MAD",
    inStock: true,
    featured: false,
    categoryId: null,
    images: [],
  };
  return (
    <ProductForm
      mode="create"
      initial={initial}
      categories={categories.map((c) => ({ id: c.id, name: c.name }))}
    />
  );
}
