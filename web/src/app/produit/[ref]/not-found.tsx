import Link from "next/link";
import { AmazighStar, OrnamentDivider } from "@/components/maison/motifs";

export const dynamic = "force-dynamic";

export default function ProductNotFound() {
  return (
    <section className="vintage-paper flex min-h-[70vh] items-center justify-center px-4 py-24">
      <div className="vintage-frame max-w-lg rounded-sm p-10 text-center">
        <AmazighStar className="mx-auto size-10 text-terracotta" />
        <h1 className="wordmark mt-5 text-3xl uppercase text-ink dark:text-cream">
          Pièce introuvable
        </h1>
        <OrnamentDivider className="mt-5" width={180} />
        <p className="mt-5 font-serif text-lg leading-relaxed text-ink-soft dark:text-cream/75">
          Désolé, cette pièce n'est plus disponible ou le lien est incorrect.
        </p>
        <Link
          href="/#collection"
          className="mt-8 inline-flex items-center justify-center rounded-full bg-ink px-6 py-3 font-label text-[0.72rem] uppercase tracking-[0.18em] text-cream transition-colors hover:bg-terracotta dark:bg-cream dark:text-ink"
        >
          Voir la collection
        </Link>
      </div>
    </section>
  );
}
