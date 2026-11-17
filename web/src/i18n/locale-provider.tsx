"use client";

import { useRouter } from "next/navigation";
import * as React from "react";
import {
  DEFAULT_LOCALE,
  dictionaries,
  interpolate,
  LOCALES,
  type Locale,
} from "@/i18n/dictionaries";
import { readLocaleCookie, writeLocaleCookie } from "@/i18n/locale-cookie";

export const STORAGE_KEY = `titrit-locale`;

export type Ctx = {
  locale: Locale;
  setLocale: (l: Locale) => void;
  t: (key: string, vars?: Record<string, string | number>) => string;
  dir: "ltr" | "rtl";
};

export const LocaleContext = React.createContext<Ctx | null>(null);

/** The visitor's explicit choice, kept in localStorage. */
export function readStoredLocale(): Locale | null {
  if (typeof window === "undefined") return null;
  try {
    const saved = window.localStorage.getItem(STORAGE_KEY) as Locale | null;
    return saved && dictionaries[saved] ? saved : null;
  } catch {
    return null;
  }
}

/** The locale the server rendered with (cookie first, default locale otherwise). */
function readServerLocale(): Locale | null {
  const cookie = readLocaleCookie() as Locale | null;
  return cookie && dictionaries[cookie] ? cookie : null;
}

export function LocaleProvider({ children }: { children: React.ReactNode }) {
  const [locale, setLocaleState] = React.useState<Locale>(DEFAULT_LOCALE);
  const [hydrated, setHydrated] = React.useState(false);
  const router = useRouter();

  // hydrate from localStorage (avoids SSR mismatch)
  React.useEffect(() => {
    const stored = readStoredLocale();
    const serverLocale = readServerLocale();
    setLocaleState(stored ?? serverLocale ?? DEFAULT_LOCALE);
    setHydrated(true);

    // A choice saved before the cookie existed has to reach the server,
    // otherwise server-rendered pages keep serving the previous language.
    if (stored && stored !== (serverLocale ?? DEFAULT_LOCALE)) {
      writeLocaleCookie(stored);
      router.refresh();
    }
  }, [router]);

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

export type { Locale };
export { LOCALES };
