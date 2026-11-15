import type { Metadata } from "next";
import { LegalPage } from "@/components/maison/legal-page";
import { buildPageMetadata } from "@/lib/seo";

/** Public, indexable — legal pages are part of the compliance surface. */
export const metadata: Metadata = buildPageMetadata({
  title: "Politique de confidentialité — Maison Titrit",
  description:
    "Comment Maison Titrit collecte, utilise et protège vos données personnelles — loi marocaine 09-08, RGPD, cookies et droits des utilisateurs.",
  path: "/confidentialite",
  keywords: [
    "politique de confidentialité",
    "protection des données",
    "loi 09-08",
    "RGPD",
    "cookies",
    "Maison Titrit",
  ],
});

export default function ConfidentialitePage() {
  return <LegalPage doc="privacy" />;
}
