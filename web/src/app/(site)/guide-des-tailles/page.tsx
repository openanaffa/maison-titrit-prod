import type { Metadata } from "next";
import { LegalPage } from "@/components/maison/legal-page";
import { buildPageMetadata } from "@/lib/seo/build-page.metadata";

/** Public, indexable — trust/support page. */
export const metadata: Metadata = buildPageMetadata({
	title: "Guide des tailles — Maison Titrit",
	description:
		"Conseils pour prendre vos mesures et choisir la taille de vos pièces Maison Titrit.",
	path: "/guide-des-tailles",
	keywords: [
		"guide des tailles",
		"mesures",
		"tailles",
		"mode modeste",
		"Maison Titrit",
	],
});

export default function Page() {
	return <LegalPage doc="sizing" />;
}
