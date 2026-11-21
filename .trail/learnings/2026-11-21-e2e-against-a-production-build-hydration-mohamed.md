---
title: E2E against a production build; hydration-safe clicks; settlement key scoping
author: Mohamed
date: 2026-11-21
branch: develop
id: l-520143c8
scope: repo
status: active
src: agent
touches:
  - web/src/components/admin/marketing-client.tsx
---

## Decided

Run the Playwright E2E suite against a **production build** (`next build` + `next start`), never `next dev`: under parallel compiles, dev-mode hydration stalls and clicks land before React attaches handlers. For any app click in tests, wait for hydration deterministically by polling for the `__reactProps$` key react-dom sets on hydrated buttons (`waitForHydration` in web/e2e/helpers.ts).

## Watch out

- A pre-hydration click on the sign-in form falls through to the **native form submit**: the callbackUrl query is dropped, no session cookie is written, and the test loops on /auth/signin forever. Same class: add-to-cart is a lost no-op, cart ends up empty.
- The E2E harness found three real bugs beyond test bugs: (1) fulfilment queue read `window.location.search` during render — prod SSR crash (fixed with useSearchParams); (2) checkout never wrote the initial PENDING OrderStatusHistory row — audit trail started at the first transition; (3) reservation settlement searched `checkout:<orderKey>:reserve:` while stored keys are `<orderKey>:reserve:<i>` (the order key already carries the prefix) — stock was never released on cancel nor committed on delivery. All fixed in #151.
- BotID (`rejectBots`) only has signal on Vercel; guard it on `process.env.VERCEL` or a production build outside Vercel 403s every checkout.
- E2E local auth works because supabase-js sessions are cookies: browser and server derive the cookie name `sb-<host.split('.')[0]>-auth-token` from the same env URL, value is `base64-` + base64url(session JSON).
- The CI e2e job defers `supabase/migrations/` (they ALTER Prisma tables), pushes the Prisma schema, replays migrations, then grants anon/authenticated/service_role — see the `e2e` job in .github/workflows/ci.yml.
