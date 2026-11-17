"use client";

import { Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";
import * as React from "react";

import { useT } from "@/i18n/locale-provider";

export function ThemeToggle({
	darkSurface = false,
}: {
	darkSurface?: boolean;
}) {
	const { theme, setTheme, resolvedTheme } = useTheme();
	const { t } = useT();
	const [mounted, setMounted] = React.useState(false);
	React.useEffect(() => setMounted(true), []);
	const current = theme === "system" ? resolvedTheme : theme;

	return (
		<button
			type="button"
			aria-label={t("theme.aria")}
			onClick={() => setTheme(current === "dark" ? "light" : "dark")}
			className={`inline-flex size-11 items-center justify-center rounded-full border transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-bronze-light ${
				darkSurface
					? "border-cream/35 text-cream hover:bg-cream/10"
					: "border-bronze/40 text-ink hover:bg-bronze/10 dark:text-cream"
			}`}
		>
			{mounted ? (
				current === "dark" ? (
					<Sun className="size-4" />
				) : (
					<Moon className="size-4" />
				)
			) : (
				<span className="size-4" />
			)}
		</button>
	);
}
