import type { Metadata } from "next";
import { LegalPage } from "@/components/maison/legal-page";
import { getLegalIdentity } from "@/lib/legal-identity";
import { buildPageMetadata } from "@/lib/seo/build-page.metadata";

/** Public, indexable — legal pages are part of the compliance surface. */
export const metadata: Metadata = buildPageMetadata({
	title: "Conditions générales de vente — Maison Titrit",
	description:
		"Conditions générales de vente de Maison Titrit : commandes, paiement à la livraison, livraison au Maroc, échanges et retours.",
	path: "/cgv",
	keywords: [
		"conditions générales de vente",
		"CGV",
		"vente en ligne Maroc",
		"paiement à la livraison",
		"Maison Titrit",
	],
});

export default async function CgvPage() {
	const legalIdentity = await getLegalIdentity();
	return <LegalPage doc="terms" legalIdentity={legalIdentity} />;
}
