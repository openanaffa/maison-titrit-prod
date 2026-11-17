import { randomUUID } from "node:crypto";
import { NextResponse } from "next/server";
import { requirePermission } from "@/lib/session";
import { slugify } from "@/lib/slug";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

export async function GET() {
	const { user, allowed } = await requirePermission("products:read");
	if (!user || !allowed)
		return NextResponse.json({ error: "Non autorisé." }, { status: 403 });
	const supabase = await createSupabaseServerClient();
	const { data: categories } = await supabase
		.from("Category")
		.select("*")
		.order("position", { ascending: true })
		.throwOnError();
	return NextResponse.json({ categories });
}

export async function POST(req: Request) {
	const { user, allowed } = await requirePermission("categories:write");
	if (!user || !allowed)
		return NextResponse.json({ error: "Non autorisé." }, { status: 403 });
	try {
		const body = await req.json();
		const name = String(body.name ?? "").trim();
		if (!name)
			return NextResponse.json({ error: "Nom requis." }, { status: 400 });
		const slug = body.slug?.trim() ? slugify(body.slug) : slugify(name);
		const supabase = await createSupabaseServerClient();
		const { data: lastCategory } = await supabase
			.from("Category")
			.select("position")
			.order("position", { ascending: false })
			.limit(1)
			.maybeSingle()
			.throwOnError();
		const { data: category } = await supabase
			.from("Category")
			.insert({
				id: randomUUID(),
				name,
				slug,
				position: (lastCategory?.position ?? 0) + 1,
				createdAt: new Date().toISOString(),
				updatedAt: new Date().toISOString(),
			})
			.select("*")
			.single()
			.throwOnError();
		return NextResponse.json({ category });
	} catch (e) {
		console.error("POST /api/admin/categories failed", e);
		return NextResponse.json(
			{ error: "Création impossible." },
			{ status: 500 },
		);
	}
}
