"use client";

import * as React from "react";
import {
  DEFAULT_LOCALE,
  dictionaries,
  interpolate,
  LOCALES,
  type Locale,
} from "@/i18n/dictionaries";

const STORAGE_KEY = "titrit-locale";

type Ctx = {
  locale: Locale;
  setLocale: (l: Locale) => void;
  t: (key: string, vars?: Record<string, string | number>) => string;
  dir: "ltr" | "rtl";
};

const LocaleContext = React.createContext<Ctx | null>(null);

function resolveInitial(): Locale {
  if (typeof window === "undefined") return DEFAULT_LOCALE;
  try {
    const saved = window.localStorage.getItem(STORAGE_KEY) as Locale | null;
    if (saved && dictionaries[saved]) return saved;
  } catch {
    /* ignore */
  }
  return DEFAULT_LOCALE;
}

export function LocaleProvider({ children }: { children: React.ReactNode }) {
  const [locale, setLocaleState] = React.useState<Locale>(DEFAULT_LOCALE);
  const [hydrated, setHydrated] = React.useState(false);

  // hydrate from localStorage on mount (avoids SSR mismatch)
  React.useEffect(() => {
    setLocaleState(resolveInitial());
    setHydrated(true);
  }, []);

  // reflect locale on <html lang/dir>
  React.useEffect(() => {
    if (!hydrated) return;
    const dir = LOCALES.find((l) => l.code === locale)?.dir ?? "ltr";
    const html = document.documentElement;
    html.lang = locale;
    html.dir = dir;
    try {
      window.localStorage.setItem(STORAGE_KEY, locale);
    } catch {
      /* ignore */
    }
  }, [locale, hydrated]);

  const setLocale = React.useCallback((l: Locale) => setLocaleState(l), []);

  const t = React.useCallback(
    (key: string, vars?: Record<string, string | number>) => {
      const dict = dictionaries[locale] ?? dictionaries[DEFAULT_LOCALE];
      const val = dict[key] ?? dictionaries[DEFAULT_LOCALE][key] ?? key;
      return interpolate(val, vars);
    },
    [locale],
  );

  const dir = LOCALES.find((l) => l.code === locale)?.dir ?? "ltr";

  const value = React.useMemo(
    () => ({ locale, setLocale, t, dir }),
    [locale, setLocale, t, dir],
  );

  return <LocaleContext.Provider value={value}>{children}</LocaleContext.Provider>;
}

export function useT(): Ctx {
  const ctx = React.useContext(LocaleContext);
  if (!ctx) {
    throw new Error("useT must be used within <LocaleProvider>");
  }
  return ctx;
}

export { LOCALES };
export type { Locale };
