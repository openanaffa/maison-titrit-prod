"use client";

import { useT } from "@/i18n/locale-provider";

export function SkipLink() {
	const { t } = useT();
	return (
		<a
			href="#main-content"
			className="sr-only focus:not-sr-only focus:fixed focus:start-4 focus:top-4 focus:z-[100] focus:rounded-sm focus:bg-cream focus:px-4 focus:py-2 focus:font-label focus:text-xs focus:uppercase focus:tracking-[0.14em] focus:text-ink focus:shadow-lg dark:focus:bg-ink dark:focus:text-cream"
		>
			{t("a11y.skipToContent")}
		</a>
	);
}
