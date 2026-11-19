import type { Metadata } from "next";
import { LegalPage } from "@/components/maison/legal-page";
import { getLegalIdentity } from "@/lib/legal-identity";
import { buildPageMetadata } from "@/lib/seo/build-page.metadata";

/** Public, indexable — trust/support page. */
export const metadata: Metadata = buildPageMetadata({
	title: "Mentions légales — Maison Titrit",
	description:
		"Mentions légales de Maison Titrit : éditeur, coordonnées, informations légales et conditions d'utilisation du site.",
	path: "/mentions-legales",
	keywords: [
		"mentions légales",
		"éditeur",
		"Maison Titrit",
		"contact",
		"Maroc",
	],
});

export default async function MentionsLegalesPage() {
	const legalIdentity = await getLegalIdentity();
	return <LegalPage doc="legalNotice" legalIdentity={legalIdentity} />;
}
