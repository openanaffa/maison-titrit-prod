"use client";

import * as React from "react";
import { Check, Globe } from "lucide-react";
import { useT, LOCALES, type Locale } from "@/i18n/locale-provider";

/**
 * Language switcher — FR / AR / EN (with Tifinagh flourish on AR).
 * Single-route client-side switching; persists choice; flips RTL for Arabic.
 */
export function LanguageSwitcher({ compact = false }: { compact?: boolean }) {
  const { locale, setLocale, t } = useT();
  const [open, setOpen] = React.useState(false);
  const ref = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    const onDoc = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", onDoc);
    return () => document.removeEventListener("mousedown", onDoc);
  }, []);

  const current = LOCALES.find((l) => l.code === locale) ?? LOCALES[0];

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-label={t("lang.aria")}
        aria-haspopup="menu"
        aria-expanded={open}
        className="inline-flex h-9 items-center gap-1.5 rounded-full border border-bronze/40 px-3 font-label text-[0.66rem] uppercase tracking-[0.16em] text-ink transition-colors hover:bg-bronze/10 dark:text-cream"
      >
        <Globe className="size-3.5 text-bronze" />
        <span>{current.short}</span>
      </button>

      {open && (
        <div
          role="menu"
          className="absolute end-0 mt-2 w-44 overflow-hidden rounded-sm border border-bronze/40 bg-card shadow-[0_14px_30px_-12px_rgba(28,26,23,0.45)]"
        >
          {LOCALES.map((l) => {
            const active = l.code === locale;
            return (
              <button
                key={l.code}
                role="menuitemradio"
                aria-checked={active}
                onClick={() => {
                  setLocale(l.code as Locale);
                  setOpen(false);
                }}
                className={`flex w-full items-center justify-between gap-2 px-3 py-2.5 text-start transition-colors ${
                  active
                    ? "bg-bronze/15 text-terracotta"
                    : "text-ink hover:bg-bronze/10 dark:text-cream"
                }`}
              >
                <span className="flex items-center gap-2">
                  <span className="font-label text-[0.6rem] tracking-[0.14em] text-bronze">
                    {l.short}
                  </span>
                  <span className="font-serif text-sm">{l.label}</span>
                </span>
                {active && <Check className="size-4 text-terracotta" />}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
