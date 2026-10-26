"use client";

import * as React from "react";
import { useReducedMotion } from "framer-motion";
import { useT } from "@/i18n/locale-provider";

/**
 * Brand intro loader — ported from titrit-loader-demo.html.
 * Shows the gold Titrit logo, a filling meter, and the status line, then
 * fades out. Plays once per browser session (sessionStorage).
 * Fully respects prefers-reduced-motion (instant hide, no animation).
 */
const STORAGE_KEY = "titrit-intro-played";
const DURATION_MS = 3200;

export function TitritLoader() {
  const { t } = useT();
  const [visible, setVisible] = React.useState(false);
  const reduce = useReducedMotion();

  React.useEffect(() => {
    if (reduce) return;
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
          alt={t("loader.aria")}
        />
        <div className="titrit-loader__meter" aria-hidden="true" />
        <div className="titrit-loader__status">{t("loader.status")}</div>
      </div>
    </div>
  );
}
