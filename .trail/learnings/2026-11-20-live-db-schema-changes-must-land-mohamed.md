---
title: Live DB schema changes must land as tracked idempotent SQL migrations
author: Mohamed
date: 2026-11-20
branch: develop
id: l-379df1a5
scope: repo
status: active
src: agent
touches:
  - "web/src/app/api/admin/delivery-zones/[id]/route.ts"
  - web/src/app/api/admin/delivery-zones/route.ts
  - web/src/components/admin/dashboard-client.tsx
---

## Decided
Any schema change reaching the live Supabase DB via `prisma db push` must be mirrored by an idempotent SQL migration in `supabase/migrations/` in the same PR (see `supabase/migrations/20261126000000_order_delivery_and_notifications.sql` — the OrderNotification/Order delivery columns DDL). Migration files need unique version prefixes — two files sharing `20261123000000` was renamed to `20261123200000` before Supabase CLI adoption (no supabase_migrations schema exists live, verified 2026-11-19).
## Tried and ruled out
Applying migrations with the transaction-pooler URL (6543, pgbouncer) — prepared-statement errors; use the session pooler 5432 with pgbouncer params stripped, via `bunx prisma db execute --schema=prisma/schema.postgres.prisma --file ...`.
## Watch out
`ADD CONSTRAINT` is not idempotent in Postgres — wrap FK adds in a `DO $$ IF NOT EXISTS (pg_constraint...) $$` block so migrations replay safely against a DB that already received the db push.
