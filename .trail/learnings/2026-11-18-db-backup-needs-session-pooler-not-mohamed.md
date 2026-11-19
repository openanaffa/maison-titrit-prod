---
title: db-backup needs session pooler not app transaction pooler
author: Mohamed
date: 2026-11-18
branch: feature/2026-11-18-ads-and-storefront-plan
id: l-c0a82496
scope: repo
status: active
src: agent
touches:
  - web/prisma/schema.postgres.prisma
  - web/prisma/schema.prisma
  - "web/src/app/api/admin/articles/[id]/route.ts"
  - web/src/app/api/admin/articles/route.ts
  - "web/src/app/makteb/blog/[id]/page.tsx"
  - web/src/app/makteb/blog/new/page.tsx
  - web/src/app/makteb/blog/page.tsx
  - web/src/components/admin/article-form.tsx
  - web/src/lib/supabase/database.types.ts
  - web/src/lib/types/article.ts
---

## Decided
- `BACKUP_DATABASE_URL` must use the shared **session** pooler: `postgresql://postgres.<PROJECT-REF>:<PW>@aws-0-eu-west-1.pooler.supabase.com:5432/postgres?sslmode=require`.
- Supabase's shared pooler requires user `postgres.<PROJECT-REF>`; plain `postgres` is the direct-connection user and fails auth on the pooler.
- Never reuse the app's `DATABASE_URL` for backups. It is `:6543` with `pgbouncer=true` (transaction pooler) because Prisma needs it, but Supabase does not support `pg_dump` through transaction pooling.

## Tried and ruled out
- The nightly failures 2026-11-13..18 were initially treated as a stale/rotated password. They were actually a wrong username in the GitHub secret. The log names the user: `FATAL: password authentication failed for user "postgres"`.
- The 2026-11-18 task plan recommended rotating to `:6543` + `pgbouncer=true`; that came from the app URL and is wrong for backups. Corrected in `docs/DEPLOYMENT.md`.

## Watch out
- Supabase recommends direct connections for pg_dump/restore, falling back to the session pooler on IPv4-only networks (GitHub Actions cannot reach the IPv6-only direct host).
- Percent-encode reserved characters in the DB password inside a URI (`&`, `#`, `?`, `@`, space).
- Repeated auth failures can trip Supavisor `Circuit breaker open` or an IP ban; those present as different errors than `28P01`.
- After fixing the secret, verify with `gh workflow run db-backup` and check the uploaded `db/YYYY/MM/DD/*.pgc.age` key in R2.
