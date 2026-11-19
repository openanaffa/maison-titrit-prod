import type { Metadata } from "next";
import dynamicImport from "next/dynamic";
import { About } from "@/components/maison/about";
import { CraftBand } from "@/components/maison/craft-band";
import { Hero } from "@/components/maison/hero";
import { ProductCatalogue } from "@/components/maison/product-catalogue";
import { TitritLoader } from "@/components/maison/titrit-loader";

import { listProducts } from "@/lib/products";
import { buildPageMetadata } from "@/lib/seo/build-page.metadata";
import { itemListJsonLd } from "@/lib/seo/json-ld/item-list.json-ld";
import { serializeJsonLd } from "@/lib/serialize-json-ld";

export const dynamic = "force-dynamic";

// Below-the-fold sections are dynamic-imported (SSR kept on) so their JS
// is not part of the critical path while above-the-fold content stays
// server-rendered.
const MapSection = dynamicImport(
	() => import("@/components/maison/map-section").then((m) => m.MapSection),
	{ ssr: true, loading: () => <div className="py-20" aria-hidden="true" /> },
);
const ContactSocial = dynamicImport(
	() =>
		import("@/components/maison/contact-social").then((m) => m.ContactSocial),
	{ ssr: true, loading: () => <div className="py-20" aria-hidden="true" /> },
);
const WhatsAppFloat = dynamicImport(
	() =>
		import("@/components/maison/whatsapp-float").then((m) => m.WhatsAppFloat),
	{ ssr: true, loading: () => null },
);
export const metadata: Metadata = buildPageMetadata({
	title: "Maison Titrit — Modest Fashion · 100% Made in Morocco",
	description:
		"Maison de couture marocaine — mode modeste pour femmes. Caftans, robes, tuniques, ensembles & abayas. Style, confort, qualité. Commande sur WhatsApp — paiement à la livraison (COD). 100% Made in Morocco 🇲🇦.",
	path: "/",
	keywords: [
		"Maison Titrit",
		"mode modeste",
		"modest fashion",
		"caftan",
		"robe",
		"tunique",
		"abaya",
		"Made in Morocco",
		"Bouskoura",
		"Casablanca",
		"WhatsApp order",
		"COD",
		"Amazigh",
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
				// biome-ignore lint/security/noDangerouslySetInnerHtml: JSON-LD requires an inline script
				dangerouslySetInnerHTML={{ __html: serializeJsonLd(itemListLd) }}
			/>
			<TitritLoader />
			<main id="accueil" className="flex-1">
				<Hero />
				<About />
				<CraftBand />
				<ProductCatalogue />
				<MapSection />
				<ContactSocial />
			</main>
			<WhatsAppFloat />
		</>
	);
}
