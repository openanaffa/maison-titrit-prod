import { AmazighStar, OrnamentDivider } from "@/components/maison/motifs";

export const dynamic = "force-dynamic";

export default function VerifyRequest() {
  return (
    <section className="vintage-paper flex min-h-[100svh] items-center justify-center px-4 pt-12 pb-44 sm:pb-40">
      <div className="vintage-frame max-w-md rounded-sm bg-card/95 p-9 text-center">
        <AmazighStar className="mx-auto size-9 text-terracotta" />
        <h1 className="wordmark mt-4 text-xl uppercase text-ink dark:text-cream">
          Vérifiez votre boîte mail
        </h1>
        <OrnamentDivider className="mt-4" width={160} />
        <p className="mt-5 font-serif text-base leading-relaxed text-ink-soft dark:text-cream/80">
          Un lien de connexion vient de vous être envoyé par email. Cliquez
          dessus pour vous connecter — le lien expire dans 24 heures.
        </p>
        <p className="mt-4 font-serif text-sm text-bronze">
          (En développement, le lien s'affiche aussi dans la console du serveur.)
        </p>
      </div>
    </section>
  );
}
