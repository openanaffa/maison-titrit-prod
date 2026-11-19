"use client";

import { useEffect } from "react";
import {
	captureAttribution,
	getConsent,
	loadConsent,
	subscribe,
} from "@/lib/analytics";

/**
 * Captures UTM params/ref on first visit for marketing attribution, only after
 * explicit marketing consent. Re-checks when consent changes.
 */
export function AttributionCapture() {
	useEffect(() => {
		const run = () => {
			const s = getConsent();
			if (s.decided && s.marketing) captureAttribution();
		};
		// Hydrate consent from localStorage first: this component mounts before
		// AnalyticsScripts, so on a returning visitor getConsent() would
		// otherwise return the undecided default and the capture silently
		// skipped. loadConsent() is idempotent.
		loadConsent();
		run();
		return subscribe(run);
	}, []);
	return null;
}
