"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

/**
 * Category ideograms / pictograms — minimalist garment silhouettes as inline SVG.
 * Each is a free, original vector glyph (no external dependency), mapped by the
 * category slug. Used on catalogue filter chips, product cards, detail page,
 * admin tables, and the categories manager.
 *
 * To add a new category: add a case here + the slug in src/config/products.ts.
 */

const ICONS: Record<string, React.FC<{ className?: string }>> = {
  robes: RobeIcon,
  tuniques: TuniqueIcon,
  ensembles: EnsembleIcon,
  abayas: AbayaIcon,
  caftans: CaftanIcon,
};

/** Resolve an icon by category slug (falls back to a generic garment). */
export function CategoryIcon({
  slug,
  category,
  className,
}: {
  slug?: string;
  category?: string;
  className?: string;
}) {
  const Icon = (slug && ICONS[slug]) || GarmentIcon;
  return <Icon className={className} />;
}

/* --- Garment silhouettes -------------------------------------------------- */

/** Robe — flowing midi dress with a defined waist. */
function RobeIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 32 32" fill="none" className={className} aria-hidden="true">
      <path
        d="M11 5h10l-1.5 3.5 3 3.5-3 14h-7l-3-14 3-3.5L11 5Z"
        stroke="currentColor"
        strokeWidth="1.4"
        strokeLinejoin="round"
      />
      <path d="M13 5l3 4 3-4" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M12.5 8.5c1.2.8 4.8.8 6 0" stroke="currentColor" strokeWidth="1.1" strokeLinecap="round" opacity="0.6" />
      <path d="M14.5 26l1.5-9 1.5 9" stroke="currentColor" strokeWidth="1.1" strokeLinecap="round" opacity="0.5" />
    </svg>
  );
}

/** Tunique — straight top with a central placket + hem. */
function TuniqueIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 32 32" fill="none" className={className} aria-hidden="true">
      <path
        d="M9 6h14l-2 4v14l2 2H7l2-2V10L9 6Z"
        stroke="currentColor"
        strokeWidth="1.4"
        strokeLinejoin="round"
      />
      <path d="M16 10v16" stroke="currentColor" strokeWidth="1.1" strokeLinecap="round" opacity="0.6" />
      <circle cx="16" cy="13" r="0.9" fill="currentColor" />
      <circle cx="16" cy="17" r="0.9" fill="currentColor" />
      <circle cx="16" cy="21" r="0.9" fill="currentColor" />
      <path d="M13 6l3 4 3-4" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

/** Ensemble — two pieces (top + wide trousers) side by side. */
function EnsembleIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 32 32" fill="none" className={className} aria-hidden="true">
      {/* top */}
      <path d="M7 5h8l-1 3v6l1 2H6l1-2V8L7 5Z" stroke="currentColor" strokeWidth="1.3" strokeLinejoin="round" />
      {/* trousers */}
      <path d="M19 17h7l-1 9h-2l-1.5-6L20 26h-2l1-9Z" stroke="currentColor" strokeWidth="1.3" strokeLinejoin="round" />
      <path d="M21.5 17v-2.5h3.5" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

/** Abaya — long flowing open robe. */
function AbayaIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 32 32" fill="none" className={className} aria-hidden="true">
      <path
        d="M10 4h12l-2 3 2 3v18l-2 1h-8l-2-1V10l2-3-2-3Z"
        stroke="currentColor"
        strokeWidth="1.4"
        strokeLinejoin="round"
      />
      <path d="M16 7v22" stroke="currentColor" strokeWidth="1.1" strokeLinecap="round" opacity="0.5" />
      <path d="M16 11l2-1.5M16 11l-2-1.5M16 16l2-1.5M16 16l-2-1.5" stroke="currentColor" strokeWidth="1" strokeLinecap="round" opacity="0.6" />
    </svg>
  );
}

/** Caftan — long belted robe with a V-neck. */
function CaftanIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 32 32" fill="none" className={className} aria-hidden="true">
      <path
        d="M11 4l5 3 5-3 1 4-2 4 2 3v12l-1 1H10l-1-1V15l2-3-2-4 1-4Z"
        stroke="currentColor"
        strokeWidth="1.4"
        strokeLinejoin="round"
      />
      <path d="M16 7l-3 3 3 2 3-2-3-3Z" stroke="currentColor" strokeWidth="1.1" strokeLinejoin="round" opacity="0.7" />
      <path d="M12 15h8" stroke="currentColor" strokeWidth="1.1" strokeLinecap="round" opacity="0.5" />
      <path d="M13 22l3-3 3 3" stroke="currentColor" strokeWidth="1.1" strokeLinecap="round" strokeLinejoin="round" opacity="0.5" />
    </svg>
  );
}

/** Generic garment fallback. */
function GarmentIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 32 32" fill="none" className={className} aria-hidden="true">
      <path
        d="M9 5h14l-2 3v18l1 1H10l1-1V8L9 5Z"
        stroke="currentColor"
        strokeWidth="1.4"
        strokeLinejoin="round"
      />
      <path d="M14 5l2 3 2-3" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}
