"use client";

import { Analytics } from "@vercel/analytics/next";
import { SpeedInsights } from "@vercel/speed-insights/next";
import { useSyncExternalStore } from "react";
import { getConsent, subscribe } from "@/lib/analytics";

/**
 * Vercel Analytics and Speed Insights are mounted only after explicit
 * analytics consent, in line with the site's consent preferences.
 */
export function VercelTelemetry() {
	const consent = useSyncExternalStore(subscribe, getConsent, getConsent);
	if (!consent.decided || !consent.analytics) return null;
	return (
		<>
			<Analytics />
			<SpeedInsights />
		</>
	);
}
