import Link from "next/link";
import type { Metadata } from "next";
import { AmazighStar, OrnamentDivider, Reveal } from "@/components/maison/motifs";

export const metadata: Metadata = {
  title: "Page introuvable",
  robots: { index: false, follow: true },
};

export default function NotFound() {
  return (
    <section className="vintage-paper flex min-h-[70vh] items-center py-16 sm:py-20">
      <div className="mx-auto max-w-2xl px-4 text-center sm:px-6">
        <Reveal>
          <AmazighStar className="mx-auto size-9 text-terracotta" />
          <p className="eyebrow mt-4">Erreur 404</p>
          <h1 className="wordmark mt-3 text-4xl uppercase text-ink sm:text-5xl dark:text-cream">
            Ce fil s'est emmêlé
          </h1>
          <OrnamentDivider className="mt-5" width={200} />
          <p className="mx-auto mt-5 max-w-md font-serif text-lg leading-relaxed text-ink-soft dark:text-cream/75">
            La page que vous cherchez n'existe pas ou a changé d'adresse.
            Revenez à l'atelier — nos broderies, elles, ne bougent pas.
          </p>
          <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
            <Link
              href="/"
              className="inline-flex min-h-12 items-center justify-center rounded-full bg-ink px-6 font-label text-[0.72rem] uppercase tracking-[0.18em] text-cream transition-colors hover:bg-terracotta focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-terracotta dark:bg-cream dark:text-ink dark:hover:bg-terracotta dark:hover:text-cream"
            >
              Retour à l'accueil
            </Link>
            <Link
              href="/#collection"
              className="inline-flex min-h-12 items-center justify-center rounded-full border border-bronze/50 px-6 font-label text-[0.72rem] uppercase tracking-[0.16em] text-ink transition-colors hover:border-terracotta hover:text-terracotta focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-terracotta dark:text-cream"
            >
              Découvrir la collection
            </Link>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
