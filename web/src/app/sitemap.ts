import type { MetadataRoute } from "next";
import { db } from "@/lib/db";
import { fetchCmsArticles } from "@/lib/cms";

export const dynamic = "force-dynamic";

function baseUrl() {
  return process.env.NEXT_PUBLIC_SITE_URL || "https://maisontitrit.com";
}

/** Dynamic sitemap.xml — homepage, static sections, product detail pages, blog. */
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = baseUrl();
  const now = new Date();

  // Static pages + in-page sections
  const staticPages: MetadataRoute.Sitemap = [
    { url: `${base}/`, lastModified: now, changeFrequency: "weekly", priority: 1 },
    { url: `${base}/#maison`, lastModified: now, changeFrequency: "monthly", priority: 0.6 },
    { url: `${base}/#collection`, lastModified: now, changeFrequency: "weekly", priority: 0.9 },
    { url: `${base}/#atelier`, lastModified: now, changeFrequency: "monthly", priority: 0.5 },
    { url: `${base}/#nous-trouver`, lastModified: now, changeFrequency: "monthly", priority: 0.5 },
    { url: `${base}/#contact`, lastModified: now, changeFrequency: "monthly", priority: 0.5 },
    { url: `${base}/auth/signin`, lastModified: now, changeFrequency: "yearly", priority: 0.2 },
    { url: `${base}/panier`, lastModified: now, changeFrequency: "yearly", priority: 0.2 },
    { url: `${base}/checkout`, lastModified: now, changeFrequency: "yearly", priority: 0.2 },
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

  // Blog posts from the Strapi CMS (pulls the fetch cache, tag "cms")
  let blogPages: MetadataRoute.Sitemap = [];
  try {
    const posts = await fetchCmsArticles();
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
    // CMS unreachable — skip blog URLs rather than failing the whole sitemap
  }

  return [...staticPages, ...productPages, ...blogPages];
}
