import { notFound } from "next/navigation";
import { ProductForm } from "@/components/admin/product-form";
import {
	getProduct,
	listCategories,
	toProductFormValues,
} from "@/lib/repositories/products";
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
	const [product, categories] = await Promise.all([
		getProduct(supabase, id),
		listCategories(supabase),
	]);
	if (!product) notFound();
	const initial = toProductFormValues(
		product,
		categories.map((c) => ({ id: c.id, name: c.name })),
	);

	return (
		<ProductForm
			mode="edit"
			initial={initial}
			categories={categories.map((c) => ({ id: c.id, name: c.name }))}
			productId={product.id}
		/>
	);
}
