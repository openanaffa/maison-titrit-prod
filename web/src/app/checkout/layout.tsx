import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Commande — Paiement à la livraison (COD)",
  description: "Finalisez votre commande Maison Titrit — paiement à la livraison partout au Maroc.",
  robots: { index: false, follow: false },
};

export default function CheckoutLayout({ children }: { children: React.ReactNode }) {
  return children;
}
