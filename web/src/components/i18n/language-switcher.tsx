"use client";

import * as React from "react";
import { Check, Globe } from "lucide-react";
import { useT, LOCALES, type Locale } from "@/i18n/locale-provider";

/**
 * Language switcher — FR / AR / EN (with Tifinagh flourish on AR).
 * Single-route client-side switching; persists choice; flips RTL for Arabic.
 */
export function LanguageSwitcher({
  compact = false,
  darkSurface = false,
}: {
  compact?: boolean;
  darkSurface?: boolean;
}) {
  const { locale, setLocale, t } = useT();
  const [open, setOpen] = React.useState(false);
  const ref = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    const onDoc = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("mousedown", onDoc);
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("mousedown", onDoc);
      document.removeEventListener("keydown", onKeyDown);
    };
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
        className={`inline-flex h-11 items-center gap-1.5 rounded-full border px-3 font-label text-[0.66rem] uppercase tracking-[0.16em] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-bronze-light ${
          darkSurface
            ? "border-cream/35 text-cream hover:bg-cream/10"
            : "border-bronze/40 text-ink hover:bg-bronze/10 dark:text-cream"
        }`}
      >
        <Globe
          className={`size-3.5 ${darkSurface ? "text-bronze-light" : "text-bronze"}`}
        />
        <span>{current.short}</span>
      </button>

      {open && (
        <div
          role="menu"
          className={`absolute end-0 mt-2 w-44 overflow-hidden rounded-sm border border-bronze/40 shadow-[0_14px_30px_-12px_rgba(28,26,23,0.45)] ${
            darkSurface ? "bg-ink text-cream" : "bg-card"
          }`}
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
                className={`flex w-full min-h-11 items-center justify-between gap-2 px-3 text-start transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-inset focus-visible:ring-bronze-light ${
                  active
                    ? darkSurface
                      ? "bg-bronze/25 text-cream"
                      : "bg-bronze/15 text-terracotta"
                    : darkSurface
                      ? "text-cream hover:bg-cream/10"
                      : "text-ink hover:bg-bronze/10 dark:text-cream"
                }`}
              >
                <span className="flex items-center gap-2">
                  <span
                    className={`font-label text-[0.6rem] tracking-[0.14em] ${
                      darkSurface ? "text-bronze-light" : "text-bronze"
                    }`}
                  >
                    {l.short}
                  </span>
                  <span className="font-serif text-sm">{l.label}</span>
                </span>
                {active && (
                  <Check
                    className={`size-4 ${darkSurface ? "text-bronze-light" : "text-terracotta"}`}
                  />
                )}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
