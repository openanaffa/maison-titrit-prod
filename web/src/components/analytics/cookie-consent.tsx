"use client";

import * as React from "react";
import { usePathname } from "next/navigation";
import { Cookie, X, Check, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useT } from "@/i18n/locale-provider";
import {
  DEFAULT_CONSENT,
  getConsent,
  loadConsent,
  setConsent,
  subscribe,
} from "@/lib/analytics";

/** Floating button to reopen cookie preferences after dismissal. */
export function CookiePreferencesButton() {
  const { t } = useT();
  const pathname = usePathname();
  const [show, setShow] = React.useState(false);
  React.useEffect(() => {
    const update = () => {
      const c = getConsent();
      setShow(c.decided);
    };
    update();
    return subscribe(update);
  }, []);
  React.useEffect(() => {
    loadConsent();
  }, []);
  // Never show on auth pages (don't interfere with login/signup)
  if (!show || pathname?.startsWith("/auth")) return null;
  return (
    <button
      type="button"
      onClick={() => {
        // clear decided so the banner re-shows
        setConsent({ ...getConsent(), decided: false });
      }}
      className="fixed bottom-4 left-4 z-40 inline-flex items-center gap-2 rounded-full border border-bronze/40 bg-card/90 px-3 py-2 font-label text-[0.62rem] uppercase tracking-[0.18em] text-ink backdrop-blur transition-colors hover:bg-bronze/10 dark:text-cream"
      aria-label={t("cookie.reopen")}
    >
      <Cookie className="size-3.5 text-bronze" />
      <span className="hidden sm:inline">{t("cookie.reopen")}</span>
    </button>
  );
}

export function CookieConsent() {
  const { t } = useT();
  const pathname = usePathname();
  const [state, setState] = React.useState<null | typeof DEFAULT_CONSENT>(null);
  const [customizing, setCustomizing] = React.useState(false);

  React.useEffect(() => {
    loadConsent();
    setState(getConsent());
  }, []);
  React.useEffect(() => subscribe(setState), []);

  if (!state) return null;
  if (state.decided) return null; // already chose → hidden (re-open via button)
  // Never show on auth pages (don't block login/signup)
  if (pathname?.startsWith("/auth")) return null;

  const accept = () => setConsent({ ...getConsent(), analytics: true, marketing: true, decided: true });
  const reject = () => setConsent({ ...getConsent(), analytics: false, marketing: false, decided: true });
  const save = () => setConsent({ ...getConsent(), decided: true });

  const bannerCls =
    "fixed inset-x-0 bottom-0 z-[60] mx-auto max-w-3xl px-4 pb-4 sm:pb-6";

  return (
    <div className={bannerCls} role="dialog" aria-modal="false" aria-label={t("cookie.aria")}>
      <div className="vintage-frame rounded-sm bg-card/95 p-5 shadow-[0_-12px_40px_-20px_rgba(28,26,23,0.4)] backdrop-blur sm:p-6">
        <div className="flex items-start gap-3">
          <span className="mt-0.5 inline-flex size-9 shrink-0 items-center justify-center rounded-full bg-bronze/15 text-bronze">
            <ShieldCheck className="size-4" />
          </span>
          <div className="min-w-0 flex-1">
            <h2 className="font-display text-lg font-semibold text-ink dark:text-cream">
              {t("cookie.title")}
            </h2>
            <p className="mt-1 font-serif text-sm leading-relaxed text-ink-soft dark:text-cream/75">
              {t("cookie.body")}
            </p>
          </div>
        </div>

        {customizing && (
          <div className="mt-4 space-y-3 border-t border-bronze/25 pt-4">
            <ConsentToggle
              label={t("cookie.necessary")}
              desc={t("cookie.necessaryDesc")}
              checked
              disabled
            />
            <ConsentToggle
              label={t("cookie.analytics")}
              desc={t("cookie.analyticsDesc")}
              checked={getConsent().analytics}
              onChange={(v) => setConsent({ ...getConsent(), analytics: v })}
            />
            <ConsentToggle
              label={t("cookie.marketing")}
              desc={t("cookie.marketingDesc")}
              checked={getConsent().marketing}
              onChange={(v) => setConsent({ ...getConsent(), marketing: v })}
            />
          </div>
        )}

        <div className="mt-5 flex flex-wrap items-center justify-end gap-2">
          <Button
            variant="ghost"
            onClick={() => setCustomizing((c) => !c)}
            className="h-9 rounded-full font-label text-[0.66rem] uppercase tracking-[0.16em] text-ink-soft hover:bg-bronze/10 dark:text-cream/80"
          >
            {t("cookie.customize")}
          </Button>
          <Button
            variant="outline"
            onClick={reject}
            className="h-9 rounded-full border-bronze/50 font-label text-[0.66rem] uppercase tracking-[0.16em] text-ink hover:bg-bronze/10 dark:text-cream"
          >
            {t("cookie.reject")}
          </Button>
          {customizing ? (
            <Button
              onClick={save}
              className="h-9 rounded-full bg-ink font-label text-[0.66rem] uppercase tracking-[0.16em] text-cream hover:bg-ink/90 dark:bg-cream dark:text-ink"
            >
              <Check className="size-3.5" />
              {t("cookie.save")}
            </Button>
          ) : (
            <Button
              onClick={accept}
              className="h-9 rounded-full bg-ink font-label text-[0.66rem] uppercase tracking-[0.16em] text-cream hover:bg-ink/90 dark:bg-cream dark:text-ink"
            >
              {t("cookie.accept")}
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}

function ConsentToggle({
  label,
  desc,
  checked,
  disabled,
  onChange,
}: {
  label: string;
  desc: string;
  checked: boolean;
  disabled?: boolean;
  onChange?: (v: boolean) => void;
}) {
  return (
    <label
      className={`flex items-start gap-3 rounded-sm border border-bronze/25 p-3 ${
        disabled ? "opacity-60" : "cursor-pointer hover:bg-bronze/5"
      }`}
    >
      <input
        type="checkbox"
        checked={checked}
        disabled={disabled}
        onChange={(e) => onChange?.(e.target.checked)}
        className="mt-0.5 size-4 accent-terracotta"
        aria-label={label}
      />
      <span className="min-w-0">
        <span className="block font-label text-[0.66rem] uppercase tracking-[0.16em] text-ink dark:text-cream">
          {label}
        </span>
        <span className="mt-0.5 block font-serif text-xs leading-relaxed text-ink-soft dark:text-cream/70">
          {desc}
        </span>
      </span>
    </label>
  );
}
