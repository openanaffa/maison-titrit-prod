import type { Metadata } from "next";
import { LegalPage } from "@/components/maison/legal-page";
import { buildPageMetadata } from "@/lib/seo/build-page.metadata";

/** Public, indexable — trust/support page. */
export const metadata: Metadata = buildPageMetadata({
	title: "Cookies et préférences — Maison Titrit",
	description:
		"Informations sur les cookies et technologies similaires utilisés par Maison Titrit, et gestion de vos préférences de consentement.",
	path: "/cookies",
	keywords: [
		"cookies",
		"consentement",
		"mesure d'audience",
		"marketing",
		"Maison Titrit",
	],
});

export default function Page() {
	return <LegalPage doc="cookies" />;
}
