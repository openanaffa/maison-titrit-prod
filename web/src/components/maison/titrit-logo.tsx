"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import { site } from "@/config/site";
import { useT } from "@/i18n/locale-provider";

/**
 * Titrit logo lockup — uses the supplied traced vector logo (gold by default,
 * monochrome in dark mode via CSS) plus the Cinzel wordmark and the Tifinagh
 * accent. The wordmark text is translated via i18n (hero.wordmark).
 */
export function TitritLogo({
  className,
  showWordmark = true,
  logoClassName,
  wordmarkClassName,
  variant = "auto",
}: {
  className?: string;
  showWordmark?: boolean;
  logoClassName?: string;
  wordmarkClassName?: string;
  variant?: "auto" | "gold" | "mono";
}) {
  const { t } = useT();
  return (
    <span className={cn("inline-flex items-center gap-3", className)}>
      <img
        src="/assets/titrit-logo-gold.svg"
        alt=""
        aria-hidden="true"
        className={cn(
          "titrit-logo-mark h-9 w-9 shrink-0 select-none sm:h-11 sm:w-11",
          variant === "mono" && "titrit-logo-mark--mono",
          logoClassName,
        )}
        draggable={false}
      />
      {showWordmark && (
        <span className="flex flex-col leading-none">
          <span
            className={cn(
              "wordmark text-[0.95rem] uppercase text-ink sm:text-[1.05rem] dark:text-cream",
              wordmarkClassName,
            )}
          >
            {t("hero.wordmark")}
          </span>
          <span className="tifinagh mt-1 text-[0.6rem] text-bronze sm:text-[0.66rem]">
            {site.nameAmazigh}
          </span>
        </span>
      )}
    </span>
  );
}

