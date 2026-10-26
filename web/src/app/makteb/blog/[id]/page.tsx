import { notFound } from "next/navigation";
import { db } from "@/lib/db";
import { ArticleForm, type ArticleFormValues } from "@/components/admin/article-form";

export const dynamic = "force-dynamic";

export default async function EditArticlePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const article = await db.article.findUnique({ where: { id } });
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
