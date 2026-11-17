import type { MetadataRoute } from "next";
import { baseUrl } from "@/config/site";
import { getPublishedArticles } from "@/lib/blog";
import { db } from "@/lib/db";

export const dynamic = "force-dynamic";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
	const base = baseUrl();
	const now = new Date();
	const staticPages: MetadataRoute.Sitemap = [
		{
			url: `${base}/`,
			lastModified: now,
			changeFrequency: "weekly",
			priority: 1,
		},
		{
			url: `${base}/confidentialite`,
			lastModified: now,
			changeFrequency: "yearly",
			priority: 0.5,
		},
		{
			url: `${base}/cgv`,
			lastModified: now,
			changeFrequency: "yearly",
			priority: 0.5,
		},
	];

	// Product detail pages
	const products = await db.product.findMany({
		where: { inStock: true },
		select: { ref: true, updatedAt: true },
	});
	const productPages: MetadataRoute.Sitemap = products.map((p) => ({
		url: `${base}/produit/${p.ref}`,
		lastModified: p.updatedAt,
		changeFrequency: "weekly",
		priority: 0.8,
	}));

	let blogPages: MetadataRoute.Sitemap = [];
	try {
		const posts = await getPublishedArticles();
		blogPages = posts.map((p) => ({
			url: `${base}/blog/${p.slug}`,
			lastModified: p.updatedAt,
			changeFrequency: "monthly",
			priority: 0.6,
		}));
		if (posts.length > 0) {
			blogPages.unshift({
				url: `${base}/blog`,
				lastModified: now,
				changeFrequency: "weekly",
				priority: 0.6,
			});
		}
	} catch {}

	return [...staticPages, ...productPages, ...blogPages];
}
