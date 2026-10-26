"use client";

import * as React from "react";
import { Instagram, Facebook, Youtube, Mail, Phone } from "lucide-react";
import { site } from "@/config/site";
import { useT } from "@/i18n/locale-provider";
import { WhatsAppIcon } from "@/components/maison/motifs";
import { whatsappContactLink, whatsappCatalog } from "@/lib/brand";
import { cn } from "@/lib/utils";

/* TikTok + Pinterest glyphs (not in lucide-react stable set we use) */
function TikTokIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="currentColor" aria-hidden="true">
      <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64c.3 0 .59.04.86.13V9.4a6.33 6.33 0 0 0-1-.05A6.34 6.34 0 1 0 14.78 15.7V8.66a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-3.96-1.09z" />
    </svg>
  );
}
function PinterestIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="currentColor" aria-hidden="true">
      <path d="M12 2C6.48 2 2 6.48 2 12c0 4.09 2.46 7.6 5.98 9.13-.08-.78-.16-1.97.03-2.82.18-.78 1.14-4.94 1.14-4.94s-.29-.58-.29-1.44c0-1.35.78-2.36 1.76-2.36.83 0 1.23.62 1.23 1.37 0 .83-.53 2.08-.8 3.24-.23.97.49 1.76 1.44 1.76 1.73 0 3.06-1.82 3.06-4.45 0-2.32-1.67-3.95-4.06-3.95-2.77 0-4.39 2.07-4.39 4.21 0 .83.32 1.73.72 2.22.08.1.09.18.07.28-.07.31-.24.97-.27 1.11-.04.18-.14.22-.33.13-1.24-.58-2.02-2.39-2.02-3.85 0-3.13 2.28-6.01 6.56-6.01 3.45 0 6.13 2.46 6.13 5.75 0 3.43-2.17 6.2-5.18 6.2-1.01 0-1.96-.53-2.29-1.15l-.62 2.37c-.22.87-.83 1.96-1.24 2.63.93.29 1.92.44 2.95.44 5.52 0 10-4.48 10-10S17.52 2 12 2z" />
    </svg>
  );
}

export type SocialVariant = "outline" | "solid";

/**
 * Social icon row — Instagram, Pinterest, Facebook, TikTok, YouTube, WhatsApp.
 * Uses the links from src/config/site.ts. The WhatsApp icon links to the
 * business catalog (full online store).
 */
export function SocialIcons({
  size = 40,
  variant = "outline",
  className,
  onNavigate,
}: {
  size?: number;
  variant?: SocialVariant;
  className?: string;
  onNavigate?: () => void;
}) {
  const { t } = useT();
  const links = [
    { href: site.socials.instagram, label: "Instagram", Icon: Instagram },
    { href: site.socials.pinterest, label: "Pinterest", Icon: PinterestIcon },
    { href: site.socials.facebook, label: "Facebook", Icon: Facebook },
    { href: site.socials.tiktok, label: "TikTok", Icon: TikTokIcon },
    { href: site.socials.youtube, label: "YouTube", Icon: Youtube },
    { href: whatsappCatalog, label: t("cta.viewCatalog"), Icon: WhatsAppIcon },
  ];

  return (
    <ul className={cn("flex flex-wrap items-center gap-3", className)}>
      {links.map(({ href, label, Icon }) => (
        <li key={label}>
          <a
            href={href}
            target="_blank"
            rel="noopener noreferrer"
            aria-label={label}
            onClick={onNavigate}
            className={
              variant === "solid"
                ? "inline-flex items-center justify-center rounded-full bg-ink text-cream transition-transform hover:-translate-y-0.5 hover:bg-terracotta dark:bg-cream dark:text-ink"
                : "inline-flex items-center justify-center rounded-full border border-bronze/40 text-ink transition-all hover:-translate-y-0.5 hover:border-terracotta hover:bg-terracotta hover:text-cream dark:text-cream"
            }
            style={{ width: size, height: size }}
          >
            <Icon className="size-[42%]" />
          </a>
        </li>
      ))}
    </ul>
  );
}

/* Small contact icon group (phone, email) — used in the contact section. */
export function ContactIcons({ className }: { className?: string }) {
  return (
    <div className={cn("flex items-center gap-3", className)}>
      <a
        href={`tel:${site.phones[0].e164}`}
        aria-label="Phone"
        className="inline-flex size-11 items-center justify-center rounded-full border border-bronze/40 text-ink transition-all hover:-translate-y-1 hover:border-terracotta hover:bg-terracotta hover:text-cream dark:text-cream"
      >
        <Phone className="size-5" />
      </a>
      <a
        href={`mailto:${site.email}`}
        aria-label="Email"
        className="inline-flex size-11 items-center justify-center rounded-full border border-bronze/40 text-ink transition-all hover:-translate-y-1 hover:border-terracotta hover:bg-terracotta hover:text-cream dark:text-cream"
      >
        <Mail className="size-5" />
      </a>
    </div>
  );
}
