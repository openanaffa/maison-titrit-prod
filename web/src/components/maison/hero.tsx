"use client";

import * as React from "react";
import { ArrowDown, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { site } from "@/config/site";
import { whatsappCatalog, whatsappContactLink } from "@/lib/brand";
import {
  AmazighStar,
  NeedleThread,
  OrnamentDivider,
  Reveal,
  WhatsAppIcon,
} from "@/components/maison/motifs";
import { useT } from "@/i18n/locale-provider";

export function Hero() {
  const { t, locale } = useT();

  return (
    <section
      id="accueil"
      className="vintage-paper relative overflow-hidden pt-10 sm:pt-16"
    >
      <AmazighStar
        className="pointer-events-none absolute -left-10 top-24 size-40 text-bronze/10"
        strokeWidth={1}
      />
      <AmazighStar
        className="pointer-events-none absolute -right-12 bottom-10 size-56 text-terracotta/10"
        strokeWidth={1}
      />

      <div className="mx-auto grid max-w-6xl items-center gap-10 px-4 pb-16 sm:px-6 lg:grid-cols-[1.05fr_1fr] lg:gap-14 lg:px-8 lg:pb-24 lg:pt-10">
        {/* Left — text */}
        <div className="order-2 lg:order-1">
          <Reveal>
            <p className="eyebrow flex items-center gap-2">
              <Sparkles className="size-3.5" />
              {t("hero.eyebrow")}
            </p>
          </Reveal>

          <Reveal delay={0.08}>
            <p className="tifinagh mt-5 text-2xl text-bronze sm:text-3xl">
              {site.nameAmazigh}
            </p>
          </Reveal>

          <Reveal delay={0.12}>
            <h1 className="wordmark mt-2 text-4xl uppercase text-ink sm:text-5xl lg:text-6xl dark:text-cream">
              {t("hero.wordmark")}
            </h1>
          </Reveal>

          <Reveal delay={0.16}>
            <p className="script-tagline mt-3 text-2xl text-terracotta sm:text-3xl">
              {t("hero.script")}
            </p>
          </Reveal>

          <Reveal delay={0.2}>
            <div className="mt-6 max-w-md">
              <NeedleThread className="h-6 text-bronze/70" />
              <p className="mt-4 font-serif text-lg leading-relaxed text-ink-soft sm:text-xl dark:text-cream/80">
                {t("hero.about")}
              </p>
              <p className="mt-3 font-serif text-base italic text-terracotta/90" dir="rtl">
                {site.arabicWelcome}
              </p>
            </div>
          </Reveal>

          <Reveal delay={0.26}>
            <div className="mt-9 flex flex-wrap items-center gap-3">
              <Button
                asChild
                className="h-12 rounded-full bg-ink px-7 font-label text-[0.74rem] uppercase tracking-[0.2em] text-cream hover:bg-ink/90 dark:bg-cream dark:text-ink dark:hover:bg-cream/90"
              >
                <a href="#collection">{t("cta.seeCollection")}</a>
              </Button>
              <Button
                asChild
                variant="outline"
                className="h-12 rounded-full border-bronze/50 bg-transparent px-7 font-label text-[0.74rem] uppercase tracking-[0.2em] text-ink hover:border-terracotta hover:bg-bronze/10 hover:text-terracotta dark:text-cream"
              >
                <a href={whatsappCatalog} target="_blank" rel="noopener noreferrer">
                  <WhatsAppIcon className="size-4 text-terracotta" />
                  {t("cta.viewCatalog")}
                </a>
              </Button>
            </div>
          </Reveal>

          <Reveal delay={0.34}>
            <p className="mt-8 font-label text-[0.7rem] uppercase tracking-[0.3em] text-bronze">
              {t("hero.signature")}
            </p>
          </Reveal>
        </div>

        {/* Right — framed hero image */}
        <div className="order-1 lg:order-2">
          <Reveal delay={0.1} y={28}>
            <figure className="vintage-frame relative aspect-[4/5] overflow-hidden rounded-sm sm:aspect-[5/5] lg:aspect-[4/5]">
              <img
                src="/images/maison-titrit/hero-atelier.png"
                alt={t("hero.imageCaption")}
                className="h-full w-full object-cover"
                loading="eager"
              />
              <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-ink/30 via-transparent to-transparent" />
              <figcaption className="absolute inset-x-4 bottom-4 flex items-center gap-3">
                <span className="inline-flex size-10 shrink-0 items-center justify-center rounded-full bg-cream/85 backdrop-blur dark:bg-ink/70">
                  <img
                    src="/assets/titrit-logo-gold.svg"
                    alt=""
                    aria-hidden="true"
                    className="titrit-logo-mark h-7 w-7"
                    draggable={false}
                  />
                </span>
                <div className="rounded-sm bg-cream/85 px-3 py-2 backdrop-blur dark:bg-ink/70">
                  <p className="wordmark text-sm uppercase text-ink dark:text-cream">
                    {t("hero.imageCaption")}
                  </p>
                  <p className="font-label text-[0.6rem] uppercase tracking-[0.25em] text-bronze">
                    {t("hero.imageSub")}
                  </p>
                </div>
              </figcaption>
            </figure>
          </Reveal>
        </div>
      </div>

      <OrnamentDivider className="pb-10" width={320} />

      <a
        href="#maison"
        className="mx-auto flex w-fit flex-col items-center gap-1 pb-10 text-bronze/70 transition-colors hover:text-terracotta"
        aria-label={t("hero.scroll")}
      >
        <span className="font-label text-[0.62rem] uppercase tracking-[0.3em]">
          {t("hero.scroll")}
        </span>
        <ArrowDown className="size-4 animate-bounce" />
      </a>
    </section>
  );
}
