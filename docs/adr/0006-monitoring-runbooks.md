# ADR 0006 — Monitoring, observability and operational runbooks

Status: Accepted (issue #128)

## Context

The platform has Sentry error monitoring wired (client + server) and nightly encrypted
Supabase backups to R2, but there is no documented alert ownership, runbook, correlation-ID
tracing for critical workflows, or incident/rollback/credential-rotation procedures.

## Decision

- **Monitoring:** Sentry remains the error/performance backend (project `maison-titrit-web`).
  - Client (`instrumentation-client.ts`): DSN gated on `NEXT_PUBLIC_SENTRY_DSN`, 10% trace sample,
    Session Replay 10% sessions / 100% errored sessions.
  - Server (`sentry.server.config.ts` / `sentry.edge-config.ts`): DSN gated on `SENTRY_DSN`,
    10% trace sample, `sendDefaultPii` off (PII gated at event level).
  - Health route (`/api/health`) reports uptime, Sentry status, release.
- **Correlation IDs:** `web/src/lib/correlation.ts` provides `getCorrelationId(req)` and
  `logWithCorrelation(...)`. Critical flows (checkout) attach the correlation ID to Sentry
  context and structured logs, enabling trace-through without logging secrets or PII.
- **Alerts:** Each alert maps to a named owner and runbook (see `docs/monitoring-runbooks.md`).
  No Redis is added — no measured requirement exists (per roadmap guardrail).
- **Backups:** Existing nightly `db-backup.yml` workflow (pg_dump → age-encrypt → R2
  `maison-titrit-backups`) is documented with restore drill steps.
- **Incident/rollback/credential rotation:** Documented in runbooks.

## Consequences

- On-call staff can trace a failed checkout end-to-end via correlation ID.
- Restore drill is repeatable against a scratch database (never production directly).
- Alert routing is explicit; no ambiguous ownership.
- No new infrastructure vendors.

## Rejected alternatives

- Redis for metrics/queuing: rejected until a measured bottleneck exists (roadmap guardrail).
- New observability vendor: rejected — Sentry + Vercel logs + Supabase logs suffice.
