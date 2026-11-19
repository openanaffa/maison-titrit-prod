# Client bundles only inline NEXT_PUBLIC_* env vars

## Decided
In Next.js, only `NEXT_PUBLIC_*` env vars are inlined into the browser bundle. Gating client-side code on a private var (`enabled: !!process.env.SENTRY_DSN`) evaluates `false` in production while working in dev (where `.env` provides both) — it silently disabled all client-side Sentry monitoring (spans, replay, client errors) until found and fixed in `web/src/instrumentation-client.ts`. Rule: any client-side feature gate must read a `NEXT_PUBLIC_*` var or be inlined by the build.

## Watch out
Verifying a production client SDK is live: check the served JS chunks for injected markers (`_sentryDebugIds` for source maps) or watch for ingest requests in the browser's performance entries — not just server-side data in the Sentry API.
