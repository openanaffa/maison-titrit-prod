import * as Sentry from "@sentry/nextjs";
import { initBotId } from "botid/client/core";

// Sentry client-side error monitoring (project: maison-titrit/maison-titrit-web).
// DSN is a public identifier; the client reads NEXT_PUBLIC_SENTRY_DSN.
Sentry.init({
	dsn: process.env.NEXT_PUBLIC_SENTRY_DSN || process.env.SENTRY_DSN,
	// Capture 100% of traces in dev, 10% in production
	tracesSampleRate: process.env.NODE_ENV === "development" ? 1.0 : 0.1,
	integrations: [
		// Session Replay: 10% of sessions, 100% of sessions with an error
		Sentry.replayIntegration(),
	],
	replaysSessionSampleRate: 0.1,
	replaysOnErrorSampleRate: 1.0,
	debug: false,
	enabled: !!process.env.SENTRY_DSN,
});

// Instrument client-side navigations (required by the App Router integration)
export const onRouterTransitionStart = Sentry.captureRouterTransitionStart;

// Vercel BotID: invisible bot challenge on the public write endpoints.
// Each path here must call checkBotId() server-side (lib/bot.ts).
initBotId({
	protect: [
		{ path: "/api/checkout", method: "POST" },
		{ path: "/api/auth/register", method: "POST" },
		{ path: "/api/track", method: "POST" },
	],
});
