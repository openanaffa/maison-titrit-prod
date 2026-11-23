"use client";

import type * as React from "react";
import { cn } from "@/lib/utils";

export type ChipButtonProps = React.ComponentProps<"button"> & {
	/** Whether the chip is the current selection (rendered as a pressed toggle). */
	active?: boolean;
};

/**
 * Shared pill/toggle chip used by the admin filter rows and status pickers.
 * Renders `aria-pressed` so screen readers announce the selection state, and
 * carries the single source of truth for the vintage chip styling.
 */
export function ChipButton({
	active,
	className,
	type,
	...props
}: ChipButtonProps) {
	return (
		<button
			type={type ?? "button"}
			aria-pressed={active}
			className={cn(
				"inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 font-label text-[0.62rem] uppercase tracking-[0.14em] transition-colors outline-none focus-visible:ring-[3px] focus-visible:ring-ring/50 focus-visible:border-ring disabled:pointer-events-none disabled:opacity-50",
				active
					? "border-ink bg-ink text-cream dark:border-cream dark:bg-cream dark:text-ink"
					: "border-bronze/45 text-ink-soft hover:border-terracotta hover:text-ink dark:text-cream/70 dark:hover:border-cream/50 dark:hover:text-cream",
				className,
			)}
			{...props}
		/>
	);
}
