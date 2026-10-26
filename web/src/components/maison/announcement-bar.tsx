"use client";

import * as React from "react";
import { Megaphone, X } from "lucide-react";

/**
 * Dismissible announcement bar — shows a short, prominent message at the
 * very top of the site. The message + active flag are fetched from the
 * settings API (founder-editable). Dismissal is persisted per-session in
 * sessionStorage so the bar re-appears on the next visit if still active.
 */
export function AnnouncementBar() {
  const [bar, setBar] = React.useState<{ message: string; active: boolean; link?: string } | null>(null);
  const [dismissed, setDismissed] = React.useState(false);

  React.useEffect(() => {
    fetch("/api/settings/announcement")
      .then((r) => r.json())
      .then((d) => setBar(d.bar ?? null))
      .catch(() => setBar(null));
    try {
      setDismissed(sessionStorage.getItem("ann-dismissed") === "1");
    } catch {
      /* ignore */
    }
  }, []);

  const dismiss = () => {
    setDismissed(true);
    try {
      sessionStorage.setItem("ann-dismissed", "1");
    } catch {
      /* ignore */
    }
  };

  if (!bar || !bar.active || dismissed || !bar.message) return null;

  return (
    <div className="relative z-[55] bg-ink text-cream">
      <div className="mx-auto flex max-w-6xl items-center justify-center gap-2 px-4 py-2 text-center sm:px-6">
        <Megaphone className="size-3.5 shrink-0 text-bronze-light" />
        {bar.link ? (
          <a
            href={bar.link}
            className="font-serif text-xs leading-tight text-cream/95 underline-offset-2 hover:text-bronze-light hover:underline sm:text-sm"
          >
            {bar.message}
          </a>
        ) : (
          <p className="font-serif text-xs leading-tight text-cream/95 sm:text-sm">
            {bar.message}
          </p>
        )}
        <button
          onClick={dismiss}
          aria-label="Fermer"
          className="absolute end-2 top-1/2 -translate-y-1/2 text-cream/70 transition-colors hover:text-cream"
        >
          <X className="size-3.5" />
        </button>
      </div>
    </div>
  );
}
