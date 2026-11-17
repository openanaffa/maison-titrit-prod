"use client";

import * as React from "react";

export function SwRegister() {
	React.useEffect(() => {
		if (process.env.NODE_ENV !== "production") return;
		if (typeof window === "undefined" || !("serviceWorker" in navigator))
			return;
		const register = () => {
			navigator.serviceWorker.register("/sw.js", { scope: "/" }).catch(() => {
				/* registration failures are non-fatal */
			});
		};
		if (document.readyState === "complete") register();
		else window.addEventListener("load", register, { once: true });
	}, []);
	return null;
}
