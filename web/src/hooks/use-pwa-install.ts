"use client";

import * as React from "react";

export interface BeforeInstallPromptEvent extends Event {
	readonly platforms: string[];
	readonly userChoice: Promise<{
		outcome: "accepted" | "dismissed";
		platform: string;
	}>;
	prompt(): Promise<void>;
}

const DISMISS_KEY = "titrit-pwa-install-dismissed";

function isStandalone(): boolean {
	if (typeof window === "undefined") return false;
	const nav = window.navigator as Navigator & { standalone?: boolean };
	return (
		window.matchMedia("(display-mode: standalone)").matches ||
		nav.standalone === true
	);
}

export function usePwaInstall() {
	const [deferred, setDeferred] =
		React.useState<BeforeInstallPromptEvent | null>(null);
	const [installed, setInstalled] = React.useState<boolean>(isStandalone);
	const [dismissed, setDismissed] = React.useState<boolean>(() => {
		if (typeof window === "undefined") return false;
		try {
			return window.localStorage.getItem(DISMISS_KEY) === "1";
		} catch {
			return false;
		}
	});

	React.useEffect(() => {
		if (typeof window === "undefined") return;
		const onBeforeInstall = (e: Event) => {
			e.preventDefault();
			setDeferred(e as BeforeInstallPromptEvent);
		};
		const onInstalled = () => {
			setInstalled(true);
			setDeferred(null);
		};
		window.addEventListener("beforeinstallprompt", onBeforeInstall);
		window.addEventListener("appinstalled", onInstalled);
		return () => {
			window.removeEventListener("beforeinstallprompt", onBeforeInstall);
			window.removeEventListener("appinstalled", onInstalled);
		};
	}, []);

	const canInstall = !installed && !dismissed && deferred !== null;

	const promptInstall = React.useCallback(async () => {
		if (!deferred) return false;
		try {
			await deferred.prompt();
			const choice = await deferred.userChoice;
			if (choice.outcome === "accepted") {
				setInstalled(true);
				setDeferred(null);
				return true;
			}
			return false;
		} catch {
			return false;
		}
	}, [deferred]);

	const dismiss = React.useCallback(() => {
		setDismissed(true);
		try {
			window.localStorage.setItem(DISMISS_KEY, "1");
		} catch {
			/* ignore */
		}
	}, []);

	const resetDismiss = React.useCallback(() => {
		setDismissed(false);
		try {
			window.localStorage.removeItem(DISMISS_KEY);
		} catch {
			/* ignore */
		}
	}, []);

	return {
		canInstall,
		installed,
		dismissed,
		promptInstall,
		dismiss,
		resetDismiss,
		isIOS:
			typeof navigator !== "undefined" &&
			/iPad|iPhone|iPod/.test(navigator.userAgent) &&
			!(window as unknown as { MSStream?: unknown }).MSStream,
	};
}
