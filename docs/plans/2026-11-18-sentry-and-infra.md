# Sentry Integration & Infrastructure Verification Report
## Date: 2026-11-18 | Branch: feature/2026-11-18-ads-and-storefront-plan

---

## 1. Sentry Integration

### Status: Implemented ✅

Minimal Sentry integration has been installed and verified on the feature branch.

#### Changes Made

**Dependencies**
- Added `@sentry/nextjs@11.14.0` to `web/package.json`

**Configuration Files**
- `web/sentry.client.config.ts` — client-side init, tracesSampleRate 0.1, DSN from `NEXT_PUBLIC_SENTRY_DSN` or `SENTRY_DSN`
- `web/sentry.server.config.ts` — server-side init, same configuration
- `web/next.config.ts` — wrapped with `withSentryConfig` from `@sentry/nextjs/config`, org/project from env

**Error Boundaries**
- `web/src/app/error.tsx` — added `Sentry.captureException(error)` in useEffect
- `web/src/app/global-error.tsx` — added `Sentry.captureException(error)` at render
- `web/src/app/makteb/error.tsx` — new error boundary for admin routes with Sentry capture and French messaging

**Health Check**
- `web/src/app/api/health/route.ts` — basic release/health endpoint exposing Sentry enabled status, DSN config, runtime versions, and release identifier

**Documentation**
- Updated `web/.env.example` with SENTRY_DSN documentation (comments only, no secrets committed)

#### Verification Results

- **TypeScript**: `bunx tsc --noEmit -p web` — existing pre-existing errors only, no Sentry-related failures
- **Lint**: `bun run lint` — 0 errors / 0 warnings ✅
- **Tests**: `cd web && bun test` — 31 pass, 0 fail ✅
- **Commit**: `37ddf78` — committed to feature branch, not merged to main/develop

#### Notes

- No `.env` files committed. `SENTRY_DSN` must be set via Vercel environment variables only
- Sentry is disabled by default when `SENTRY_DSN` is empty
- No client Google/Meta accounts touched, no BACKUP_DATABASE_URL rotation

---

## 2. Infrastructure Verification (Read-Only)

### 2.1 GitHub Actions: db-backup.yml

**File**: `.github/workflows/db-backup.yml`
**Status**: Present and verified ✅

- Nightly pg_dump of Supabase `public` schema at 02:17 UTC
- Custom format dump, age encryption, upload to R2 bucket `maison-titrit-backups`
- **Limitation**: GitHub Actions run history is NOT available via current MCP — state explicitly not verified from Actions UI
- Secrets referenced: `BACKUP_DATABASE_URL`, `R2_BACKUP_ACCESS_KEY_ID`, `R2_BACKUP_SECRET_ACCESS_KEY`, `R2_ACCOUNT_ID`

### 2.2 Terraform: Cloudflare DNS

**Directory**: `terraform/`
**Status**: Codifies Cloudflare DNS ✅

- `dns.tf` manages apex A records, www CNAME, cms A record, SPF/DKIM/DMARC TXT
- `.gitignore` correctly excludes:
  - `*.tfstate`, `*.tfstate.*`, `*.tfstate.backup`
  - `.terraform/`, `.terraform.lock.hcl`
  - `*.tfvars` (except `terraform.tfvars.example`)
- `terraform.tfstate` and `terraform.tfvars` are gitignored ✅

### 2.3 docs/DEPLOYMENT.md Environment Table

**Status**: Partial match — discrepancies noted

**Env Table (lines 95-120) lists:**
- ✅ `META_CAPI_ACCESS_TOKEN`
- ✅ `META_PIXEL_ID`
- ✅ `GA_API_SECRET`

**Env Table does NOT list:**
- ❌ `BACKUP_DATABASE_URL` (documented in "Backups & restore" section lines 242-243, not in env table)
  - Described as: session pooler `aws-0-eu-west-1.pooler.supabase.com:5432`, `sslmode=require`
  - Task specification requested pooler `:6543`, `?pgbouncer=true&connection_limit=1` — discrepancy noted
- ❌ `GOOGLE_CLIENT_ID` — docs state Google credentials belong in Supabase Auth provider settings, not Vercel (line 122)
- ❌ `GOOGLE_CLIENT_SECRET` — same as above

### 2.4 Supabase Migrations

**Directory**: `supabase/migrations/`
**Status**: 3 files, no UTM normalization ✅

Files present:
1. `20261114000100_supabase_auth_rbac.sql` — Auth RBAC, triggers, RLS policies
2. `20261115120000_rbac_developer_marketer.sql` — DEVELOPER/MARKETER roles
3. `20261115130000_article_locale_trilingual.sql` — Article locale column (fr/ar/en)

**UTM Normalization**: Not present on main. Branch `fix/utm-column-normalization` exists but has not been merged (referenced in git branches).

### 2.5 Prisma Schemas Lockstep

**Files**: `web/prisma/schema.prisma` (SQLite), `web/prisma/schema.postgres.prisma` (Postgres)
**Status**: In lockstep ✅

- Both files share identical model definitions
- Differences: only datasource provider (`sqlite` vs `postgresql`) and minor comment formatting/whitespace
- Order model includes UTM fields: `utmSource`, `utmMedium`, `utmCampaign`, `utmContent`, `utmTerm`

---

## Summary

✅ Sentry integration implemented minimally with error boundaries for /makteb, health check, and proper env handling  
✅ Infrastructure verified: db-backup workflow present, Terraform state ignored, migrations count correct  
⚠️ DEPLOYMENT.md env table discrepancies noted (BACKUP_DATABASE_URL, GOOGLE_CLIENT_ID/SECRET)  
⚠️ GitHub Actions run history not verifiable via current MCP  

No merges or pushes performed. All changes remain on `feature/2026-11-18-ads-and-storefront-plan`.
