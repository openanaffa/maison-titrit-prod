import { db } from "@/lib/db";

/** Published blog articles, newest first. */
export async function getPublishedArticles() {
  if (!process.env.DATABASE_URL) {
    return [];
  }
  try {
    return await db.article.findMany({
      where: { published: true },
      orderBy: { publishedAt: "desc" },
    });
  } catch {
    // Database unavailable at build time (e.g. missing/invalid credentials).
    // Return an empty list so static prerendering doesn't hard-fail.
    return [];
  }
}

export async function getPublishedArticle(slug: string) {
  if (!process.env.DATABASE_URL) {
    return null;
  }
  try {
    return await db.article.findFirst({ where: { slug, published: true } });
  } catch {
    return null;
  }
}
