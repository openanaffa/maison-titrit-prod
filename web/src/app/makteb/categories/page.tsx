import { CategoriesClient } from "@/components/admin/categories-client";
import { requirePagePermission } from "@/lib/session";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

export default async function MaktebCategoriesPage() {
	await requirePagePermission("categories:read");
	const supabase = await createSupabaseServerClient();
	const [{ data: cats }, { data: products }] = await Promise.all([
		supabase
			.from("Category")
			.select("*")
			.order("position", { ascending: true })
			.throwOnError(),
		supabase.from("Product").select("categoryId").throwOnError(),
	]);
	const countMap = new Map<string, number>();
	for (const product of products) {
		if (product.categoryId) {
			countMap.set(
				product.categoryId,
				(countMap.get(product.categoryId) ?? 0) + 1,
			);
		}
	}
	const initial = cats.map((c) => ({
		id: c.id,
		name: c.name,
		slug: c.slug,
		position: c.position,
		count: countMap.get(c.id) ?? 0,
	}));
	return <CategoriesClient initial={initial} />;
}
