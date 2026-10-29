"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

/* ------------------------------------------------------------------ */
/*  Amazigh eight-pointed star (two overlapping squares — Khatam)      */
/* ------------------------------------------------------------------ */
export function AmazighStar({
  className,
  strokeWidth = 1.5,
}: {
  className?: string;
  strokeWidth?: number;
}) {
  return (
    <svg
      viewBox="0 0 100 100"
      className={className}
      fill="none"
      aria-hidden="true"
    >
      <rect
        x="20"
        y="20"
        width="60"
        height="60"
        stroke="currentColor"
        strokeWidth={strokeWidth}
        transform="rotate(0 50 50)"
      />
      <rect
        x="20"
        y="20"
        width="60"
        height="60"
        stroke="currentColor"
        strokeWidth={strokeWidth}
        transform="rotate(45 50 50)"
      />
      <circle cx="50" cy="50" r="6" fill="currentColor" />
    </svg>
  );
}

/* ------------------------------------------------------------------ */
/*  Ornamental divider — hairline with the X/bow flourish              */
/* ------------------------------------------------------------------ */
export function OrnamentDivider({
  className,
  width = 240,
}: {
  className?: string;
  width?: number;
}) {
  return (
    <div
      className={cn("flex items-center justify-center gap-3 text-bronze", className)}
      aria-hidden="true"
    >
      <span
        className="hairline block"
        style={{ width: width / 2, maxWidth: "40vw" }}
      />
      <svg width="26" height="26" viewBox="0 0 26 26" fill="none">
        <path
          d="M13 2c2.5 4 6 7.5 11 11-5 3.5-8.5 7-11 11-2.5-4-6-7.5-11-11 5-3.5 8.5-7 11-11Z"
          stroke="currentColor"
          strokeWidth="1.2"
          strokeLinejoin="round"
        />
        <path d="M8 13h10M13 8v10" stroke="currentColor" strokeWidth="1.2" />
      </svg>
      <span
        className="hairline block"
        style={{ width: width / 2, maxWidth: "40vw" }}
      />
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Needle & thread flourish (business-card motif)                     */
/* ------------------------------------------------------------------ */
export function NeedleThread({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 320 60"
      className={className}
      fill="none"
      aria-hidden="true"
    >
      <path
        d="M4 40c40-2 70-22 120-22 30 0 44 16 70 16 30 0 50-14 80-14 18 0 30 8 42 8"
        stroke="currentColor"
        strokeWidth="1.2"
        strokeLinecap="round"
      />
      <path
        d="M300 28c6-4 12-4 16 0"
        stroke="currentColor"
        strokeWidth="1.2"
        strokeLinecap="round"
      />
      <circle cx="306" cy="30" r="3" stroke="currentColor" strokeWidth="1.2" />
      <path d="M2 40l6 -3 0 6Z" fill="currentColor" />
    </svg>
  );
}

/* ------------------------------------------------------------------ */
/*  Monogram medallion — "T" in a vintage double-frame badge           */
/* ------------------------------------------------------------------ */
export function Monogram({ className }: { className?: string }) {
  return (
    <span
      className={cn(
        "relative inline-flex items-center justify-center rounded-full",
        className,
      )}
      aria-label="Maison Titrit"
    >
      <span className="absolute inset-0 rounded-full border border-bronze/60" />
      <span className="absolute inset-[3px] rounded-full border border-bronze/30" />
      <span
        className="font-display relative z-10 leading-none"
        style={{ fontStyle: "italic", fontWeight: 600 }}
      >
        T
      </span>
      <AmazighStar className="absolute -right-1 -top-1 size-3.5 text-terracotta" strokeWidth={1.4} />
    </span>
  );
}

/* ------------------------------------------------------------------ */
/*  WhatsApp brand glyph                                              */
/* ------------------------------------------------------------------ */
export function WhatsAppIcon({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      className={className}
      fill="currentColor"
      aria-hidden="true"
    >
      <path d="M.057 24l1.687-6.163a11.867 11.867 0 01-1.587-5.946C.16 5.335 5.495 0 12.05 0a11.82 11.82 0 018.413 3.488 11.82 11.82 0 013.48 8.414c-.003 6.557-5.338 11.892-11.893 11.892a11.9 11.9 0 01-5.688-1.448L.057 24zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884a9.86 9.86 0 001.51 5.26l-.999 3.648 3.978-1.607zm11.387-5.464c-.074-.124-.272-.198-.57-.347-.297-.149-1.758-.868-2.031-.967-.272-.099-.47-.149-.669.149-.198.297-.768.967-.941 1.165-.173.198-.347.223-.644.074-.297-.149-1.255-.462-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.297-.347.446-.521.151-.172.2-.296.3-.495.099-.198.05-.372-.025-.521-.075-.148-.669-1.611-.916-2.206-.242-.579-.487-.501-.669-.51l-.57-.01c-.198 0-.52.074-.792.372s-1.04 1.016-1.04 2.479 1.065 2.876 1.213 3.074c.149.198 2.096 3.2 5.077 4.487.71.306 1.263.489 1.694.626.712.226 1.36.194 1.872.118.571-.085 1.758-.719 2.006-1.413.248-.695.248-1.29.173-1.414z" />
    </svg>
  );
}

/* ------------------------------------------------------------------ */
/*  Reveal — scroll-triggered entrance (CSS-only, no framer-motion)     */
/*  Uses IntersectionObserver to toggle .is-visible; reduced-motion     */
/*  renders immediately with no animation. Removes framer-motion from   */
/*  the shared chunk (~1.6s main-thread savings on production).         */
/* ------------------------------------------------------------------ */
export function Reveal({
  children,
  delay = 0,
  y = 18,
  className,
  once = true,
}: {
  children?: React.ReactNode;
  delay?: number;
  y?: number;
  className?: string;
  once?: boolean;
}) {
  const [isVisible, setIsVisible] = React.useState(false);
  const ref = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    if (!ref.current) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          if (once) observer.disconnect();
        }
      },
      { threshold: 0.1, rootMargin: "0px 0px -80px 0px" }
    );
    observer.observe(ref.current);
    return () => observer.disconnect();
  }, [once]);

  const reduce =
    typeof matchMedia !== "undefined" &&
    matchMedia("(prefers-reduced-motion: reduce)").matches;

  const revealStyle: any = {
    "--reveal-y": `${y}px`,
    "--reveal-delay": `${delay}s`,
    ...(reduce ? { opacity: 1, transform: "none" } : {}),
  };

  return (
    <div
      ref={ref}
      className={cn(
        "reveal",
        (isVisible || reduce) && "is-visible",
        className
      )}
      style={revealStyle}
    >
      {children}
    </div>
  );
}
