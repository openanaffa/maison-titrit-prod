import { ProductForm } from "@/components/admin/product-form";
import { listCategories } from "@/lib/repositories/products";
import { requirePagePermission } from "@/lib/session";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import type { ProductFormValues } from "@/lib/types";

export const dynamic = "force-dynamic";

export default async function NewProductPage() {
	await requirePagePermission("products:read");
	const supabase = await createSupabaseServerClient();
	const categories = await listCategories(supabase);
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
