"use client";

import { useT } from "@/i18n/locale-provider";
import { AmazighStar, Reveal } from "@/components/maison/motifs";

const PATTERN = "/images/maison-titrit/pattern-amazigh.png";

export function CraftBand() {
  const { t } = useT();
  const pillars = [
    { title: t("craft.p1.title"), body: t("craft.p1.body") },
    { title: t("craft.p2.title"), body: t("craft.p2.body") },
    { title: t("craft.p3.title"), body: t("craft.p3.body") },
  ];

  return (
    <section
      id="atelier"
      className="relative scroll-mt-20 overflow-hidden border-y border-bronze/25 py-20 sm:py-24"
    >
      <div
        className="absolute inset-0 opacity-[0.12] dark:opacity-[0.10]"
        style={{
          backgroundImage: `url(${PATTERN})`,
          backgroundSize: "cover",
          backgroundPosition: "center",
        }}
        aria-hidden="true"
      />
      <div className="absolute inset-0 bg-background/55" aria-hidden="true" />

      <div className="relative mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <Reveal className="text-center">
          <p className="eyebrow">{t("craft.eyebrow")}</p>
          <h2 className="mt-4 font-display text-4xl font-semibold text-ink sm:text-5xl dark:text-cream">
            {t("craft.title")}
          </h2>
          <p className="mx-auto mt-5 max-w-2xl font-serif text-lg leading-relaxed text-ink-soft dark:text-cream/75">
            {t("craft.subtitle")}
          </p>
        </Reveal>

        <div className="mt-14 grid gap-6 sm:grid-cols-3">
          {pillars.map((p, i) => (
            <Reveal key={p.title} delay={i * 0.1}>
              <div className="card-vintage group h-full rounded-sm p-7 text-center transition-transform duration-500 hover:-translate-y-1">
                <AmazighStar
                  className="mx-auto size-9 text-terracotta transition-transform duration-500 group-hover:rotate-45"
                  strokeWidth={1.4}
                />
                <h3 className="mt-5 font-display text-2xl font-semibold text-ink dark:text-cream">
                  {p.title}
                </h3>
                <p className="mt-3 font-serif text-base leading-relaxed text-ink-soft dark:text-cream/75">
                  {p.body}
                </p>
              </div>
            </Reveal>
          ))}
        </div>

        <Reveal delay={0.3}>
          <p className="mt-12 text-center font-label text-[0.72rem] uppercase tracking-[0.32em] text-bronze">
            {t("craft.signature")}
          </p>
        </Reveal>
      </div>
    </section>
  );
}
