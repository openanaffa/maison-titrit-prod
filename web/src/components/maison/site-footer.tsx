"use client";

import { site } from "@/config/site";
import { whatsappCatalog } from "@/lib/brand";
import { useT } from "@/i18n/locale-provider";
import {
  AmazighStar,
  NeedleThread,
  WhatsAppIcon,
} from "@/components/maison/motifs";
import { SocialIcons } from "@/components/maison/social-icons";

export function SiteFooter() {
  const { t } = useT();
  const year = new Date().getFullYear();

  return (
    <footer className="mt-auto border-t border-bronze/30 bg-ink text-cream dark:border-bronze/20">
      <div className="mx-auto max-w-6xl px-4 py-14 sm:px-6 lg:px-8">
        <div className="grid gap-10 md:grid-cols-[1.5fr_1fr_1fr]">
          {/* Brand */}
          <div>
            <div className="flex items-center gap-3">
              <img
                src="/assets/titrit-logo-mono.svg"
                alt=""
                aria-hidden="true"
                className="h-11 w-11 shrink-0 select-none"
                style={{
                  filter:
                    "invert(1) sepia(0.18) saturate(1.5) hue-rotate(-12deg) brightness(1.1)",
                }}
                draggable={false}
              />
              <div>
                <p className="wordmark text-xl uppercase text-cream">{site.name}</p>
                <p className="tifinagh text-[0.7rem] text-bronze-light">
                  {site.nameAmazigh}
                </p>
              </div>
            </div>
            <p className="script-tagline mt-4 text-2xl text-bronze-light">
              {t("footer.tagline")}
            </p>
            <p className="mt-4 max-w-sm font-serif text-sm leading-relaxed text-cream/75">
              {t("footer.about")}
            </p>
            <p className="mt-3 font-serif text-base text-bronze-light" dir="rtl">
              {site.arabicWelcome}
            </p>
            <NeedleThread className="mt-5 h-5 text-bronze-light/70" />
            <p className="mt-4 font-label text-[0.66rem] uppercase tracking-[0.28em] text-bronze-light">
              {site.signature}
            </p>
          </div>

          {/* Nav */}
          <div>
            <p className="font-label text-[0.66rem] uppercase tracking-[0.24em] text-bronze-light">
              {t("footer.nav")}
            </p>
            <ul className="mt-4 space-y-2.5">
              {site.nav.map((n) => (
                <li key={n.href}>
                  <a
                    href={n.href}
                    className="font-serif text-sm text-cream/80 transition-colors hover:text-terracotta"
                  >
                    {t(n.labelKey)}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact + socials */}
          <div>
            <p className="font-label text-[0.66rem] uppercase tracking-[0.24em] text-bronze-light">
              {t("footer.contact")}
            </p>
            <ul className="mt-4 space-y-2.5 font-serif text-sm text-cream/80">
              <li>
                <a
                  href={`tel:${site.phones[0].e164}`}
                  className="hover:text-terracotta"
                >
                  {site.phones[0].display}
                </a>
              </li>
              <li>
                <a
                  href={`mailto:${site.email}`}
                  className="break-all hover:text-terracotta"
                >
                  {site.email}
                </a>
              </li>
              <li>
                <a
                  href={whatsappCatalog}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 hover:text-terracotta"
                >
                  <WhatsAppIcon className="size-3.5" />
                  {t("cta.viewCatalog")}
                </a>
              </li>
            </ul>
            <div className="mt-5">
              <SocialIcons size={36} variant="solid" />
            </div>
          </div>
        </div>

        <div className="mt-12 flex flex-col items-center justify-between gap-4 border-t border-cream/15 pt-6 sm:flex-row">
          <p className="font-serif text-xs text-cream/60">
            {t("footer.rights", { year })}
          </p>
          <div className="flex items-center gap-2 text-bronze-light/80">
            <AmazighStar className="size-4" strokeWidth={1.6} />
            <span className="font-label text-[0.6rem] uppercase tracking-[0.24em]">
              {t("footer.made")}
            </span>
            <AmazighStar className="size-4" strokeWidth={1.6} />
          </div>
        </div>
      </div>
    </footer>
  );
}
