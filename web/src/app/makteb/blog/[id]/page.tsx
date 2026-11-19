import { notFound } from "next/navigation";
import {
	ArticleForm,
	type ArticleFormValues,
} from "@/components/admin/article-form";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

export default async function EditArticlePage({
	params,
}: {
	params: Promise<{ id: string }>;
}) {
	const { id } = await params;
	const supabase = await createSupabaseServerClient();
	const { data: article } = await supabase
		.from("Article")
		.select("*")
		.eq("id", id)
		.maybeSingle()
		.throwOnError();
	if (!article) notFound();
	const initial: ArticleFormValues = {
		slug: article.slug,
		title: article.title,
		excerpt: article.excerpt,
		body: article.body,
		coverImage: article.coverImage ?? "",
		authorName: article.authorName,
		tags: article.tags,
		published: article.published,
	};
	return <ArticleForm mode="edit" initial={initial} articleId={article.id} />;
}
