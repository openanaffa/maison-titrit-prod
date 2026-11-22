# Monitoring, Backup & Operational Runbooks

**Issue:** #128 — Establish operational monitoring, backup restore drill and runbooks
**Parent:** #114 (Production readiness)
**Status:** Documented
**Last reviewed:** 2026-11-22

## 1. Monitoring & alerting

### 1.1 Error monitoring (Sentry)

| Item | Value |
|------|-------|
| Backend | Sentry (project `maison-titrit/maison-titrit-web`) |
| Client DSN | `NEXT_PUBLIC_SENTRY_DSN` (public, browser-safe) |
| Server DSN | `SENTRY_DSN` (server-only) |
| Org | `maison-titrit` |
| Client sample rate | 100% dev / 10% prod traces; Replay 10% sessions / 100% errored |
| Server sample rate | 10% traces (via `SENTRY_TRACES_SAMPLE_RATE`, default 0.1) |
| PII | `sendDefaultPii` off; PII only via explicit `Sentry.setContext` with no customer data |

**Alert routing:** Every Sentry alert is assigned to an owner below. Alerts fire on:
- New error issues (any level error)
- Regression of a resolved issue
- Spike in error rate (> 5× baseline over 15 min)

| Alert | Owner | Runbook |
|-------|-------|---------|
| Checkout API 5xx | Founder / Tech Lead | §3.1 |
| Sentry error spike | Founder / Tech Lead | §3.2 |
| Wafine webhook failure | Founder / Tech Lead | §3.3 |
| Notification job failure | Founder / Tech Lead | §3.4 |
| Low stock alert | Founder / Tech Lead | §3.5 |

### 1.2 Health check

`GET /api/health` returns `status: "ok"`, Sentry DSN configured flag, runtime versions, and release SHA. Use for uptime monitoring.

### 1.3 Logs

- Vercel dashboard → Functions / Edge logs (server routes)
- Supabase dashboard → Logs (database queries, auth)
- Application structured logs via `logWithCorrelation(correlationId, level, message, meta)` in `web/src/lib/correlation.ts` — emits JSON with `correlationId`, `level`, `message`, `timestamp`. No secrets or PII in meta.

## 2. Correlation ID tracing

Critical workflows (checkout) attach a correlation ID:

1. Inbound request `x-correlation-id` header is reused, otherwise a fresh `req_<uuid>` is generated.
2. `Sentry.setContext("correlation", { correlationId })` tags every Sentry event for the request.
3. `logWithCorrelation(correlationId, "info/error/warn", message, meta)` emits structured JSON logs.
4. The correlation ID is returned to the client implicitly via the order number (customer-facing reference) so support can look it up.

No customer data, PII or internal identifiers are embedded in the correlation ID.

**Trace a failure:** Given a correlation ID, search Sentry issues and server logs for `correlationId == <id>` to reconstruct the full request lifecycle without logging secrets.

## 3. Incident runbooks

### 3.1 Checkout API 5xx (P1)

**Symptoms:** `POST /api/checkout` returns 500; Sentry `checkout.failed` events.

**Steps:**
1. Open Sentry → issue details → check `correlationId` tag.
2. Correlate with server logs: `logWithCorrelation` entries for that ID.
3. Common causes:
   - `OUT_OF_STOCK` → inventory exhausted; advise customer, restock via /makteb inventory workspace.
   - Delivery zone not covered → customer address outside coverage; suggest alternative.
   - Prisma/Supabase connection error → check Supabase status page, DATABASE_URL validity.
4. If unresolved within 30 min, escalate to Founder and consider rolling back the last deploy (Vercel → Deployments → Promote to Production on previous deploy).

### 3.2 Sentry error spike (P2)

**Symptoms:** > 5× baseline error rate over 15 min.

**Steps:**
1. Identify top issue in Sentry (newest / most frequent).
2. Check recent deploys (Vercel → Deployments). If a deploy correlates, roll back.
3. Assign owner, create incident record with correlation ID samples.
4. Post-mortem within 48 hours.

### 3.3 Wafine webhook failure (P2)

**Symptoms:** Webhook events return non-2xx; Sentry events from webhook handler.

**Steps:**
1. Verify Wafine webhook secret and URL in Wafine dashboard.
2. Check Sentry for the webhook handler error; correlation ID traces the inbound message.
3. Replay the webhook from Wafine dashboard (idempotent — duplicate deliveries are safe).
4. If Wafine-side, contact Wafine owner.

### 3.4 Notification job failure (P2)

**Symptoms:** Staff order alert email not sent; `[notify] staff email failed` in logs.

**Steps:**
1. Verify `EMAIL_SERVER_HOST`, `EMAIL_SERVER_USER`, `EMAIL_SERVER_PASSWORD`, `STAFF_EMAILS` are set in Vercel.
2. Check SMTP connectivity (Brevo relay `smtp-relay.brevo.com`).
3. Retry manually via Vercel dashboard or re-trigger the order webhook.
4. If email infrastructure down, notify staff via WhatsApp deeplink fallback.

### 3.5 Low stock alert (P3)

**Symptoms:** Variant `onHand - reserved <= lowStockThreshold`.

**Steps:**
1. Open /makteb/inventory, filter "Low stock".
2. Create a `receiveStock` movement (purchase order received) or `adjustStock` (count correction).
3. Confirm `available` > `lowStockThreshold` after the movement.

## 4. Backups & restore drill

### 4.1 Backup schedule (existing)

Nightly at 02:17 UTC, `.github/workflows/db-backup.yml`:
1. `pg_dump` 17 (custom format) of Supabase `public` schema via the **session pooler** (`aws-0-eu-west-1.pooler.supabase.com:5432`, user `postgres.<project-ref>`, `sslmode=require`).
2. Encrypt with `age` (recipient: age public key; private key in `pass maison-titrit/backup/age-identity`).
3. Upload to private R2 bucket `maison-titrit-backups` under `db/YYYY/MM/DD/`.
4. R2 lifecycle rule `expire-db-30d` expires objects after 30 days.
5. Run fails (GitHub emails) if dump has fewer than 10 tables.

**Secrets:** `BACKUP_DATABASE_URL`, `R2_BACKUP_ACCESS_KEY_ID`, `R2_BACKUP_SECRET_ACCESS_KEY`, `R2_ACCOUNT_ID` (GitHub Secrets). Age private key in `pass`.

### 4.2 Backup restore drill (demonstrated in non-production)

**Frequency:** Quarterly, or after any schema migration.

**Steps (never restore directly over production):**

1. Create a scratch Supabase project (or a scratch schema in a non-production database).
2. Download latest backup:
   ```sh
   aws s3 cp s3://maison-titrit-backups/db/<date>/<file>.pgc.age . \
     --endpoint-url https://<account-id>.r2.cloudflarestorage.com
   ```
3. Decrypt:
   ```sh
   age -d -i <(pass show maison-titrit/backup/age-identity) <file>.pgc.age > dump.pgc
   ```
4. Sanity check:
   ```sh
   pg_restore --list dump.pgc | grep -c 'TABLE DATA'   # must be >= 10
   ```
5. Restore into scratch database:
   ```sh
   pg_restore --no-owner --no-privileges --clean --if-exists -d "$SCRATCH_DATABASE_URL" dump.pgc
   ```
6. Verify: query table counts, confirm a sample order and product variant exist.
7. Record the drill result (date, duration, tables restored, any anomalies) in the incident log.
8. Delete the scratch database after the drill.

**Rollback (production deploy):** Vercel keeps every deploy. Project → Deployments → previous deploy → **Promote to Production**. Instant rollback. For schema changes, reverse the migration in a forward-fix PR rather than reverting data.

## 5. Incident, rollback & credential rotation

### 5.1 Incident procedure

1. **Detect:** Sentry alert, health check failure, or staff report.
2. **Acknowledge:** Assigned owner acknowledges within 30 min (business hours) / 2 hours (off-hours).
3. **Investigate:** Use correlation IDs + Sentry + logs to find root cause.
4. **Mitigate:** Rollback deploy, disable feature flag, or apply forward fix.
5. **Communicate:** Update affected customers via WhatsApp/email if orders are impacted.
6. **Resolve:** Confirm recovery via health check + Sentry issue resolution.
7. **Post-mortem:** Document timeline, root cause, action items within 48 hours.

### 5.2 Rollback procedure

- **Application code:** Vercel → Deployments → select previous successful deploy → Promote to Production.
- **Database schema:** Do not revert migrations (destructive). Instead, ship a forward-fix migration in a PR.
- **RLS / auth config:** Revert the Supabase SQL change in Supabase SQL Editor, then re-apply a corrected version.

### 5.3 Credential rotation

| Credential | Location | Rotation trigger |
|------------|----------|------------------|
| Vercel tokens | Vercel dashboard / `VERCEL_TOKEN` | On staff change, quarterly |
| Supabase service role | Supabase dashboard → API keys | On staff change, quarterly |
| R2 access keys | R2 dashboard → API tokens | On staff change, quarterly |
| Age private key (backups) | `pass maison-titrit/backup/age-identity` | On staff change, annually |
| SMTP credentials | Brevo dashboard / Vercel env | On staff change, quarterly |
| Sentry auth token | Sentry dashboard → Auth Tokens | On staff change, quarterly |

**Rotation steps:** Generate new credential → update in secret store (Vercel env / Supabase dashboard / R2 / pass) → deploy → verify health check → revoke old credential.

**Age key rotation:** When rotating the age private key (`pass maison-titrit/backup/age-identity`), also update `AGE_RECIPIENT` in `.github/workflows/db-backup.yml` to the new age public key. New backups will be encrypted for the new identity; old backups remain decryptable with the old private key, so retain old identities in `pass` until all backups encrypted under them have expired (R2 lifecycle: 30 days).

## 6. No-Redis guardrail

Per the roadmap, Redis is not added unless a measured requirement exists (concrete bottleneck, expected workload, cost/operational impact, failure-mode analysis, documented ADR, approval). No Redis is in use.

## 7. Release gate

Before any production release:
- [ ] All alerts have an owner and runbook
- [ ] Backup restore drill completed and documented (within last quarter)
- [ ] Health check passes in preview and production
- [ ] Correlation ID tracing verified on checkout flow
- [ ] Incident rollback procedure tested (Vercel promote-to-previous)
