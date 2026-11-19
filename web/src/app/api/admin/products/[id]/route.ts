import { NextResponse } from "next/server";
import {
	deleteImagesForProduct,
	deleteProduct,
	getProduct,
	setImages,
	updateProduct,
} from "@/lib/repositories/products";
import { requirePermission } from "@/lib/session";
import type { Tables } from "@/lib/supabase/database.types";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

/** Get one product (with images + category). */
export async function GET(
	_req: Request,
	{ params }: { params: Promise<{ id: string }> },
) {
	const { user, allowed } = await requirePermission("products:read");
	if (!user || !allowed) {
		return NextResponse.json({ error: "Non autorisé." }, { status: 403 });
	}
	const { id } = await params;
	const supabase = await createSupabaseServerClient();
	const product = await getProduct(supabase, id);
	if (!product)
		return NextResponse.json({ error: "Introuvable." }, { status: 404 });
	return NextResponse.json({
		product: { ...product, images: product.Image, category: product.Category },
	});
}

/** Update a product. */
export async function PATCH(
	req: Request,
	{ params }: { params: Promise<{ id: string }> },
) {
	const { user, allowed } = await requirePermission("products:write");
	if (!user || !allowed) {
		return NextResponse.json({ error: "Non autorisé." }, { status: 403 });
	}
	const { id } = await params;
	try {
		const body = await req.json();
		const data: Partial<Tables<"Product">> = {};
		for (const k of [
			"name",
			"nameAmazigh",
			"description",
			"shortStory",
			"materials",
			"colors",
			"sizes",
			"price",
			"salePrice",
			"currency",
			"inStock",
			"featured",
		]) {
			if (k in body) data[k as keyof Tables<"Product">] = body[k];
		}
		if (body.categoryId !== undefined)
			data.categoryId = body.categoryId ?? null;

		const supabase = await createSupabaseServerClient();
		if (Array.isArray(body.images)) {
			// replace images
			const imagesWithAlt = body.images.map((img) => ({
				url: img.url,
				alt: img.alt ?? "",
			}));
			await setImages(supabase, id, imagesWithAlt);
		}

		const product = await updateProduct(supabase, id, data);
		if (!product)
			return NextResponse.json({ error: "Introuvable." }, { status: 404 });
		return NextResponse.json({ product });
	} catch (e) {
		console.error("PATCH /api/admin/products/[id] failed", e);
		return NextResponse.json(
			{ error: "Mise à jour impossible." },
			{ status: 500 },
		);
	}
}

/** Delete a product (cascade images). */
export async function DELETE(
	_req: Request,
	{ params }: { params: Promise<{ id: string }> },
) {
	const { user, allowed } = await requirePermission("products:write");
	if (!user || !allowed) {
		return NextResponse.json({ error: "Non autorisé." }, { status: 403 });
	}
	const { id } = await params;
	const supabase = await createSupabaseServerClient();
	const { count: orderedCount } = await supabase
		.from("OrderItem")
		.select("id", { count: "exact", head: true })
		.eq("productId", id)
		.throwOnError();
	if ((orderedCount ?? 0) > 0) {
		return NextResponse.json(
			{
				error:
					"Ce produit figure dans des commandes passées : il ne peut pas être supprimé. Désactivez-le ou modifiez-le à la place.",
			},
			{ status: 409 },
		);
	}
	try {
		await deleteImagesForProduct(supabase, id);
		await deleteProduct(supabase, id);
		return NextResponse.json({ ok: true });
	} catch (e) {
		console.error("DELETE /api/admin/products/[id] failed", e);
		return NextResponse.json(
			{ error: "Suppression impossible." },
			{ status: 500 },
		);
	}
}
