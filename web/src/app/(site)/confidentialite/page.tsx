import type { Metadata } from "next";
import { LegalPage } from "@/components/maison/legal-page";
import { getLegalIdentity } from "@/lib/legal-identity";
import { buildPageMetadata } from "@/lib/seo/build-page.metadata";

/** Public, indexable — legal pages are part of the compliance surface. */
export const metadata: Metadata = buildPageMetadata({
	title: "Politique de confidentialité — Maison Titrit",
	description:
		"Comment Maison Titrit collecte, utilise et protège vos données personnelles — cookies, consentement et droits des utilisateurs.",
	path: "/confidentialite",
	keywords: [
		"politique de confidentialité",
		"protection des données",
		"cookies",
		"Maison Titrit",
	],
});

export default async function ConfidentialitePage() {
	const legalIdentity = await getLegalIdentity();
	return <LegalPage doc="privacy" legalIdentity={legalIdentity} />;
}
