import { ArticlesTableClient } from "@/components/admin/articles-table-client";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

export default async function MaktebArticlesPage() {
	const supabase = await createSupabaseServerClient();
	const { data: articles } = await supabase
		.from("Article")
		.select("*")
		.order("createdAt", { ascending: false })
		.throwOnError();
	const rows = articles.map((a) => ({
		id: a.id,
		slug: a.slug,
		title: a.title,
		published: a.published,
		publishedAt: a.publishedAt,
		updatedAt: a.updatedAt,
	}));
	return <ArticlesTableClient rows={rows} />;
}
