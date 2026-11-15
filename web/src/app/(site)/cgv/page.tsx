import type { Metadata } from "next";
import { LegalPage } from "@/components/maison/legal-page";
import { buildPageMetadata } from "@/lib/seo";

/** Public, indexable — legal pages are part of the compliance surface. */
export const metadata: Metadata = buildPageMetadata({
  title: "Conditions générales de vente — Maison Titrit",
  description:
    "Conditions générales de vente de Maison Titrit : commandes, paiement à la livraison, livraison au Maroc, échanges et retours, garanties.",
  path: "/cgv",
  keywords: [
    "conditions générales de vente",
    "CGV",
    "vente en ligne Maroc",
    "paiement à la livraison",
    "retours échanges",
    "Maison Titrit",
  ],
});

export default function CgvPage() {
  return <LegalPage doc="terms" />;
}
