"use client";

import * as React from "react";
import { useT } from "@/i18n/locale-provider";

/**
 * Brand intro loader — ported from titrit-loader-demo.html.
 * Shows the gold Titrit logo, a filling meter, and the status line, then
 * fades out. Plays once per browser session (sessionStorage).
 * Fully respects prefers-reduced-motion: the loader never shows (or hides
 * instantly if the setting changes mid-play) — it must never trap the page.
 */
const STORAGE_KEY = "titrit-intro-played";
const DURATION_MS = 3200;

export function TitritLoader() {
  const { t } = useT();
  // Lazy-init from the real media query: users with reduced motion never
  // even mount the loader (no flash, no hydration mismatch — both renders
  // output null while `visible` is false).
  const [reduce, setReduce] = React.useState(
    () =>
      typeof window !== "undefined" &&
      !!window.matchMedia?.("(prefers-reduced-motion: reduce)").matches,
  );
  const [visible, setVisible] = React.useState(false);

  React.useEffect(() => {
    if (typeof window === "undefined" || !window.matchMedia) return;
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    const update = () => setReduce(mq.matches);
    update();
    mq.addEventListener("change", update);
    return () => mq.removeEventListener("change", update);
  }, []);

  React.useEffect(() => {
    if (reduce) {
      // Reduced motion (or a mid-play flip): hide instantly, never trap.
      setVisible(false);
      return;
    }
    let played = false;
    try {
      played = sessionStorage.getItem(STORAGE_KEY) === "1";
    } catch {
      played = false;
    }
    if (played) return;
    setVisible(true);
    const tm = window.setTimeout(() => {
      setVisible(false);
      try {
        sessionStorage.setItem(STORAGE_KEY, "1");
      } catch {
        /* ignore */
      }
    }, DURATION_MS);
    return () => window.clearTimeout(tm);
  }, [reduce]);

  React.useEffect(() => {
    if (!visible) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [visible]);

  if (!visible) return null;

  return (
    <div
      className={`titrit-loader ${visible ? "" : "is-hidden"}`}
      role="status"
      aria-label={t("loader.aria")}
      aria-live="polite"
    >
      <div className="titrit-loader__inner">
        <img
          className="titrit-loader__logo"
          src="/assets/titrit-logo-gold.svg"
          alt=""
          aria-hidden="true"
        />
        <div className="titrit-loader__meter" aria-hidden="true" />
        <div className="titrit-loader__status">{t("loader.status")}</div>
      </div>
    </div>
  );
}
