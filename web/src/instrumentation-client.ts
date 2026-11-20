import * as Sentry from "@sentry/nextjs";
import { initBotId } from "botid/client/core";
import posthog from "posthog-js";

const posthogToken = process.env.NEXT_PUBLIC_POSTHOG_PROJECT_TOKEN;
const posthogHost = process.env.NEXT_PUBLIC_POSTHOG_HOST;

if (posthogToken && posthogHost) {
	posthog.init(posthogToken, {
		api_host: posthogHost,
		defaults: "2025-05-24",
		capture_exceptions: true,
		debug: process.env.NODE_ENV === "development",
	});
} else if (process.env.NODE_ENV === "development") {
	const missingVariable = posthogToken
		? "NEXT_PUBLIC_POSTHOG_HOST"
		: "NEXT_PUBLIC_POSTHOG_PROJECT_TOKEN";
	throw new Error(
		`${missingVariable} variable required by PostHog is missing or un-configured, this causes events to be silently missed. This error stops appearing once ${missingVariable} is configured`,
	);
}

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
	// Client bundle: only NEXT_PUBLIC_* vars are inlined, so gate on the public DSN
	enabled: !!process.env.NEXT_PUBLIC_SENTRY_DSN,
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
