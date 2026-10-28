import { db } from "@/lib/db";

/** Published blog articles, newest first. */
export function getPublishedArticles() {
  return db.article.findMany({
    where: { published: true },
    orderBy: { publishedAt: "desc" },
  });
}

export function getPublishedArticle(slug: string) {
  return db.article.findFirst({ where: { slug, published: true } });
}
