import type { Metadata } from "next";
import { ContactSupportPage } from "@/components/maison/contact-support-page";
import { buildPageMetadata } from "@/lib/seo/build-page.metadata";

/** Public, indexable — trust/support page. */
export const metadata: Metadata = buildPageMetadata({
	title: "Contact — Maison Titrit",
	description:
		"Contactez Maison Titrit : WhatsApp, téléphone, e-mail, adresse de l'atelier à Bouskoura et horaires d'ouverture.",
	path: "/contact",
	keywords: [
		"contact",
		"Maison Titrit",
		"WhatsApp",
		"atelier Bouskoura",
		"service client",
	],
});

export default function ContactPage() {
	return <ContactSupportPage />;
}
