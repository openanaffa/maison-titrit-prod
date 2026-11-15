import { ProductForm, type ProductFormValues } from "@/components/admin/product-form";
import { requirePagePermission } from "@/lib/session";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

export default async function NewProductPage() {
  await requirePagePermission("products:read");
  const supabase = await createSupabaseServerClient();
  const { data: categories } = await supabase
    .from("Category")
    .select("*")
    .order("position", { ascending: true })
    .throwOnError();
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
