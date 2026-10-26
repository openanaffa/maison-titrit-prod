"use client";

import { useEffect } from "react";
import { captureAttribution } from "@/lib/analytics";

/** Captures UTM params + ref on first visit (first-touch attribution for ads). */
export function AttributionCapture() {
  useEffect(() => {
    captureAttribution();
  }, []);
  return null;
}
