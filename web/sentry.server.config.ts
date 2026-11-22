import * as Sentry from "@sentry/nextjs";

/**
 * Server-side Sentry configuration (Node.js runtime).
 *
 * Initialised once per cold start via `instrumentation.ts` `register()`.
 * Captures errors from Server Components, route handlers, proxy and any
 * server-only code path. Does NOT include Session Replay (client-only).
 */
Sentry.init({
	dsn: process.env.SENTRY_DSN,
	environment: process.env.NODE_ENV,
	release: process.env.SENTRY_RELEASE,
	// 100% of errors; sampled traces in dev, 10% in production (env-tunable).
	tracesSampleRate:
		process.env.NODE_ENV === "development"
			? 1.0
			: Number(process.env.SENTRY_TRACES_SAMPLE_RATE ?? "0.1"),
	debug: false,
	enabled: !!process.env.SENTRY_DSN,
});
