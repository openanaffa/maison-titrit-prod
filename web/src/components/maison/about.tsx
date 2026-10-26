"use client";

import { site } from "@/config/site";
import { useT } from "@/i18n/locale-provider";
import { AmazighStar, OrnamentDivider, Reveal } from "@/components/maison/motifs";

export function About() {
  const { t } = useT();
  return (
    <section id="maison" className="relative scroll-mt-20 py-20 sm:py-28">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <Reveal className="text-center">
          <p className="eyebrow">{t("about.eyebrow")}</p>
          <h2 className="mt-4 font-display text-4xl font-semibold text-ink sm:text-5xl dark:text-cream">
            {t("about.title")}
          </h2>
          <p className="tifinagh mt-3 text-lg text-bronze">{site.nameAmazigh}</p>
          <OrnamentDivider className="mt-6" width={220} />
        </Reveal>

        <div className="mt-14 grid items-center gap-10 lg:grid-cols-2 lg:gap-16">
          <Reveal>
            <div className="vintage-frame rounded-sm p-7 sm:p-10">
              <div className="text-center">
                <AmazighStar className="mx-auto size-8 text-terracotta" />
                <h3 className="wordmark mt-4 text-2xl uppercase text-ink dark:text-cream">
                  {t("about.heading")}
                </h3>
                <p className="script-tagline mt-2 text-2xl text-terracotta">
                  {t("about.script")}
                </p>
                <OrnamentDivider className="mt-5" width={180} />
              </div>
              <p className="mt-6 font-serif text-lg leading-relaxed text-ink-soft sm:text-xl dark:text-cream/85">
                {t("about.p1")}
              </p>
              <p className="mt-4 font-serif text-base leading-relaxed text-ink-soft/90 dark:text-cream/70">
                {t("about.p2")}
              </p>
              <p className="mt-6 text-center font-serif text-xl text-terracotta" dir="rtl">
                {t("about.welcome")}
              </p>
              <p className="mt-5 text-center font-label text-[0.7rem] uppercase tracking-[0.3em] text-bronze">
                {site.signature}
              </p>
            </div>
          </Reveal>

          <Reveal delay={0.12} y={24}>
            <figure className="relative">
              <div className="vintage-frame overflow-hidden rounded-sm">
                <img
                  src="/images/maison-titrit/about-craft.png"
                  alt={t("hero.imageSub")}
                  className="aspect-[4/3] w-full object-cover"
                  loading="lazy"
                />
              </div>
              <div className="mt-4 flex items-start gap-3">
                <AmazighStar className="mt-1 size-5 shrink-0 text-terracotta" />
                <figcaption className="font-serif text-sm italic leading-relaxed text-ink-soft dark:text-cream/70">
                  La main, le fil, l'étoile. Chaque pièce naît d'un geste patient
                  hérité des couturières de l'Atlas.
                </figcaption>
              </div>
            </figure>
          </Reveal>
        </div>
      </div>
    </section>
  );
}
