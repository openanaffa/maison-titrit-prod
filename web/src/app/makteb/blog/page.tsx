import { db } from "@/lib/db";
import { ArticlesTableClient } from "@/components/admin/articles-table-client";

export const dynamic = "force-dynamic";

export default async function MaktebArticlesPage() {
  const articles = await db.article.findMany({
    orderBy: { createdAt: "desc" },
  });
  const rows = articles.map((a) => ({
    id: a.id,
    slug: a.slug,
    title: a.title,
    published: a.published,
    publishedAt: a.publishedAt?.toISOString() ?? null,
    updatedAt: a.updatedAt.toISOString(),
  }));
  return <ArticlesTableClient rows={rows} />;
}
