import type { MetadataRoute } from "next";
import { db } from "@/lib/db";
import { getPublishedArticles } from "@/lib/blog";

export const dynamic = "force-dynamic";

function baseUrl() {
  return process.env.NEXT_PUBLIC_SITE_URL || "https://maisontitrit.com";
}

/** Dynamic sitemap.xml — homepage, static sections, product detail pages, blog. */
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = baseUrl();
  const now = new Date();

  // Static pages + in-page sections — public commerce + content only.
  // Private/noindex surfaces (/auth, /panier, /checkout) are deliberately
  // absent from the sitemap (they carry X-Robots-Tag noindex in next.config).
  // Fragment anchors are not separate pages (Google ignores URL fragments in
  // sitemaps), so only the canonical homepage URL is listed to avoid duplicate
  // homepage entries.
  const staticPages: MetadataRoute.Sitemap = [
    { url: `${base}/`, lastModified: now, changeFrequency: "weekly", priority: 1 },
    { url: `${base}/confidentialite`, lastModified: now, changeFrequency: "yearly", priority: 0.5 },
    { url: `${base}/cgv`, lastModified: now, changeFrequency: "yearly", priority: 0.5 },
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
  } catch {
  }

  return [...staticPages, ...productPages, ...blogPages];
}
