/**
 * Maison Titrit — JSON-LD structured data (schema.org)
 * ----------------------------------------------------------------------------
 *  Centralised builders for schema.org JSON-LD, rendered server-side into
 *  <script type="application/ld+json">. Covers: Organization / LocalBusiness,
 *  WebSite + SearchAction, Product, BreadcrumbList, ItemList, FAQPage.
 *
 *  Rendered via <SiteJsonLd /> in layout.tsx (global) and per-page blocks.
 */
import { site } from "@/config/site";

export function siteBaseUrl(): string {
  if (process.env.NEXT_PUBLIC_SITE_URL) return process.env.NEXT_PUBLIC_SITE_URL;
  return "https://maisontitrit.com";
}

export function orgLogoUrl(): string {
  return `${siteBaseUrl()}/assets/titrit-logo-gold.svg`;
}

export function productImageUrl(path: string): string {
  return path.startsWith("http") ? path : `${siteBaseUrl()}${path}`;
}

/* --- Organization / LocalBusiness -------------------------------------- */
export function localBusinessSchema() {
  return {
    "@context": "https://schema.org",
    "@type": ["ClothingStore", "Store"],
    "@id": `${siteBaseUrl()}/#organization`,
    name: site.name,
    alternateName: "Titrit",
    description:
      "Maison de couture marocaine — mode modeste pour femmes. Style, confort, qualité. 100% Made in Morocco. Caftans, robes, tuniques, ensembles & abayas.",
    url: siteBaseUrl(),
    logo: orgLogoUrl(),
    image: orgLogoUrl(),
    telephone: site.phones[0].e164,
    email: site.email,
    priceRange: "$$",
    currenciesAccepted: "MAD",
    paymentAccepted: "Cash on delivery",
    address: {
      "@type": "PostalAddress",
      streetAddress: `${site.address.line1}, ${site.address.line2}`,
      addressLocality: site.address.city,
      addressCountry: "MA",
    },
    geo: {
      "@type": "GeoCoordinates",
      latitude: site.map.lat,
      longitude: site.map.lon,
    },
    hasMap: `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
      site.map.query,
    )}`,
    openingHoursSpecification: [
      {
        "@type": "OpeningHoursSpecification",
        dayOfWeek: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"],
        opens: "10:00",
        closes: "20:00",
      },
      {
        "@type": "OpeningHoursSpecification",
        dayOfWeek: "Saturday",
        opens: "10:00",
        closes: "21:00",
      },
    ],
    sameAs: [
      site.socials.instagram,
      site.socials.pinterest,
      site.socials.facebook,
      site.socials.tiktok,
      site.socials.youtube,
    ],
    parentOrganization: {
      "@type": "Organization",
      name: site.name,
    },
  };
}

/* --- WebSite + SearchAction -------------------------------------------- */
export function websiteSchema() {
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "@id": `${siteBaseUrl()}/#website`,
    url: siteBaseUrl(),
    name: site.name,
    description: "Mode modeste pour femmes · 100% Made in Morocco",
    inLanguage: ["fr", "ar", "en"],
    publisher: { "@id": `${siteBaseUrl()}/#organization` },
    potentialAction: {
      "@type": "SearchAction",
      target: {
        "@type": "EntryPoint",
        urlTemplate: `${siteBaseUrl()}/#collection?q={search_term_string}`,
        "actionPlatform": ["https://schema.org/DesktopWebPlatform"],
      },
      "query-input": "required name=search_term_string",
    },
  };
}

/* --- Product ----------------------------------------------------------- */
export function productSchema(opts: {
  name: string;
  description: string;
  image: string;
  ref: string;
  price: number;
  currency: string;
  category?: string;
}) {
  return {
    "@context": "https://schema.org",
    "@type": "Product",
    "@id": `${siteBaseUrl()}/produit/${opts.ref}`,
    name: opts.name,
    description: opts.description,
    image: productImageUrl(opts.image),
    sku: opts.ref,
    category: opts.category,
    brand: { "@type": "Brand", name: site.name },
    offers: {
      "@type": "Offer",
      url: `${siteBaseUrl()}/produit/${opts.ref}`,
      price: opts.price,
      priceCurrency: opts.currency,
      availability: "https://schema.org/InStock",
      itemCondition: "https://schema.org/NewCondition",
      priceSpecification: {
        "@type": "PriceSpecification",
        price: opts.price,
        priceCurrency: opts.currency,
      },
      seller: { "@id": `${siteBaseUrl()}/#organization` },
    },
  };
}

/* --- BreadcrumbList ---------------------------------------------------- */
export function breadcrumbSchema(items: { name: string; path: string }[]) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((it, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: it.name,
      item: it.path.startsWith("http") ? it.path : `${siteBaseUrl()}${it.path}`,
    })),
  };
}

/* --- ItemList (catalogue) ---------------------------------------------- */
export function itemListSchema(
  items: {
    ref: string;
    name: string;
    image: string;
    price: number;
    currency: string;
  }[],
) {
  return {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name: "Collection Maison Titrit",
    itemListElement: items.map((it, i) => ({
      "@type": "ListItem",
      position: i + 1,
      url: `${siteBaseUrl()}/produit/${it.ref}`,
      name: it.name,
      image: productImageUrl(it.image),
      price: `${it.price} ${it.currency}`,
    })),
  };
}

/* --- FAQPage (common atelier questions) -------------------------------- */
export function faqSchema() {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: [
      {
        "@type": "Question",
        name: "Comment passer commande chez Maison Titrit ?",
        acceptedAnswer: {
          "@type": "Answer",
          text:
            "Choisissez une pièce dans la collection, sélectionnez votre taille, puis cliquez sur « Commander ». Un message WhatsApp pré-rempli s'ouvre avec la référence, la taille et le prix. Vous pouvez aussi consulter notre catalogue WhatsApp complet : wa.me/c/105815813947432.",
        },
      },
      {
        "@type": "Question",
        name: "Proposez-vous le paiement à la livraison (COD) ?",
        acceptedAnswer: {
          "@type": "Answer",
          text:
            "Oui — paiement à la livraison (COD) partout au Maroc. Vous payez en espèces à la réception de votre commande.",
        },
      },
      {
        "@type": "Question",
        name: "Livrez-vous partout au Maroc ?",
        acceptedAnswer: {
          "@type": "Answer",
          text:
            "Oui, nous livrons partout au Maroc. Les délais vous sont confirmés par WhatsApp lors de la commande.",
        },
      },
      {
        "@type": "Question",
        name: "Faites-vous du sur-mesure ?",
        acceptedAnswer: {
          "@type": "Answer",
          text:
            "Oui, le sur-mesure est disponible sur demande. Contactez-nous sur WhatsApp pour convenir d'un rendez-vous à l'atelier de Bouskoura.",
        },
      },
      {
        "@type": "Question",
        name: "Où se trouve l'atelier Maison Titrit ?",
        acceptedAnswer: {
          "@type": "Answer",
          text: `${site.address.line1}, ${site.address.line2}, ${site.address.line3}, ${site.address.city}, ${site.address.country}. Ouvert du lundi au samedi.`,
        },
      },
    ],
  };
}
