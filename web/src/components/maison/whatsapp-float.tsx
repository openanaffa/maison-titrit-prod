"use client";

import * as React from "react";
import { site } from "@/config/site";
import { whatsappContactLink } from "@/lib/brand";
import { WhatsAppIcon } from "@/components/maison/motifs";
import { useT } from "@/i18n/locale-provider";

export function WhatsAppFloat() {
  const { t } = useT();
  const [visible, setVisible] = React.useState(false);

  React.useEffect(() => {
    const onScroll = () => setVisible(window.scrollY > 600);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <a
      href={whatsappContactLink(t("float.msg"))}
      target="_blank"
      rel="noopener noreferrer"
      aria-label={t("float.aria")}
      className={`group fixed bottom-5 end-5 z-50 inline-flex items-center gap-3 rounded-full bg-[#1f7a4d] py-3 ps-3 pe-4 text-cream shadow-[0_14px_30px_-10px_rgba(31,122,77,0.6)] transition-all duration-500 hover:bg-[#1a8f57] sm:bottom-7 sm:end-7 ${
        visible
          ? "translate-y-0 opacity-100"
          : "pointer-events-none translate-y-6 opacity-0"
      }`}
    >
      <span className="relative inline-flex size-9 items-center justify-center rounded-full bg-cream/15">
        <span className="absolute inset-0 animate-ping rounded-full bg-cream/30 group-hover:opacity-0" />
        <WhatsAppIcon className="relative size-5" />
      </span>
      <span className="hidden font-label text-[0.72rem] uppercase tracking-[0.18em] sm:inline">
        {t("float.label")}
      </span>
    </a>
  );
}
