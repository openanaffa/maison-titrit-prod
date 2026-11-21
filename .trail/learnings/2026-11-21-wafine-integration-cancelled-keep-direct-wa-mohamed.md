---
title: Wafine integration cancelled; keep direct wa.me links separate
author: Mohamed
date: 2026-11-21
branch: chore/verify-remaining-issues
id: l-7968586c
scope: repo
status: active
src: agent
touches:
  - docs/plans/2026-11-19-fix145-inventory-integrity.md
  - docs/plans/2026-11-19-issue121-fulfilment-queue.md
  - docs/plans/2026-11-19-issue122-customer-360.md
  - docs/plans/2026-11-20-issue126-e2e.md
  - web/.env.example
  - web/prisma/schema.postgres.prisma
  - web/prisma/schema.prisma
  - "web/src/app/api/admin/notifications/[id]/retry/route.ts"
  - web/src/components/admin/fulfilment-queue-client.tsx
  - web/src/i18n/dictionaries/lang/ar.ts
---

## Decided
Wafine was rejected because its WhatsApp automation does not use the official WhatsApp API. Close #113/#123/#124/#125 as Not planned, not completed. Remove server-side Wafine sends; keep user-initiated wa.me contact/order links distinct. Staff alerts and customer status updates remain email-only; historical WhatsApp notification rows are retained but must not be retried or counted as actionable failures. Update privacy wording so it accurately describes a user-initiated prefilled WhatsApp handoff.

## Tried and ruled out
Do not continue building the Wafine contract/tools/conversation lifecycle. Do not treat a wa.me deep link as the same thing as API messaging.

## Watch out
Removing application code does not clear Wafine credentials already configured in Vercel or other secret stores. Check all deployment environments and revoke unused credentials. Vercel CLI was unauthenticated in this environment, so production env state remained unverified. Existing `OrderNotification` WhatsApp records should remain as historical data unless a separately planned retention/migration change is approved.
