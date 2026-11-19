import * as Sentry from "@sentry/nextjs";

Sentry.init({
  dsn: process.env.SENTRY_DSN,
  // Adjust this value in production, or use tracesSampler for finer control
  tracesSampleRate: process.env.NODE_ENV === "development" ? 1.0 : 0.1,
  debug: false,
  enabled: !!process.env.SENTRY_DSN,
});
