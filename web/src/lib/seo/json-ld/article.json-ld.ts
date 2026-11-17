import { baseUrl, site } from "@/config/site";


export function articleJsonLd(a: {
  slug: string;
  title: string;
  description: string;
  image?: string;
  publishedTime: string;
  modifiedTime?: string;
  author: string;
}) {
  const base = baseUrl();
  return {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: a.title,
    description: a.description,
    image: a.image ? (a.image.startsWith("http") ? a.image : `${base}${a.image}`) : `${base}/og-default.png`,
    datePublished: a.publishedTime,
    dateModified: a.modifiedTime ?? a.publishedTime,
    author: { "@type": "Organization", name: a.author },
    publisher: { "@type": "Organization", name: site.name, logo: { "@type": "ImageObject", url: `${base}/assets/titrit-logo-gold.svg` } },
    mainEntityOfPage: `${base}/blog/${a.slug}`,
  };
}