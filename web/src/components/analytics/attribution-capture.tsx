"use client";

import { useEffect } from "react";
import { captureAttribution, getConsent, subscribe } from "@/lib/analytics";

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
		run();
		return subscribe(run);
	}, []);
	return null;
}
