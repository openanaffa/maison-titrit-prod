import {
  faqSchema,
  localBusinessSchema,
  websiteSchema,
} from "@/lib/json-ld";

/**
 * Global JSON-LD — rendered once in <head> via layout.tsx.
 * Emits Organization/LocalBusiness + WebSite + FAQPage structured data so
 * search engines can show rich results (store info, hours, FAQs, sitelinks).
 */
export function SiteJsonLd() {
  const blocks = [
    localBusinessSchema(),
    websiteSchema(),
    faqSchema(),
  ];
  return (
    <>
      {blocks.map((b, i) => (
        <script
          key={i}
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(b) }}
        />
      ))}
    </>
  );
}
