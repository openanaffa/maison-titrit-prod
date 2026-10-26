"use client";

import { Clock, MapPin, ExternalLink, Navigation } from "lucide-react";
import { site } from "@/config/site";
import {
  googleMapsDirectionsUrl,
  googleMapsEmbedUrl,
  googleMapsLink,
  osmEmbedUrl,
  osmLink,
} from "@/lib/brand";
import { AmazighStar, OrnamentDivider, Reveal } from "@/components/maison/motifs";
import { useT } from "@/i18n/locale-provider";

export function MapSection() {
  const { t } = useT();
  const addr = site.address;
  return (
    <section id="nous-trouver" className="relative scroll-mt-20 py-20 sm:py-28">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <Reveal className="text-center">
          <p className="eyebrow">{t("map.eyebrow")}</p>
          <h2 className="mt-4 font-display text-4xl font-semibold text-ink sm:text-5xl dark:text-cream">
            {t("map.title")}
          </h2>
          <OrnamentDivider className="mt-6" width={220} />
        </Reveal>

        <div className="mt-12 grid gap-8 lg:grid-cols-[1fr_1.3fr] lg:gap-10">
          {/* Address + hours card */}
          <Reveal>
            <div className="vintage-frame h-full rounded-sm p-7 sm:p-8">
              <div className="flex items-start gap-3">
                <span className="mt-1 inline-flex size-9 shrink-0 items-center justify-center rounded-full bg-bronze/15 text-terracotta">
                  <MapPin className="size-4" />
                </span>
                <div>
                  <h3 className="font-display text-2xl font-semibold text-ink dark:text-cream">
                    {site.name}
                  </h3>
                  <p className="font-label text-[0.66rem] uppercase tracking-[0.24em] text-bronze">
                    {t("map.brandSub")}
                  </p>
                </div>
              </div>

              <address className="mt-5 not-italic font-serif text-base leading-relaxed text-ink-soft dark:text-cream/80">
                {addr.line1}
                <br />
                {addr.line2}
                <br />
                {addr.line3}
                <br />
                {addr.city}, {addr.country}
              </address>

              <div className="mt-6 border-t border-bronze/25 pt-5">
                <p className="flex items-center gap-2 font-label text-[0.66rem] uppercase tracking-[0.22em] text-bronze">
                  <Clock className="size-3.5" />
                  {t("map.hours")}
                </p>
                <ul className="mt-3 space-y-2">
                  {site.hours.map((h) => (
                    <li
                      key={h.dayKey}
                      className="flex items-center justify-between font-serif text-[0.95rem] text-ink-soft dark:text-cream/80"
                    >
                      <span>{t(h.dayKey)}</span>
                      <span
                        className={
                          h.time === "Fermé"
                            ? "text-terracotta"
                            : "text-ink dark:text-cream"
                        }
                      >
                        {h.time === "Fermé" ? t("map.closed") : h.time}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="mt-6 space-y-2">
                <a
                  href={googleMapsDirectionsUrl()}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex w-full items-center justify-center gap-2 rounded-full bg-ink px-5 py-3 font-label text-[0.72rem] uppercase tracking-[0.18em] text-cream transition-colors hover:bg-terracotta dark:bg-cream dark:text-ink dark:hover:bg-terracotta dark:hover:text-cream"
                >
                  <Navigation className="size-4" />
                  {t("cta.openMap")}
                </a>
                <a
                  href={googleMapsLink()}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex w-full items-center justify-center gap-2 rounded-full border border-bronze/50 px-5 py-3 font-label text-[0.72rem] uppercase tracking-[0.18em] text-ink transition-colors hover:border-terracotta hover:bg-bronze/10 hover:text-terracotta dark:text-cream"
                >
                  <ExternalLink className="size-4" />
                  {t("cta.openMap")}
                </a>
              </div>
            </div>
          </Reveal>

          {/* Google Maps iframe */}
          <Reveal delay={0.12} y={24}>
            <div className="vintage-frame relative h-full min-h-[360px] overflow-hidden rounded-sm">
              <iframe
                title="Google Maps — Maison Titrit, Bouskoura"
                src={googleMapsEmbedUrl()}
                className="h-full min-h-[360px] w-full border-0 grayscale-[0.15] sepia-[0.12]"
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                allowFullScreen
              />
              {/* OpenStreetMap fallback link (open-source alternative) */}
              <a
                href={osmLink()}
                target="_blank"
                rel="noopener noreferrer"
                className="absolute bottom-2 end-2 inline-flex items-center gap-1.5 rounded-full bg-card/85 px-3 py-1.5 font-label text-[0.56rem] uppercase tracking-[0.16em] text-bronze backdrop-blur transition-colors hover:text-terracotta"
              >
                <AmazighStar className="size-3" strokeWidth={1.6} />
                {t("map.openSource")}
              </a>
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  );
}
