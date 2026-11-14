"use client";

import Link from "next/link";
import { useT } from "@/i18n/locale-provider";
import { legalDocs, type LegalDocKey } from "@/i18n/legal-docs";
import {
  AmazighStar,
  OrnamentDivider,
  Reveal,
} from "@/components/maison/motifs";

/**
 * Long-form legal document renderer (privacy policy · CGV).
 * Content lives in src/i18n/legal-docs.ts; this component only lays it out
 * in the vintage design system and follows the active locale (fr / ar / en).
 * Rendered publicly at /confidentialite and /cgv.
 */
export function LegalPage({ doc }: { doc: LegalDocKey }) {
  const { locale } = useT();
  const d = legalDocs[locale][doc];

  return (
    <section className="vintage-paper min-h-[80vh] py-16 sm:py-20">
      <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
        <Reveal className="text-center">
          <AmazighStar className="mx-auto size-9 text-terracotta" />
          <p className="eyebrow mt-4">{d.eyebrow}</p>
          <h1 className="wordmark mt-3 text-3xl uppercase text-ink sm:text-4xl dark:text-cream">
            {d.title}
          </h1>
          <OrnamentDivider className="mt-5" />
          <p className="mt-4 font-serif text-xs text-ink-soft/70 dark:text-cream/60">
            {d.updated}
          </p>
        </Reveal>

        <Reveal className="mt-10">
          <p className="font-serif text-[0.95rem] leading-relaxed text-ink-soft dark:text-cream/80">
            {d.intro}
          </p>
        </Reveal>

        <div className="mt-10 space-y-8">
          {d.sections.map((s) => (
            <Reveal key={s.h}>
              <h2 className="font-display text-lg font-semibold text-ink dark:text-cream">
                {s.h}
              </h2>
              {s.p.map((para, i) => (
                <p
                  key={i}
                  className="mt-2 font-serif text-sm leading-relaxed text-ink-soft dark:text-cream/75"
                >
                  {para}
                </p>
              ))}
            </Reveal>
          ))}
        </div>

        <Reveal className="mt-12 border-t border-bronze/30 pt-8">
          <div className="flex flex-wrap items-center justify-center gap-x-6 gap-y-3">
            {d.related.map((r) => (
              <Link
                key={r.href}
                href={r.href}
                className="font-label text-[0.7rem] uppercase tracking-[0.18em] text-bronze transition-colors hover:text-terracotta"
              >
                {r.label}
              </Link>
            ))}
          </div>
        </Reveal>
      </div>
    </section>
  );
}
