"use client";

import { WifiOff } from "lucide-react";
import * as React from "react";
import { useT } from "@/i18n/locale-provider";

export function OfflineIndicator() {
	const { t } = useT();
	// Start optimistic-online: Node 21+ exposes a `navigator` object without
	// `onLine`, so reading it during SSR/hydration is unreliable. The mount
	// effect below syncs the real value right after hydration.
	const [online, setOnline] = React.useState(true);

	React.useEffect(() => {
		if (typeof window === "undefined") return;
		setOnline(window.navigator.onLine);
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
			<span>{t("pwa.offlineBanner")}</span>
		</div>
	);
}
