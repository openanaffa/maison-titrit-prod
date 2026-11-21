"use client";

import { WifiOff } from "lucide-react";
import * as React from "react";

export function OfflineIndicator() {
	const [online, setOnline] = React.useState<boolean>(() => {
		if (typeof navigator === "undefined") return true;
		return navigator.onLine;
	});

	React.useEffect(() => {
		if (typeof window === "undefined") return;
		const onOnline = () => setOnline(true);
		const onOffline = () => setOnline(false);
		window.addEventListener("online", onOnline);
		window.addEventListener("offline", onOffline);
		return () => {
			window.removeEventListener("online", onOnline);
			window.removeEventListener("offline", onOffline);
		};
	}, []);

	if (online) return null;

	return (
		<div
			role="status"
			aria-live="polite"
			className="fixed inset-x-0 top-0 z-50 flex items-center justify-center gap-2 bg-ink px-4 py-2 text-center font-label text-[0.66rem] uppercase tracking-[0.18em] text-cream"
		>
			<WifiOff className="size-3.5" />
			<span>Hors ligne — certaines fonctions sont limitées</span>
		</div>
	);
}
