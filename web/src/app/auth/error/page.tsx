import Link from "next/link";
import { AmazighStar, OrnamentDivider } from "@/components/maison/motifs";

export const dynamic = "force-dynamic";

export default function AuthError() {
  return (
    <section className="vintage-paper flex min-h-[100svh] items-center justify-center px-4 pt-12 pb-44 sm:pb-40">
      <div className="vintage-frame max-w-md rounded-sm bg-card/95 p-9 text-center">
        <AmazighStar className="mx-auto size-9 text-terracotta" />
        <h1 className="wordmark mt-4 text-xl uppercase text-ink dark:text-cream">
          Une erreur est survenue
        </h1>
        <OrnamentDivider className="mt-4" width={160} />
        <p className="mt-5 font-serif text-base leading-relaxed text-ink-soft dark:text-cream/80">
          La connexion a échoué. Le lien est peut-être expiré ou déjà utilisé.
        </p>
        <Link
          href="/auth/signin"
          className="mt-6 inline-flex items-center justify-center rounded-full bg-ink px-6 py-3 font-label text-[0.72rem] uppercase tracking-[0.18em] text-cream hover:bg-terracotta dark:bg-cream dark:text-ink"
        >
          Réessayer
        </Link>
      </div>
    </section>
  );
}
