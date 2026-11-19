# Consolidated Plan: Ads & Storefront Progress — 2026-11-18

**Repo:** maison-titrit-prod (Next.js 16 / React 19.3.1 / Bun)  
**Branch:** `feature/2026-11-18-ads-and-storefront-plan` (production = `main`)  
**Verified production deployment:** `dpl_4rvmdZ6BuCwZ99V5E6thhpKRsy9n` (commit `86152df`, PR #81 merged)  
**Other branches:** `develop` (integration, PR #82 `feature/admin-shell-lint-clean` → `develop`, head `a7fdb96`), `main` (prod, auto-deploy)  

---

## 1. Client Enablement (Read-Only — no client Google/Meta account edits this session)

### 1.1 Product / Inventory Management Teaching
- Teach the 14 seeded products (all currently `inStock: false`) how to sync with the product feed.
- Emphasize the discrepancy: **feed declares 3 products `in_stock` (MT-SAHAR, MT-ETOILE, MT-ROYAL)** while the seed data shows `false` → homepage/feed inconsistency must be fixed.
- Walk through price/size/material drafts in `web/src/config/products.ts`.

### 1.2 Google Sheets Inventory Template
- Build a reusable Google Sheet: one row per product, columns:
  `id | name | code | category | price | size | material | stock_qty | in_stock_flag | last_scan | notes`
- Provide a CSV export link + column guide (see §1.3).
- Seed rows for the 14 products; mark the 3 feed-in_stock rows as `true` once corrected.

### 1.3 WhatsApp / Facebook Catalogue Templates
- WhatsApp product sheet (product name, SKU, price, stock status, images).
- Facebook Commerce feed spec (product card JSON, UTM params `titrit-attr`).
- **No edits to client Google/Meta accounts** — these are deliverables only.

### 1.4 GMB Video Recording
- User is at the local store recording Google My Business video. Not a tool action; noted for the client visit.

---

## 2. Outreach: "Templates + Handoff First (Recommended)"

- **Do NOT touch** any client Google Workspace or Meta (Facebook) accounts in this session.
- Deliver handoff assets (Section 1.3 + one-page inventory SOP) to the client.
- Verify all 3 catalogue templates are attached to the right channels before sending.

---

## 3. Code Work Streams (autopilot via subagents / `subagent`)

All work runs on the current branch `feature/2026-11-18-ads-and-storefront-plan`.

### 3.1 Codebase
- `[run]` `bun run dev:web` (Next dev :3000)  
- `[lint]` `bun run lint` → 0 errors / 0 warnings  
- `[build]` `bun run build` (next build)  
- `[test]` `cd web && bun test`  
- PR #82 (`feature/admin-shell-lint-clean` → `develop`, head `a7fdb96`) stays **open/clean**; merge only after `verify` + Vercel checks succeed.  
- Fix duplicate gallery thumbnail keys in `web/src/components/maison/product-gallery.tsx:57` (P2, PR #82).

### 3.2 UX / UI & Layout
- Apply vintage Amazigh design system palette in `web/src/app/globals.css`:
  - Cream `#F4EAD5`, Ink `#1C1A17`, Bronze `#9A6A3A`, Terracotta `#B0532F`, Henna `#6B2D1F`.
- Fonts from Google Fonts `<link>` in `web/src/app/layout.tsx` — **never** `next/font/google` (TurboPack bug).  
- New routes go through `buildPageMetadata`.  
- Private pages (`/panier`, `/checkout`, `/compte`, `/auth/*`, `/makteb`) remain **noindexed**.  
- Product gallery component fixes (PR #82).

### 3.3 PageSpeed Mobile Performance (LCP / FCP / Bloat)
- Run PageSpeed report: `https://pagespeed.web.dev/analysis/https-maisontitrit-com/hl4smxk2od?hl=en&form_factor=mobile`
- Focus: image/font/JS reduction, lazy loading, critical CSS.
- Tools: **Lightspeed** + other devtools; measure LCP, FCP, CLS, TTFB.

### 3.4 Analytics Verification
- GTM `GTM-P64TT34B` loads correctly.  
- GA4 consent mode: default → update works; UTM first-touch capture `titrit-attr` works.  
- `view_item` fires with correct item/price per product.  
- **Meta Pixel unconfigured** → needs `META_CAPI_ACCESS_TOKEN`, `META_PIXEL_ID`, `GA_API_SECRET` env vars.  
- Mount logic in `web/src/app/api/track/route.ts` (server-side Meta CAPI + GA4 Measurement Protocol) gated by consent.  
- Consent store in `web/src/lib/analytics.ts` (UTM attribution, ecommerce events).

### 3.5 Sentry.io Integration
- Evaluate/implement Sentry on the feature branch; decide provider, event filters, and alert rules. (Tooling evaluation — see §5.)

### 3.6 Infra Checks
- **CDN / Workers / Backups**: Cloudflare DNS, Vercel workers, Supabase R2 lifecycle.  
- Nightly `db-backup` (`.github/workflows/db-backup.yml`: pg_dump + age + R2) — verify success & R2 backup age.  
- Terraform codifies Cloudflare DNS (`terraform.tfstate`, `terraform.tfvars` gitignored).  
- Rotate `BACKUP_DATABASE_URL` (pooler `:6543`, `?pgbouncer=true&connection_limit=1`) — user-gated irreversible action.  
- Google OAuth env vars missing on 2026-11-14 (`GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`); current state **unverified** → resolve before rerunning `db-backup`.

---

## 4. Monitoring & Observability

- Dashboard runtime errors limited to ~24h ago (PR #82 cleanup).  
- Vercel runtime errors: 7 days total, **Google OAuth error group 43× (2026-11-14)**, none in last 24h.  
- Health advisors clean; Security advisors (RLS no-policy on `_prisma_migrations`, SECURITY DEFINER callable) present.  
- 2 unindexed FKs causing performance issues.  
- PR #82 clean: `verify` ✅, Vercel checks ✅, mergeable `clean`, 1 open Codex P2 note (duplicate gallery thumbnail keys).

---

## 5. Gates & Acceptance Criteria

| # | Criterion | Status |
|---|-----------|--------|
| A1 | PageSpeed mobile: LCP, FCP, CLS targets met (from report) | ⬜ pending audit |
| A2 | GTM tag `GTM-P64TT34B` loads; GA4 consent default→update; UTM `titrit-attr` first-touch | ⬜ pending verification |
| A3 | `view_item` fires correct item/price per product; no stray `fbq` in browser (Pixel unconfigured) | ⬜ pending pixel setup |
| A4 | Feed consistency: 3 products (`MT-SAHAR`, `MT-ETOILE`, `MT-ROYAL`) marked `in_stock`; 14/14 seeds reviewed | ⬜ pending feed/homepage fix |
| A5 | Duplicate keys fixed in `product-gallery.tsx:57` (PR #82 P2) | ⬜ pending |
| A6 | `bun run lint` 0/0, `tsc --noEmit -p web` clean, `bun run build`, `cd web && bun test` all green | ⬜ pending |
| A7 | PR #82 open/clean, head `a7fdb96`, mergeable `clean` | ✅ verified (head a7fdb96, PR #81 merged dpl…) |
| A8 | Sentry.io installed & firing | ⬜ pending |
| A9 | CDN, backups, workers verified (Cloudflare/R2/Supabase) | ⬜ pending |
| A10 | No "ads ready" claim until catalogue, checkout, and tracking verified | ⬜ pending |

---

## 6. Desktop Agent Coordination (other sessions)

Session inventory (6):
- `ses_e11396a8bffepj3FD3ZQ8OjqNZ` — orchestration, busy
- `ses_e1edd886fffeInbx4S6j2lmAMg` — PINNED, idle
- `ses_e14d79115ffe6lDzs4NiZbuNIE` — "Fix remaining Biome errors", idle
- `ses_e1eddcbc0ffd1B12hOROtGSCHv` — "Review request", idle
- `ses_e1aabbdfcffe2GZuNvOY7MKGzk` — "Set up project MCPs", idle
- `ses_e2581a0f8ffeKcqxkGe3jOcsdI` — "Supabase Auth documentation digest", idle

**Channel discovery result:** No working `session.send` / `session.create` / message tool was surfaced by `search_capabilities` (OpenWork Cloud / OpenWork namespaces). Therefore **desktop agents (DeepAI, OpenCode, Kiro, OpenKnowledge desktop / OK with KB `0brain`) are outside this workspace and unreachable from here**.

**Plan:** Execute the above tracks via `subagent` / `session.create` where possible; fall back to manual handoff once a channel is established. Report that desktop agents were not reachable.

---

## 7. Parallel Execution Triggers (to launch)

1. **PageSpeed audit** — mobile LCP/FCP, image/font/JS bloat (Lightspeed).  
2. **Analytics verification** — GTM mounts, GA4 purchase event, Meta Pixel install path.  
3. **Sentry integration** on feature branch.  
4. **Infra checks** — Cloudflare cache/workers, R2 lifecycle, backup restore test, OAuth env vars.  
5. **Client handoff assets** — Google Sheets inventory CSV + column guide, WhatsApp catalogue product sheet, Facebook Commerce feed spec, one-page inventory SOP (FR/AR/EN).  
6. **PR #82 finalization** — fix duplicate gallery keys, ensure `develop` clean, prepare merge to `main`/`develop` (only after gates).

---

## 8. Next Steps (after review)

- [ ] Review PageSpeed report; apply fixes; re-run.  
- [ ] Configure Meta Pixel (`META_PIXEL_ID`, `META_CAPI_ACCESS_TOKEN`, `GA_API_SECRET`).  
- [ ] Resolve Google OAuth env vars (`GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`).  
- [ ] Implement Sentry.io.  
- [ ] Restore nightly `db-backup` (R2 age test).  
- [ ] Push `docs/plans/2026-11-18-ads-and-storefront-plan.md` to `feature/2026-11-18-ads-and-storefront-plan` (committed).  
- [ ] Open PRs for code changes; **do not merge to `main`/`develop`** — wait for acceptance criteria.  
- [ ] Send client handoff (templates + SOP) — read-only, no account edits.
