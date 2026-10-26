/**
 * ============================================================================
 *  MAISON TITRIT — SEO / marketing metadata helpers
 * ----------------------------------------------------------------------------
 *  Centralized builders for Next.js Metadata (OG, Twitter, canonical, robots)
 *  + JSON-LD structured data for ads + social sharing + rich results.
 *  Use buildPageMetadata() on every page for consistent marketing readiness.
 * ============================================================================
 */
import type { Metadata } from "next";
import { site } from "@/config/site";

export function baseUrl(): string {
  return process.env.NEXT_PUBLIC_SITE_URL || "https://maisontitrit.ma";
}

const DEFAULT_OG = "/og-default.png";

export type PageMetaInput = {
  title: string;
  description: string;
  /** Path beginning with / (or full URL). Defaults to "/" */
  path?: string;
  /** OG image path (default: /og-default.png) */
  image?: string;
  /** "website" | "article" | "product" | "profile" */
  ogType?: "website" | "article" | "product" | "profile";
  /** ISO date string for articles */
  publishedTime?: string;
  /** ISO date string for articles */
  modifiedTime?: string;
  /** For articles */
  author?: string;
  /** keywords */
  keywords?: string[];
  /** noindex / nofollow for private/low-value pages */
  noIndex?: boolean;
  /** locale override */
  locale?: string;
};

/** Build a fully-marketing-ready Metadata object for a page. */
export function buildPageMetadata(input: PageMetaInput): Metadata {
  const base = baseUrl();
  const path = input.path ?? "/";
  const url = path.startsWith("http") ? path : `${base}${path}`;
  const imgUrl = input.image
    ? (input.image.startsWith("http") ? input.image : `${base}${input.image}`)
    : `${base}${DEFAULT_OG}`;

  const ogType: "website" | "article" | "profile" =
    input.ogType === "article" ? "article" : input.ogType === "profile" ? "profile" : "website";

  return {
    title: input.title,
    description: input.description,
    keywords: input.keywords,
    alternates: { canonical: url },
    openGraph: {
      title: input.title,
      description: input.description,
      url,
      siteName: site.name,
      type: ogType,
      locale: input.locale ?? "fr_MA",
      images: [
        {
          url: imgUrl,
          width: 1200,
          height: 630,
          alt: input.title,
        },
      ],
      ...(input.publishedTime ? { publishedTime: input.publishedTime } : {}),
      ...(input.modifiedTime ? { modifiedTime: input.modifiedTime } : {}),
    },
    twitter: {
      card: "summary_large_image",
      title: input.title,
      description: input.description,
      images: [imgUrl],
    },
    robots: input.noIndex
      ? { index: false, follow: false }
      : { index: true, follow: true, "max-snippet": -1, "max-image-preview": "large", "max-video-preview": -1 },
  };
}

/* --- JSON-LD helpers (rich results for ads + search) -------------------- */

export function organizationJsonLd() {
  const base = baseUrl();
  return {
    "@context": "https://schema.org",
    "@type": ["ClothingStore", "Store"],
    "@id": `${base}/#organization`,
    name: site.name,
    url: base,
    logo: `${base}/assets/titrit-logo-gold.svg`,
    image: `${base}/og-default.png`,
    description:
      "Maison de couture marocaine — mode modeste pour femmes. 100% Made in Morocco.",
    telephone: site.phones[0].e164,
    email: site.email,
    priceRange: "$$",
    currenciesAccepted: "MAD",
    paymentAccepted: "Cash on delivery",
    sameAs: [
      site.socials.instagram,
      site.socials.pinterest,
      site.socials.facebook,
      site.socials.tiktok,
      site.socials.youtube,
    ],
    address: {
      "@type": "PostalAddress",
      streetAddress: `${site.address.line1}, ${site.address.line2}`,
      addressLocality: site.address.city,
      addressCountry: "MA",
    },
  };
}

export function productJsonLd(p: {
  ref: string;
  name: string;
  description: string;
  image: string;
  price: number;
  salePrice?: number | null;
  currency: string;
  category?: string;
  inStock?: boolean;
}) {
  const base = baseUrl();
  const price = p.salePrice ?? p.price;
  return {
    "@context": "https://schema.org",
    "@type": "Product",
    "@id": `${base}/produit/${p.ref}`,
    name: p.name,
    description: p.description,
    image: p.image.startsWith("http") ? p.image : `${base}${p.image}`,
    sku: p.ref,
    brand: { "@type": "Brand", name: site.name },
    offers: {
      "@type": "Offer",
      url: `${base}/produit/${p.ref}`,
      price: price.toFixed(2),
      priceCurrency: p.currency,
      availability: p.inStock === false ? "https://schema.org/OutOfStock" : "https://schema.org/InStock",
      itemCondition: "https://schema.org/NewCondition",
      seller: { "@id": `${base}/#organization` },
    },
  };
}

export function breadcrumbJsonLd(items: { name: string; path: string }[]) {
  const base = baseUrl();
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((it, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: it.name,
      item: it.path.startsWith("http") ? it.path : `${base}${it.path}`,
    })),
  };
}

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

export function itemListJsonLd(items: { ref: string; name: string; image: string; price: number; currency: string }[]) {
  const base = baseUrl();
  return {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name: "Collection Maison Titrit",
    itemListElement: items.map((it, i) => ({
      "@type": "ListItem",
      position: i + 1,
      url: `${base}/produit/${it.ref}`,
      name: it.name,
      image: it.image.startsWith("http") ? it.image : `${base}${it.image}`,
      price: `${it.price} ${it.currency}`,
    })),
  };
}
