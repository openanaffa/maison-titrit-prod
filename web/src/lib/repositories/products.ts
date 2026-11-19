import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/lib/supabase/database.types";
import type { ProductFormValues } from "@/lib/types";

type ProductRow = Database["public"]["Tables"]["Product"]["Row"];
type ProductInsert = Database["public"]["Tables"]["Product"]["Insert"];
type ProductUpdate = Database["public"]["Tables"]["Product"]["Update"];
type CategoryRow = Database["public"]["Tables"]["Category"]["Row"];
type CategoryInsert = Database["public"]["Tables"]["Category"]["Insert"];
type CategoryUpdate = Database["public"]["Tables"]["Category"]["Update"];
type ImageRow = Database["public"]["Tables"]["Image"]["Row"];
type ImageInsert = Database["public"]["Tables"]["Image"]["Insert"];

type ProductWithRelations = ProductRow & {
	Image: ImageRow[];
	Category: CategoryRow | null;
};

/**
 * Product repository — port for catalogue data access.
 *
 * All functions receive an open Supabase server client and perform a single
 * data-access concern. Route handlers and server components call these instead
 * of writing inline Supabase queries. Prisma lives at the edge (checkout API
 * uses `db` directly); this repository is the Supabase side of that edge.
 *
 * Exported as named async functions (not a single object) so they can be
 * imported by route handlers without tripping Next.js server-actions
 * validation on non-function exports.
 */

/** List every product with its images and category. */
export async function listProducts(
	supabase: SupabaseClient<Database>,
): Promise<ProductWithRelations[]> {
	const { data: products, error } = await supabase
		.from("Product")
		.select("*")
		.order("createdAt", { ascending: false })
		.throwOnError();
	if (error) throw error;
	const productRows = (products ?? []) as ProductRow[];

	if (!productRows.length) return [];

	const productIds = productRows.map((p) => p.id);
	const { data: images, error: imagesError } = await supabase
		.from("Image")
		.select("*")
		.in("productId", productIds)
		.order("position")
		.throwOnError();
	if (imagesError) throw imagesError;

	const imagesByProduct = new Map<string, ImageRow[]>();
	for (const image of images ?? []) {
		const rows = imagesByProduct.get(image.productId) ?? [];
		rows.push(image as ImageRow);
		imagesByProduct.set(image.productId, rows);
	}

	const categoryIds = productRows
		.filter((p) => p.categoryId)
		.map((p) => p.categoryId as string);
	const uniqueCategoryIds = [...new Set(categoryIds)];
	const categoriesById = new Map<string, CategoryRow>();
	if (categoryIds.length) {
		const { data: categories } = await supabase
			.from("Category")
			.select("*")
			.in("id", categoryIds)
			.throwOnError();
		for (const cat of categories ?? []) {
			categoriesById.set(cat.id, cat);
		}
	}

	return productRows.map((p) => ({
		...p,
		Image: imagesByProduct.get(p.id) ?? [],
		Category: p.categoryId ? (categoriesById.get(p.categoryId) ?? null) : null,
	})) as ProductWithRelations[];
}

/** Get a single product by id with its images and category. */
export async function getProduct(
	supabase: SupabaseClient<Database>,
	id: string,
) {
	const { data: product, error } = await supabase
		.from("Product")
		.select("*")
		.eq("id", id)
		.maybeSingle()
		.throwOnError();
	if (!product) return null;

	const { data: images } = await supabase
		.from("Image")
		.select("*")
		.eq("productId", id)
		.order("position")
		.throwOnError();

	let category: CategoryRow | null = null;
	if (product.categoryId) {
		const { data: cat } = await supabase
			.from("Category")
			.select("*")
			.eq("id", product.categoryId)
			.maybeSingle()
			.throwOnError();
		category = cat ?? null;
	}

	return {
		...product,
		Image: (images ?? []) as ImageRow[],
		Category: category,
	} as ProductWithRelations;
}

/** Create a product. */
export async function createProduct(
	supabase: SupabaseClient<Database>,
	input: ProductInsert,
) {
	const { data, error } = await supabase
		.from("Product")
		.insert(input)
		.select("*")
		.single()
		.throwOnError();
	return data as ProductRow;
}

/** Update a product by id. */
export async function updateProduct(
	supabase: SupabaseClient<Database>,
	id: string,
	input: ProductUpdate,
) {
	const { data, error } = await supabase
		.from("Product")
		.update({ ...input, updatedAt: new Date().toISOString() })
		.eq("id", id)
		.select("*")
		.single()
		.throwOnError();
	return data as ProductRow;
}

/** Delete a product by id. */
export async function deleteProduct(
	supabase: SupabaseClient<Database>,
	id: string,
) {
	const { error } = await supabase.from("Product").delete().eq("id", id);
	if (error) throw error;
}

/** Delete all images for a product. */
export async function deleteImagesForProduct(
	supabase: SupabaseClient<Database>,
	productId: string,
) {
	const { error } = await supabase
		.from("Image")
		.delete()
		.eq("productId", productId);
	if (error) throw error;
}

/** Replace all images for a product (delete existing, then insert). */
export async function setImages(
	supabase: SupabaseClient<Database>,
	productId: string,
	images: { url: string; alt: string }[],
) {
	await deleteImagesForProduct(supabase, productId);
	await insertImages(supabase, productId, images);
}

/** List categories ordered by position. */
export async function listCategories(
	supabase: SupabaseClient<Database>,
): Promise<CategoryRow[]> {
	const { data, error } = await supabase
		.from("Category")
		.select("*")
		.order("position", { ascending: true })
		.throwOnError();
	return (data ?? []) as CategoryRow[];
}

/** Create a category. */
export async function createCategory(
	supabase: SupabaseClient<Database>,
	input: CategoryInsert,
) {
	const { data, error } = await supabase
		.from("Category")
		.insert(input)
		.select("*")
		.single()
		.throwOnError();
	return data as CategoryRow;
}

/** Update a category by id. */
export async function updateCategory(
	supabase: SupabaseClient<Database>,
	id: string,
	input: CategoryUpdate,
) {
	const { data, error } = await supabase
		.from("Category")
		.update({ ...input, updatedAt: new Date().toISOString() })
		.eq("id", id)
		.select("*")
		.single()
		.throwOnError();
	return data as CategoryRow;
}

/** Delete a category by id, unlinking its products first. */
export async function deleteCategory(
	supabase: SupabaseClient<Database>,
	id: string,
) {
	const { error: unlinkError } = await supabase
		.from("Product")
		.update({ categoryId: null, updatedAt: new Date().toISOString() })
		.eq("categoryId", id);
	if (unlinkError) throw unlinkError;
	const { error } = await supabase.from("Category").delete().eq("id", id);
	if (error) throw error;
}

/** List images for a product, ordered by position. */
export async function listImages(
	supabase: SupabaseClient<Database>,
	productId: string,
): Promise<ImageRow[]> {
	const { data, error } = await supabase
		.from("Image")
		.select("*")
		.eq("productId", productId)
		.order("position", { ascending: true })
		.throwOnError();
	return (data ?? []) as ImageRow[];
}

/** Insert image rows for a product. */
export async function insertImages(
	supabase: SupabaseClient<Database>,
	productId: string,
	images: { url: string; alt: string }[],
) {
	const rows: ImageInsert[] = images
		.filter((img) => img.url?.trim())
		.map((img, index) => ({
			productId,
			url: img.url.trim(),
			alt: img.alt ?? "",
			position: index,
			createdAt: new Date().toISOString(),
			updatedAt: new Date().toISOString(),
		}));
	if (rows.length) {
		const { error } = await supabase.from("Image").insert(rows);
		if (error) throw error;
	}
}

/**
 * Build the `ProductFormValues` initial state from a fetched product row.
 * Kept here (next to the data shape) so form mapping lives in one place.
 */
export function toProductFormValues(
	product: ProductWithRelations,
	categories: { id: string; name: string }[],
): ProductFormValues {
	return {
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
		images: product.Image.map((img) => ({ url: img.url, alt: img.alt ?? "" })),
	};
}
