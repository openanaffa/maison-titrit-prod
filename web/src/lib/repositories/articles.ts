"use server";

import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/lib/supabase/database.types";

type ArticleRow = Database["public"]["Tables"]["Article"]["Row"];
type ArticleInsert = Database["public"]["Tables"]["Article"]["Insert"];
type ArticleUpdate = Database["public"]["Tables"]["Article"]["Update"];

/**
 * Article repository — port for blog/article data access.
 */

/** List articles, newest first. Optionally filter by published state. */
export async function listArticles(
	supabase: SupabaseClient<Database>,
	published?: boolean,
): Promise<ArticleRow[]> {
	let query = supabase
		.from("Article")
		.select("*")
		.order("createdAt", { ascending: false });
	if (published !== undefined) query = query.eq("published", published);
	const { data } = await query.throwOnError();
	return (data ?? []) as ArticleRow[];
}

/** Get a single article by id. */
export async function getArticle(
	supabase: SupabaseClient<Database>,
	id: string,
) {
	const { data } = await supabase
		.from("Article")
		.select("*")
		.eq("id", id)
		.maybeSingle()
		.throwOnError();
	return (data ?? null) as ArticleRow | null;
}

/** Get a single article by slug. */
export async function getArticleBySlug(
	supabase: SupabaseClient<Database>,
	slug: string,
) {
	const { data } = await supabase
		.from("Article")
		.select("*")
		.eq("slug", slug)
		.maybeSingle()
		.throwOnError();
	return (data ?? null) as ArticleRow | null;
}

/** Create an article. */
export async function createArticle(
	supabase: SupabaseClient<Database>,
	input: ArticleInsert,
) {
	const { data } = await supabase
		.from("Article")
		.insert(input)
		.select("*")
		.single()
		.throwOnError();
	return data as ArticleRow;
}

/** Update an article by id. */
export async function updateArticle(
	supabase: SupabaseClient<Database>,
	id: string,
	input: ArticleUpdate,
) {
	const { data } = await supabase
		.from("Article")
		.update({ ...input, updatedAt: new Date().toISOString() })
		.eq("id", id)
		.select("*")
		.single()
		.throwOnError();
	return data as ArticleRow;
}

/** Delete an article by id. */
export async function deleteArticle(
	supabase: SupabaseClient<Database>,
	id: string,
) {
	const { error } = await supabase.from("Article").delete().eq("id", id);
	if (error) throw error;
}
