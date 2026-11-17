import { db } from "@/lib/db";

/** Published blog articles for a locale, newest first. */
export async function getPublishedArticles(locale = "fr") {
	if (!process.env.DATABASE_URL) {
		return [];
	}
	try {
		return await db.article.findMany({
			where: { published: true, locale },
			orderBy: { publishedAt: "desc" },
		});
	} catch {
		// Database unavailable at build time (e.g. missing/invalid credentials).
		// Return an empty list so static prerendering doesn't hard-fail.
		return [];
	}
}

export async function getPublishedArticle(slug: string, locale = "fr") {
	if (!process.env.DATABASE_URL) {
		return null;
	}
	try {
		return await db.article.findFirst({
			where: { slug, locale, published: true },
		});
	} catch {
		return null;
	}
}
