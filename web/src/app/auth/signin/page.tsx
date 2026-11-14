"use client";

import * as React from "react";
import Link from "next/link";
import { signIn } from "next-auth/react";
import { useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { AmazighStar, OrnamentDivider } from "@/components/maison/motifs";
import { GoogleIcon } from "@/components/maison/google-icon";
import { site } from "@/config/site";
import { useT } from "@/i18n/locale-provider";

/**
 * Google-only sign-in (NextAuth). One button, one path — customers and staff
 * alike; the role is resolved server-side from the DB by email (lib/auth.ts).
 */
export default function AuthPage() {
  // useSearchParams within the inner tree — the outer static shell lets this
  // page prerender during `next build` without a CSR bailout.
  return (
    <React.Suspense>
      <AuthPageInner />
    </React.Suspense>
  );
}

function AuthPageInner() {
  const params = useSearchParams();
  // Default callback depends on intent: explicit /makteb callback → staff; else /compte.
  const explicitCallback = params.get("callbackUrl");
  const callbackUrl = explicitCallback || "/compte";

  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  const { t } = useT();
  const isStaffIntent = callbackUrl.startsWith("/makteb");

  async function onGoogle() {
    setLoading(true);
    setError(null);
    try {
      await signIn("google", { callbackUrl });
      // signIn redirects on success; if it returns, the attempt failed.
      setLoading(false);
      setError(t("auth.googleError"));
    } catch {
      setLoading(false);
      setError(t("auth.googleError"));
    }
  }

  return (
    <section className="vintage-paper flex min-h-[100svh] items-start justify-center px-4 pt-10 pb-44 sm:pt-12 sm:pb-40">
      <div className="w-full max-w-md">
        <div className="vintage-frame rounded-sm bg-card/95 p-7 sm:p-9">
          <div className="text-center">
            <img
              src="/assets/titrit-logo-gold.svg"
              alt=""
              aria-hidden="true"
              className="titrit-logo-mark mx-auto h-12 w-12"
              draggable={false}
            />
            <h1 className="wordmark mt-3 text-xl uppercase text-ink dark:text-cream">
              {site.name}
            </h1>
            <p className="tifinagh mt-1 text-sm text-bronze">{site.nameAmazigh}</p>
            <OrnamentDivider className="mt-4" width={160} />
          </div>

          <p className="mt-5 text-center font-serif text-sm text-ink-soft dark:text-cream/75">
            {isStaffIntent
              ? t("auth.googleStaffHint")
              : t("auth.googleCustomerHint")}
          </p>

          {error && (
            <p
              role="alert"
              className="mt-4 rounded-sm bg-terracotta/10 p-3 text-center font-serif text-sm text-terracotta"
            >
              {error}
            </p>
          )}

          <Button
            onClick={onGoogle}
            disabled={loading}
            className="mt-6 h-12 w-full gap-3 rounded-full border border-bronze/45 bg-cream px-6 font-label text-[0.74rem] uppercase tracking-[0.16em] text-ink transition-colors hover:border-terracotta hover:text-terracotta focus-visible:ring-2 focus-visible:ring-bronze-light disabled:opacity-70 dark:bg-cream dark:text-ink"
          >
            <GoogleIcon className="size-5 shrink-0" />
            {loading ? "…" : t("auth.continueGoogle")}
          </Button>

          {/* Decorative Amazigh accent under the CTA */}
          <p className="mt-6 flex items-center justify-center gap-2 text-center font-serif text-xs text-bronze/80">
            <AmazighStar className="size-3" strokeWidth={1.6} />
            {site.nameAmazigh}
          </p>
        </div>

        <p className="mt-4 text-center font-serif text-xs text-ink-soft/70 dark:text-cream/60">
          {t("auth.termsBefore")}
          <Link
            href="/cgv"
            className="underline decoration-bronze/40 underline-offset-2 transition-colors hover:text-terracotta"
          >
            {t("auth.termsConditions")}
          </Link>
          {t("auth.termsAnd")}
          <Link
            href="/confidentialite"
            className="underline decoration-bronze/40 underline-offset-2 transition-colors hover:text-terracotta"
          >
            {t("auth.termsPrivacy")}
          </Link>
          {t("auth.termsAfter")}
        </p>
      </div>
    </section>
  );
}
