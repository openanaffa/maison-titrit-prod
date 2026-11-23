"use client";

import { Megaphone, X } from "lucide-react";
import * as React from "react";
import { useAnnouncement } from "@/hooks/api/announcement";
import { useT } from "@/i18n/locale-provider";

/**
 * Dismissible announcement bar — shows a short, prominent message at the
 * very top of the site. The message + active flag are fetched from the
 * settings API (founder-editable). Dismissal is persisted per-session in
 * sessionStorage so the bar re-appears on the next visit if still active.
 */
export function AnnouncementBar() {
	const { t } = useT();
	const announcement = useAnnouncement();
	const [dismissed, setDismissed] = React.useState(false);
	const bar = announcement.data?.bar ?? null;

	React.useEffect(() => {
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

	if (!bar?.active || dismissed || !bar.message) return null;

	return (
		<div className="relative z-55 bg-ink text-cream">
			<div className="mx-auto flex max-w-6xl items-center justify-center gap-2 px-4 py-2 text-center sm:px-6">
				<Megaphone className="size-3.5 shrink-0 text-bronze-light" />
				{bar.link ? (
					<a
						href={bar.link}
						className="font-serif text-xs leading-tight text-cream/95 underline-offset-2 hover:text-bronze-light hover:underline focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-bronze-light sm:text-sm"
					>
						{bar.message}
					</a>
				) : (
					<p className="font-serif text-xs leading-tight text-cream/95 sm:text-sm">
						{bar.message}
					</p>
				)}
				<button
					type="button"
					onClick={dismiss}
					aria-label={t("common.close")}
					className="absolute inset-e-2 top-1/2 -translate-y-1/2 inline-flex size-11 items-center justify-center rounded-full text-cream/70 transition-colors hover:text-cream focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-bronze-light"
				>
					<X className="size-3.5" />
				</button>
			</div>
		</div>
	);
}
