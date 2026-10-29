import { SiteHeader } from "@/components/maison/site-header";
import { Hero } from "@/components/maison/hero";
import { About } from "@/components/maison/about";
import { CraftBand } from "@/components/maison/craft-band";
import { ProductCatalogue } from "@/components/maison/product-catalogue";
import { MapSection } from "@/components/maison/map-section";
import { ContactSocial } from "@/components/maison/contact-social";
import { SiteFooter } from "@/components/maison/site-footer";
import { WhatsAppFloat } from "@/components/maison/whatsapp-float";
import { TitritLoader } from "@/components/maison/titrit-loader";
import { listProducts } from "@/lib/products";
import { itemListJsonLd, buildPageMetadata } from "@/lib/seo";
import type { Metadata } from "next";

export const dynamic = "force-dynamic";

export const metadata: Metadata = buildPageMetadata({
  title: "Maison Titrit — Modest Fashion · 100% Made in Morocco",
  description:
    "Maison de couture marocaine — mode modeste pour femmes. Caftans, robes, tuniques, ensembles & abayas. Style, confort, qualité. Commande sur WhatsApp — paiement à la livraison (COD). 100% Made in Morocco 🇲🇦.",
  path: "/",
  keywords: [
    "Maison Titrit", "mode modeste", "modest fashion", "caftan", "robe",
    "tunique", "abaya", "Made in Morocco", "Bouskoura", "Casablanca",
    "WhatsApp order", "COD", "Amazigh",
  ],
});

export default async function Home() {
  const products = await listProducts();
  const itemListLd = itemListJsonLd(
    products.map((p) => ({
      ref: p.ref,
      name: p.name,
      image: p.image,
      price: p.price,
      currency: p.currency,
    })),
  );

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(itemListLd) }}
      />
      <TitritLoader />
      <SiteHeader />
      <main id="accueil" className="flex-1">
        <Hero />
        <About />
        <CraftBand />
        <ProductCatalogue />
        <MapSection />
        <ContactSocial />
      </main>
      <SiteFooter />
      <WhatsAppFloat />
    </>
  );
}
