# Maison Titrit — Roadmap

**Last updated:** 2026-11-21

This file is the plan. For conventions and topology read [`ENTRYPOINT.md`](ENTRYPOINT.md), for the current system read [`README.md`](README.md), for deployment read [`docs/DEPLOYMENT.md`](docs/DEPLOYMENT.md), and for *why* past choices were made read [`docs/history/worklog-ws2.md`](docs/history/worklog-ws2.md) (tasks 1–31).

## North star

1. Keep `maisontitrit.com` stable, fast and maintainable.
2. Make this repo a clean **plug-and-play starter** that another developer can fork, rebrand in one place, and ship their own storefront without touching Maison Titrit internals.

Here "PnP" means *plug and play*, not Yarn Plug'n'Play — see [Not planned](#not-planned).

## Status at a glance

| Milestone | State | Summary |
|---|---|---|
| M0 — Product build-out | ✅ Shipped | Tasks 23–31: backoffice, ecommerce, SEO/content, Supabase, Vercel, marketing. PR #80 → `develop`, PR #81 → `main`. |
| M1 — Quality gates | ✅ Shipped | PR #82 merged to `develop` (and released via #131/#139/#145): Biome 2.6.8, hooks, CI, LSP fixes all active. |
| M2 — Architecture cleanup | 🔄 In progress | First pass landed with PR #83: shared React Query hooks (`web/src/hooks/api/`), repository layer (`web/src/lib/repositories/`), page/component splits. Still open: `/panier` split, YAGNI dependency audit, re-enabling `react-hooks/set-state-in-effect`. |
| Commerce roadmap (issues #111–#128) | ✅ Delivered — review queue drained 2026-11-22 | Delivered and merged to `develop`: variants #115, ledger #116, transactional checkout #117, order lifecycle #118, delivery zones #119 (ADRs 0001–0005), fulfilment queue #121, customer 360 #122, E2E suite #126 (#151), inventory workspace #120 + CSV import (#152, #158), a11y/CWV #127 — contrast fixed + CWV CI gate live (#153, #162), monitoring/backup-runbooks #128 — Sentry configs, correlation IDs, restore drill, runbooks, ADR-0006 (#161). Tooling: modern-web-guidance + Chrome DevTools MCP (#159), PWA M7 install/offline UX (#160). Automated WhatsApp messaging (#113, #123–#125) is closed as Not planned — the Wafine integration was intentionally removed in PR #156 (unofficial API; account-ban risk). Staff notifications are email-only (Brevo); storefront wa.me links remain customer-initiated. Remaining from #128: execute the restore drill (R3 below). |
| M3 — Forkable plug-and-play starter | 📋 Planned | De-brand, zero-secret bootstrap, packaging, fork docs, fork-agnostic CI. |
| M4 — Hardening & scale | 🗓️ Backlog | Test coverage (now 59 tests), a11y, perf budgets, dependency cadence. |

## M0 — Product build-out ✅

Shipped in `docs/history/worklog-ws2.md`:

- **Task 23** — backoffice, auth, RBAC (`/makteb`, FOUNDER/ADMIN/MANAGER).
- **Task 24** — cart, `/panier`, COD checkout + WhatsApp, client accounts, `/compte`.
- **Task 26** — robots, sitemap, Merchant feed, `llms.txt`, blog, announcement bar.
- **Task 28** — production-ready: env-driven SQLite→Postgres and local→R2 swaps, full deploy runbook.
- **Task 29** — Supabase Postgres wired (session pooler, eu-west-1), schema + seed verified.
- **Task 30** — Vercel-ready: build config, `postinstall` Prisma generate, TS errors cleared.
- **Task 31** — marketing readiness: OG/Twitter/canonical metadata, JSON-LD, consent-gated GA4 + Meta events, UTM attribution.
- **PR #80** — centralized vintage Tailwind roles/tokens, ~231 class-string replacements across 29 files, large components split (`66e0c2c` on `develop`); released to `main` via PR #81 (`86152df`).

## M1 — Quality gates ✅

- [x] Pin `@biomejs/biome@2.6.8` with Bun 1.3.14; `bun.lock` stays `lockfileVersion: 1`.
- [x] `biome.json` scoped to app source; `useButtonType` and `noImgElement` are errors; generated Supabase types excluded.
- [x] Format 248 files, resolve all remaining errors (real fixes where safe, documented `biome-ignore` for JSON-LD/analytics/shadcn).
- [x] Git hooks: `.githooks/pre-commit` (Biome on staged files), `.githooks/pre-push` (`tsc`). Install with `bun run hooks:install`.
- [x] `bun-types` / `node` added to web `tsconfig.json`; `useToast` re-subscription bug fixed.
- [x] CI workflow, CODEOWNERS, PR template, dependabot, `.editorconfig`, LF normalization.
- [x] PR #82 merged to `develop`; released to `main` via PRs #131/#139/#145.
- [ ] Remaining repo-wide Biome warnings are pre-existing and tracked; they do not block CI.

## M2 — Architecture cleanup ⏭️

Goal: resolve the debt listed in `AGENTS.md` **without changing product behaviour**.

**Branch state (2026-11-18):** the first pass landed on `feature/2026-11-18-ads-and-storefront-plan` (PR #83) — shared React Query hooks (`web/src/hooks/api/`), a repository layer (`web/src/lib/repositories/`), and splits of the checkout/signin pages and the oversized admin/product components. Still open: the `/panier` page split, the YAGNI dependency audit, and re-enabling `react-hooks/set-state-in-effect`.

- [ ] **DRY** — consolidate duplicated query/mutation logic; move the 19 client-side admin `fetch` calls onto the already-installed `@tanstack/react-query` with shared hooks.
- [ ] **KISS** — split the three whole-page client components (`app/checkout/page.tsx`, `app/panier/page.tsx`, `app/auth/signin/page.tsx`) into a server page + small client forms. Split oversized app components: `admin/product-form` (408 LOC), `admin/integrations-form` (337), `maison/product-purchase` (298), `admin/orders-table-client` (287). Leave vendored shadcn primitives (`ui/sidebar`, `ui/chart`) alone.
- [ ] **YAGNI** — audit unused dependencies and dead config; delete rather than keep "just in case".
- [ ] **Hexagonal** — pull data access out of components/route handlers into a repository/service layer with explicit ports; keep Prisma at the edge. One backend only (no CMS).
- [ ] **Structure** — replace scattered folders with feature/domain grouping (co-locate types, queries, schema and UI per feature).
- [ ] Re-enable `react-hooks/set-state-in-effect` in `web/eslint.config.mjs` after refactoring the ~8 hydration-gated effects to `useSyncExternalStore` / lazy initializers.
- [ ] Keep the design-system lock (cream / ink / bronze / terracotta / henna) and the `buildPageMetadata` / noindex / trilingual-dictionary conventions intact throughout.

**Exit criteria:** the AGENTS.md debt list is resolved, no new suppression without a written reason, and the full verification bar stays green.

## M3 — Forkable plug-and-play starter 📋

Goal: a fresh GitHub template clone boots with `bun install → cp .env.example .env → bun run dev:web`, and deploys to the fork owner's own Vercel/Supabase/R2 with **only** env vars and one brand config changed.

### 1. De-brand the template
- [ ] Extend `web/src/config/site.ts` into a single `brand.config.ts`: name, domain, emails, socials, logo, palette, locales, currency.
- [ ] Remove hard-coded Maison Titrit values from `globals.css`, `layout.tsx`, SEO/OG defaults, seed content, email + WhatsApp notification templates, robots/sitemap/feed, `terraform/*.tf` and `supabase/migrations/` role names.
- [ ] Sanitize `web/.env.example`: replace the real Supabase project ref, R2 bucket/CDN, founder email, social handles and analytics IDs with placeholders.
- [ ] Separate demo content/assets from brand assets so a fork starts with neutral placeholders.

### 2. Bootstrap without secrets
- [ ] Keep SQLite + local `/public/uploads` as the zero-config first-run path (already implemented).
- [ ] Add `bun run db:init`: generate client + `db push` + seed a small demo catalog. Today `seed:prod` targets Postgres only — make seeding provider-agnostic.
- [ ] Add a `bun run bootstrap` helper that writes `.env` from the template and prints the branding checklist.

### 3. Packaging & docs
- [ ] Add `LICENSE`, `CHANGELOG.md`, `CONTRIBUTING.md`.
- [ ] Add `docs/FORKING.md`: 10-minute local start, branding checklist, generic Supabase/R2/Vercel deploy, and how to pull upstream updates (`git remote add upstream …`).
- [ ] Move agent-local config (`.mcp.json`, `opencode.json`, `.serena/`, `.trail/`, editor MCP dirs, the `F:\0brain` reference) into an optional `docs/agent-setup/` section so forks are not tied to this machine.
- [ ] Rename packages from `maison-titrit-*` to neutral starter names and enable GitHub's **template repository** setting.

### 4. Fork-agnostic CI/CD
- [ ] Add one `bun run verify` script (`biome:ci` + `tsc` + `lint` + `test` + `build`) so forks have a single command.
- [ ] Ensure `.github/workflows/ci.yml` needs no org secrets and no Vercel-specific required checks.
- [ ] Parameterize any deploy workflow with repository variables instead of hard-coded project refs.

### 5. Optionality (YAGNI guard)
- [ ] Make auth/RBAC, analytics, WhatsApp and extra locales feature-flagged via env so a fork can start minimal, and document what can be safely deleted.

**Exit criteria:** someone with no access to this repo's secrets clones the template, rebrands it in one file, runs it locally in under 10 minutes, and deploys it to their own accounts using env vars alone.

## M4 — Hardening & scale 🗓️

- [ ] Expand coverage beyond the current 59 tests: checkout, auth/RBAC, i18n, storage provider selection; E2E suite (issue #126 — PR #151 in review).
- [ ] Accessibility pass on storefront + `/makteb` (keyboard paths, ARIA, contrast) — issue #127 (PR #153 in review; remaining contrast + CWV CI gate in PR #162).
- [ ] Monitoring & recovery — issue #128 (PR #161 in review: Sentry configs, correlation IDs, restore drill, runbooks, ADR-0006; drill must be **executed**, not just documented, before sign-off).
- [ ] Performance budgets + bundle audit; keep images on `next/image`.
- [ ] Dependency upgrade cadence for Next / React / Tailwind / Prisma; revisit the Bun 1.3 `bun.lock` v1 constraint once Vercel's build image ships Bun ≥ 1.4.
- [x] `trail` CLI works in this shell; run `trail build` after large structural changes.

## Next up — prepared milestone tasks

Distilled from `INVENTORY.md` (full inventory) and the PROGRESS.md reconciliation matrix. Ordered by execution readiness.

### R0 — Review & merge queue — ✅ DRAINED 2026-11-22
All queued PRs merged to `develop`: #158, #159, #160, #161, #162 (plus #131, #151, #152, #153 earlier the same day). This slot is now the standing rule for future work: every PR gets Codex review → threads resolved → CI green → squash-merge.

### R1 — Close the Wafine epic on GitHub (docs-only)
ROADMAP and PROGRESS record #113/#123–#125 as Not planned (decision in #156/#157), but GitHub issues #123 (blocked), #124, #125 are still open. Task: owner sign-off, then close all four as *Not planned* with a pointer to PR #156. Unblocks the M3 milestone slot in the issue tracker.

### R2 — Production release gate (B-04)
After the queue drains: release PR `develop` → `main` (41 commits unreleased), diff review vs main, migration ordering audit (supabase/migrations vs Prisma), Vercel env cleanup (WAFINE_* removal), changelog + release notes, final Codex review, human approval.

### R3 — #128 residual (after PR #161 merges)
**Execute** the restore drill for real (pg_dump → age → R2 → scratch DB), rotate `BACKUP_DATABASE_URL`, verify backup-r2 plan items (upload route 200, R2 URL, lifecycle policy), wire Sentry alert routing with owners.

### R4 — M2 architecture cleanup (next tasks)
From the M2 section below, first three: split `/panier` page, migrate the 19 admin `fetch` calls to React Query shared hooks, re-enable `react-hooks/set-state-in-effect` after refactoring the ~8 hydration-gated effects.

### R5 — M3 forkable starter (first tasks)
Extend `web/src/config/site.ts` into a single `brand.config.ts`, sanitize `web/.env.example`, add provider-agnostic `bun run db:init`. Full list in the M3 section.

## Not planned

- Reintroducing a CMS or a second backend — Strapi was removed in 2026-10.
- `next/font/google` — Turbopack bug; fonts stay as a Google Fonts `<link>`.
- Yarn PnP / `node_modules`-free installs — Bun workspaces, Prisma and Next 16 expect `node_modules`; it would fight the Vercel build.

## Decision log pointers

- Design decisions and task history: `docs/history/worklog-ws2.md`
- Conventions and verification bar: `AGENTS.md`, `ENTRYPOINT.md`
- Deployment and env vars: `docs/DEPLOYMENT.md`
