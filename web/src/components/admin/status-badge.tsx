"use client";

import { STATUS_LABELS, STATUS_STYLES } from "@/lib/types/constants";
import { cn } from "@/lib/utils";

export function StatusBadge({ status }: { status: string }) {
	return (
		<span
			className={cn(
				"inline-flex items-center rounded-full px-2 py-0.5 font-label text-[0.55rem] uppercase tracking-[0.14em]",
				STATUS_STYLES[status] ?? "bg-muted text-muted-foreground",
			)}
		>
			{STATUS_LABELS[status] ?? status}
		</span>
	);
}
