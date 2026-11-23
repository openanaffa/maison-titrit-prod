import { NextResponse } from "next/server";
import { deleteArticle, updateArticle } from "@/lib/repositories/articles";
import { requirePermission } from "@/lib/session";
import type { Tables } from "@/lib/supabase/database.types";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

export async function PATCH(
	req: Request,
	{ params }: { params: Promise<{ id: string }> },
) {
	const { user, allowed } = await requirePermission("content:write");
	if (!user || !allowed)
		return NextResponse.json({ error: "Non autorisé." }, { status: 403 });
	const { id } = await params;
	try {
		const body = await req.json();
		const data: Partial<Tables<"Article">> = {};
		for (const k of [
			"title",
			"excerpt",
			"body",
			"coverImage",
			"authorName",
			"tags",
			"published",
		]) {
			if (k in body) data[k as keyof Tables<"Article">] = body[k];
		}
		// If publishing for the first time, set publishedAt
		if (body.published === true) {
			data.publishedAt = new Date().toISOString();
		} else if (body.published === false) {
			data.publishedAt = null;
		}
		const supabase = await createSupabaseServerClient();
		const article = await updateArticle(supabase, id, data);
		if (!article)
			return NextResponse.json({ error: "Introuvable." }, { status: 404 });
		return NextResponse.json({ article });
	} catch (e) {
		console.error("PATCH /api/admin/articles/[id] failed", e);
		return NextResponse.json(
			{ error: "Mise à jour impossible." },
			{ status: 500 },
		);
	}
}

export async function DELETE(
	_req: Request,
	{ params }: { params: Promise<{ id: string }> },
) {
	const { user, allowed } = await requirePermission("content:write");
	if (!user || !allowed)
		return NextResponse.json({ error: "Non autorisé." }, { status: 403 });
	const { id } = await params;
	try {
		const supabase = await createSupabaseServerClient();
		await deleteArticle(supabase, id);
		return NextResponse.json({ ok: true });
	} catch (e) {
		console.error("DELETE /api/admin/articles/[id] failed", e);
		return NextResponse.json(
			{ error: "Suppression impossible." },
			{ status: 500 },
		);
	}
}
