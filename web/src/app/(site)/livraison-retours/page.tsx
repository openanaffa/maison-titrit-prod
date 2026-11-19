import type { Metadata } from "next";
import { LegalPage } from "@/components/maison/legal-page";
import { buildPageMetadata } from "@/lib/seo/build-page.metadata";

/** Public, indexable — trust/support page. */
export const metadata: Metadata = buildPageMetadata({
	title: "Livraison et retours — Maison Titrit",
	description:
		"Informations sur la livraison au Maroc, le paiement à la livraison (COD), les échanges et retours chez Maison Titrit.",
	path: "/livraison-retours",
	keywords: [
		"livraison",
		"retours",
		"échanges",
		"paiement à la livraison",
		"COD",
		"Maison Titrit",
	],
});

export default function Page() {
	return <LegalPage doc="deliveryReturns" />;
}
