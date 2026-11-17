import { baseUrl,site } from "@/config/site";


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
      postalCode: "27182",
      addressCountry: "MA",
    },
  };
}