"use client";

import { Instagram, Mail, Phone, MapPin } from "lucide-react";
import { site } from "@/config/site";
import { whatsappCatalog, whatsappContactLink } from "@/lib/brand";
import {
  AmazighStar,
  OrnamentDivider,
  Reveal,
  WhatsAppIcon,
} from "@/components/maison/motifs";
import { SocialIcons } from "@/components/maison/social-icons";
import { useT } from "@/i18n/locale-provider";

export function ContactSocial() {
  const { t } = useT();
  return (
    <section
      id="contact"
      className="vintage-paper relative scroll-mt-20 overflow-hidden py-20 sm:py-28"
    >
      <AmazighStar
        className="pointer-events-none absolute -left-12 top-10 size-52 text-bronze/10"
        strokeWidth={1}
        aria-hidden="true"
      />

      <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
        <Reveal className="text-center">
          <p className="eyebrow">{t("contact.eyebrow")}</p>
          <h2 className="mt-4 font-display text-4xl font-semibold text-ink sm:text-5xl dark:text-cream">
            {t("contact.title")}
          </h2>
          <p className="mx-auto mt-5 max-w-xl font-serif text-lg leading-relaxed text-ink-soft dark:text-cream/75">
            {t("contact.subtitle")}
          </p>
          <OrnamentDivider className="mt-7" width={220} />
        </Reveal>

        {/* Social icon row */}
        <Reveal delay={0.1}>
          <div className="mt-10 flex justify-center">
            <SocialIcons size={52} />
          </div>
        </Reveal>

        {/* Contact details grid */}
        <Reveal delay={0.18}>
          <div className="mt-12 grid gap-6 sm:grid-cols-3">
            <div className="text-center">
              <p className="font-label text-[0.66rem] uppercase tracking-[0.22em] text-bronze">
                {t("contact.phone")}
              </p>
              <p className="mt-2 font-serif text-lg text-ink dark:text-cream">
                {site.phones[0].display}
              </p>
              <p className="font-serif text-sm text-ink-soft/80 dark:text-cream/60">
                {site.phones[1].display}
              </p>
            </div>
            <div className="text-center sm:border-x sm:border-bronze/25">
              <p className="font-label text-[0.66rem] uppercase tracking-[0.22em] text-bronze">
                {t("contact.email")}
              </p>
              <a
                href={`mailto:${site.email}`}
                className="mt-2 block break-all font-serif text-lg text-ink transition-colors hover:text-terracotta dark:text-cream"
              >
                {site.email}
              </a>
            </div>
            <div className="text-center">
              <p className="font-label text-[0.66rem] uppercase tracking-[0.22em] text-bronze">
                {t("contact.instagram")}
              </p>
              <a
                href={site.socials.instagram}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-2 block font-serif text-lg text-ink transition-colors hover:text-terracotta dark:text-cream"
              >
                {site.socials.instagramHandle}
              </a>
            </div>
          </div>
        </Reveal>

        <Reveal delay={0.24}>
          <div className="mt-12 flex items-center justify-center gap-3 text-ink-soft dark:text-cream/70">
            <MapPin className="size-4 text-terracotta" />
            <p className="font-serif text-base">
              {site.address.line1}, {site.address.line2}
            </p>
          </div>
        </Reveal>

        {/* WhatsApp catalog CTA */}
        <Reveal delay={0.28}>
          <div className="mt-8 flex justify-center">
            <a
              href={whatsappCatalog}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 rounded-full bg-ink px-6 py-3 font-label text-[0.72rem] uppercase tracking-[0.18em] text-cream transition-colors hover:bg-terracotta dark:bg-cream dark:text-ink dark:hover:bg-terracotta dark:hover:text-cream"
            >
              <WhatsAppIcon className="size-4" />
              {t("cta.viewCatalog")}
            </a>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
