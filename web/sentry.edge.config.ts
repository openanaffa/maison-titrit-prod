import * as Sentry from "@sentry/nextjs";

/**
 * Edge runtime Sentry configuration.
 *
 * Initialised via `instrumentation.ts` `register()` when `NEXT_RUNTIME === "edge"`.
 * Edge functions have limited Node APIs; keep the init minimal and dependency-free.
 */
Sentry.init({
	dsn: process.env.SENTRY_DSN,
	environment: process.env.NODE_ENV,
	release: process.env.SENTRY_RELEASE,
	tracesSampleRate: Number(process.env.SENTRY_TRACES_SAMPLE_RATE ?? "0.1"),
	debug: false,
	enabled: !!process.env.SENTRY_DSN,
});
