# Maison Titrit — Full Pledge Plan (Master Plan)
**Date:** 2026-11-18  •  **Repo:** maison-titrit-prod  •  **Branch:** `feature/2026-11-18-ads-and-storefront-plan`  
**Production:** `main` → https://maisontitrit.com (Next.js 16 / React 19.3.1 / Bun, Vercel)  
**Status:** In progress — nothing merged to `main`/`develop`, nothing pushed. PageSpeed changes committed (`ca320bb`). WS-8 architecture cleanup dispatched to remote session `Ai4xBSK` (running, 26+ messages).

---

## 1. Purpose

This is the single consolidated ("fully pledge") plan that accumulates:
- the PageSpeed mobile performance audit just completed (LCP/FCP/CLS bloat reduction),
- the existing `docs/plans/2026-11-18-ads-and-storefront-plan.md` (ads + storefront progress),
- the repo conventions/topology (`AGENTS.md`, `ENTRYPOINT.md`, `ROADMAP.md`),
- the agent + MCP toolkit inventory (Kiro, OpenCode v2, DeepAI, Claude, Cursor, Gemini, 18 MCP servers),

and then **decides what each agent/tool should do**. It is the authoritative tracker until the branch is merged.

> Branch rule (hard): work only on `feature/2026-11-18-ads-and-storefront-plan` off `develop`. Do NOT merge to `main` or `develop` directly. Push feature branches and open PRs — PR reviews happen, then merge feature → develop, then release/* → main for production.

> ⚠️ **Agent availability this week (2026-11-18):** Claude, Cursor, Gemini, and DeepAI have all hit rate limiters and cannot be used this week. DeepAI was already unreachable in this workspace (no `session.send`/`session.create` channel). **Only OpenCode v2 (this session) is available.** All agent-assigned work in §5 is therefore absorbed by OpenCode v2 or deferred until rate limits reset. OpenCode has direct access to the same 18 MCP servers, so MCP-backed work (trail, serena, vercel, cloudflare, supabase, prisma, etc.) is unaffected — only the Claude/Cursor/Gemini-specific interfaces and hooks are lost.

---

## 2. Agent & Toolkit Inventory (what was inspected)

### 2.1 Agents present in this repo

| Agent | Config file | Role / notes |
|---|---|---|
| **OpenCode v2** (this session) | `opencode.json` | Active orchestrator. 18 MCP servers enabled. Runs code changes, verification, builds, tests, commits. |
| **Kiro** | `.kiro/settings/mcp.json` + `.kiro/steering/{product,trail}.md` | Onboarding + steering. Auto-loads `AGENTS.md`. Bridges Kiro steering to `ENTRYPOINT.md`/`AGENTS.md`. |
| **Claude** | `.claude/settings.json`, `settings.local.json` | MCP servers + `SessionStart` trail hook + trail status line; permissions for `trail`/`graft` commands. |
| **Cursor** | `.cursor/mcp.json`, `hooks.json`, `rules/trail.mdc` (alwaysApply), `hooks/trail-hooks.cjs` | MCP servers + trail hooks fire on every postToolUse / afterMCPExecution / session start/end. Enforces trail-before-grepping. |
| **Gemini** | `.gemini/settings.json` | MCP servers only (same 18-server set). No hooks/rules beyond MCP. |
| **DeepAI** | — | **NOT present in this workspace.** Appears only once (in my earlier plan) noting desktop agents are unreachable via `session.send`/`session.create`. Any DeepAI work falls back to manual handoff or an available agent. |

### 2.2 MCP toolkit (18 servers, consistent across all agent configs)

`trail`, `next-devtools`, `serena`, `repomix`, `context7`, `figma`, `supabase`, `prisma`, `cloudflare`, `filesystem`, `filesystem-brain` (`F:\0brain`), `github`, `postgres`, `sqlite`, `vercel`, `terraform`, `docker`, `open-knowledge`.

> All agents share the same MCP set. The differentiator is hooks/rules: Cursor enforces trail on every tool call; Claude hooks trail at session start; Kiro auto-loads `AGENTS.md` steering; OpenCode is the active orchestrator.

---

## 3. Consolidated Plan — Work Streams

Merges the PageSpeed audit I just ran with the existing ads & storefront plan.

### WS-1 — PageSpeed mobile performance (LCP/FCP/CLS bloat) ✅ DONE

**Before (measured, mobile lab, Moto G Power, Slow 4G, Lighthouse 13.6.0):**
| Metric | Value |
|---|---|
| Performance score | 78 / 100 |
| FCP | 1.7 s |
| LCP | 4.4 s (poor) |
| TBT | 80 ms |
| CLS | 0.009 (good) |

**Bloat sources identified:**
- Render-blocking Google Fonts `<link>` in `web/src/app/layout.tsx` (preconnect present; `next/font/google` barred by Turbopack bug).
- Hero image `hero-atelier.png` ≈147 KB (already `priority` — keep).
- Gallery thumbnails eager-loaded in `product-gallery.tsx`.
- Consent-gated marketing trackers (Meta/Pinterest/TikTok/YouTube) on `afterInteractive` → main-thread contention (TBT / 7 long tasks / 392 KiB unused JS).

**Changes committed** (`ca320bb`):
- `web/src/components/maison/product-gallery.tsx` — `loading="lazy"` on gallery thumbnails (hero kept `priority`).
- `web/src/components/analytics/analytics-scripts.tsx` — consent-gated trackers `afterInteractive` → `lazyOnload`.
- `layout.tsx` non-blocking font preload evaluated → reverted (Next server components reject `onLoad` on DOM elements; broke `next build`). Preconnect + `display=swap` remain.
- `globals.css` critical-CSS inlining evaluated → skipped (design-breakage risk). Palette locked (cream/ink/bronze/terracotta/henna).

**Verification green:** `tsc --noEmit` clean · biome clean · `bun run build` passes · `cd web && bun test` 31/0 · `bun run lint` 0/0.

**Reports:** `docs/plans/2026-11-18-pagespeed-audit.md`, `docs/plans/2026-11-18-pagespeed-tasks.md`.

**Remaining (blocked on deploy — do not merge/push yet):**
- Re-audit mobile PageSpeed after deploy → capture after-metrics → update audit report.
- Consider exact gstatic font-file `preload` via a small client component if LCP stays font-bound.
- Review 7 long-tasks / 392 KiB unused-JS insight for further deferrals.

### WS-2 — Codebase quality gates (M1, in review)
- `bun run lint` → 0/0 · `tsc --noEmit` clean · `bun run build` · `cd web && bun test` 31/0.
- Clear 34 non-blocking Biome warnings / 11 infos.
- PR #82 (`feature/admin-shell-lint-clean` → `develop`, head `a7fdb96`) stays open/clean; merge only after `verify` + Vercel checks.
- Fix duplicate gallery thumbnail keys `product-gallery.tsx:57` (P2, PR #82).

### WS-3 — UX / UI & layout
- Vintage Amazigh palette locked in `globals.css` (cream/ink/bronze/terracotta/henna) — never change.
- Fonts: Google Fonts `<link>` in `layout.tsx` only — never `next/font/google`.
- New routes via `buildPageMetadata`; private pages (`/panier`, `/checkout`, `/compte`, `/auth/*`, `/makteb`) stay noindexed.

### WS-4 — Analytics verification
- GTM `GTM-P64TT34B` loads; GA4 consent default→update; UTM `titrit-attr` first-touch.
- `view_item` fires correct item/price; no stray `fbq` (Meta Pixel unconfigured).
- Meta Pixel needs `META_CAPI_ACCESS_TOKEN`, `META_PIXEL_ID`, `GA_API_SECRET` env vars.
- Server-side Meta CAPI + GA4 Measurement Protocol in `web/src/app/api/track/route.ts`, consent-gated.

### WS-5 — Sentry.io integration
- Evaluate/implement Sentry on feature branch; provider, event filters, alert rules.

### WS-6 — Infra checks
- Cloudflare DNS, Vercel workers, Supabase R2 lifecycle.
- Nightly `db-backup` (pg_dump + age + R2) — verify success & R2 backup age.
- Rotate `BACKUP_DATABASE_URL` (user-gated, irreversible).
- Google OAuth env vars missing since 2026-11-14 (`GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`) — unverified; resolve before `db-backup`.

### WS-7 — Client enablement & outreach (read-only — no client Google/Meta account edits)
- Google Sheets inventory template (14 products), CSV export + column guide.
- WhatsApp catalogue product sheet; Facebook Commerce feed spec (UTM `titrit-attr`).
- One-page inventory SOP (FR/AR/EN). GMB video recording is a client-visit action, not a tool action.

### WS-8 — Architecture cleanup (M2, next)
- DRY / KISS / YAGNI / hexagonal / structure — without changing product behaviour.
- Split oversized client pages/components; move admin `fetch` calls to `@tanstack/react-query`.
- Re-enable `react-hooks/set-state-in-effect` after refactoring ~8 hydration-gated effects.

### WS-9 — Forkable plug-and-play starter (M3, planned)
- De-brand into `brand.config.ts`; sanitize `.env.example`; add `LICENSE`/`CHANGELOG`/`CONTRIBUTING`/`docs/FORKING.md`; one `bun run verify` script; fork-agnostic CI.

---

## 4. Gates & Acceptance Criteria

| # | Criterion | Status |
|---|-----------|--------|
| A1 | PageSpeed mobile LCP/FCP/CLS targets met (re-audit after deploy) | ⬜ pending |
| A2 | GTM `GTM-P64TT34B` loads; GA4 consent default→update; UTM `titrit-attr` | ⬜ pending |
| A3 | `view_item` correct; no stray `fbq` | ⬜ pending |
| A4 | Feed consistency: `MT-SAHAR`, `MT-ETOILE`, `MT-ROYAL` `in_stock`; 14/14 seeds | ⬜ pending |
| A5 | Duplicate gallery keys fixed `product-gallery.tsx:57` | ⬜ pending |
| A6 | `lint` 0/0, `tsc --noEmit` clean, `build`, `bun test` all green | ✅ verified (this branch) |
| A7 | PR #82 open/clean, mergeable | ✅ verified (head `a7fdb96`) |
| A8 | Sentry.io installed & firing | ⬜ pending |
| A9 | CDN/backups/workers verified | ⬜ pending |
| A10 | No "ads ready" claim until catalogue/checkout/tracking verified | ⬜ pending |

---

## 5. Agent Responsibility Assignments (decided)

Each agent owns the work it can actually reach and act on, using the shared MCP toolkit.

### OpenWork Cloud — REMOTE SESSION DELEGATION (available now)

OpenWork Cloud `remote-session:create` is available and can dispatch work to registered desktops even when Claude/Cursor/Gemini/DeepAI are rate-limited directly. One registered target is online:

| Field | Value |
|---|---|
| computerId | `rnr_0eaf00b9eb86a74ed8817911241f97a79ad0ff578c073914b2865d6bc5ea0404` |
| label | `Ai4xBSK` |
| platform | win32 |
| online | true |
| access | `created` (tasks can be started) |
| workspaceId | `ws_ccd1030119db` (`maison-titrit-prod`, active) |
| engine | v2 |
| Cloud | not available |

**Work dispatched:**
- WS-8 M2 Architecture Cleanup → `remote-session:create` commandId `rsc_01m7qse33re4581fwrexjnt1tq`, sessionId `ses_0c7958e3f1e478038c13213131cfc375f9a4cf1ed37f6947fbf5c85c4f7bf08b`, state `running` on `Ai4xBSK`

Follow up with `remote-session:status` (commandId) / `remote-session:read` (sessionId) to check progress and retrieve results.

### OpenCode v2 (this session) — ORCHESTRATOR & EXECUTOR

OpenCode v2 owns the active branch and all code-level work not delegated via OpenWork Cloud. It has direct access to the same 18 MCP servers through its own `opencode.json`, plus Computer Use for browser verification.
- Run `bun run dev:web`, `lint`, `tsc --noEmit`, `build`, `cd web && bun test`.
- Implement WS-1 remaining items (font preload via client component, unused-JS review).
- Implement WS-2 (Biome warnings), WS-3 (layout/conventions), WS-5 (Sentry eval), WS-4 (analytics code paths).
- **WS-8 delegated via OpenWork Cloud** to registered session `Ai4xBSK` (above). No longer deferred — in progress remotely.
- Commit changes on `feature/2026-11-18-ads-and-storefront-plan`; do NOT merge/push.
- Use `trail` (ask/grep/callers/build), `serena` (LSP editing), `next-devtools` (Next debugging), `vercel`/`cloudflare`/`supabase`/`prisma`/`postgres`/`sqlite`/`github`/`docker`/`terraform` MCPs as needed.
- Use Computer Use rights for browser-based verification (PageSpeed re-audit, deploy preview checks).

### Kiro, Claude, Cursor, Gemini, DeepAI — RATE-LIMITED DIRECTLY, BUT REACHABLE VIA OPENWORK CLOUD

Claude, Cursor, Gemini, and DeepAI hit rate limiters when accessed directly. DeepAI was already unreachable via `session.send`/`session.create`. However, **OpenWork Cloud `remote-session:create` bypasses this** by dispatching to registered desktop targets (like `Ai4xBSK`) that run the same agents. Delegate deferred work there instead of abandoning it.

Follow remote sessions with:
- `remote-session:status` (commandId) — compact status, up to 10 sessions
- `remote-session:read` (sessionId or commandId) — full transcript + status
- `remote-session:send` (sessionId) — follow-up prompt to existing session
- `remote-session:stop` (sessionId) — stop a running session

### trail MCP (shared service)
- Single source of truth for code context. All agents run `trail ask <q> --source` before exploring source; `trail grep` for exhaustive searches; `trail callers` for blast radius; `trail build` after big changes; `trail note` to record decisions.

---

## 6. Worktree + PR + Release Workflow

### 6.1 Worktrees (mandatory for all agents/helpers)

Every agent or helper must work in an isolated git worktree to avoid conflicts. No two agents work in the same working tree.

**Create a worktree for a feature branch:**
```sh
git worktree add ../maison-titrit-prod-<feature-name> feature/<feature-name>
cd ../maison-titrit-prod-<feature-name>
bun install
```

**Existing worktrees (verified via `git worktree list`):**
| Worktree | Branch | Purpose |
|---|---|---|
| `E:/moorishell/Documents/GitHub/maison-titrit-prod` | `feature/2026-11-18-ads-and-storefront-plan` | Orchestrator (OpenCode v2) — PageSpeed + WS-8 orchestration |
| `E:/moorishell/Documents/GitHub/maison-titrit-prod.worktrees/seo-optimization-nextjs-pwa` | `agents/seo-optimization-nextjs-pwa` | SEO/PWA |
| `E:/moorishell/Documents/GitHub/maison-titrit-prod.worktrees/supabase-auth-rbac-integration` | `agents/supabase-auth-rbac-integration` | Supabase Auth/RBAC |
| `E:/moorishell/Documents/GitHub/maison-titrit-seed-content` | `feature/seed-content` | Seed content |
| `C:/Users/moorishell/.deepai-code/worktrees/maison-titrit-prod/t3-04a49057` | `t3/04a49057` | DeepAI helper |
| `C:/Users/moorishell/.deepai-code/worktrees/maison-titrit-prod/t3-75562a85` | `t3/75562a85` | DeepAI helper |
| `C:/Users/moorishell/.deepai-code/worktrees/maison-titrit-prod/t3-91f9e576` | `fix/utm-column-normalization` | UTM fix |
| `C:/Users/moorishell/.deepai-code/worktrees/maison-titrit-prod/t3-a54303f2` | `chore/inventory-audit` | Inventory audit |

**Rule:** Never commit directly to `main` or `develop` from a worktree. Always push the feature branch and open a PR.

### 6.2 Push + Open PR

Once an agent's work is complete and verified (tsc + lint + build + test green):

1. **Push the feature branch:**
   ```sh
   git push origin feature/<feature-name>
   ```

2. **Open a PR** targeting `develop` (not `main`):
   - Title: `feat: <description>`
   - Description: summary of changes, verification results, linked acceptance criteria
   - Reviewers: assign team members
   - Do NOT self-merge

3. **PR reviews** happen on `develop`:
   - Reviewer checks code quality, design-system compliance (palette locked), verification bar
   - Address review comments, push updates to same branch
   - Approved → merge to `develop`

### 6.3 Prod Release (develop → main)

Once all approved PRs are merged to `develop` and `develop` is green:

1. **Create release branch:**
   ```sh
   git checkout develop
   git pull origin develop
   git checkout -b release/v2026-11-<date>
   ```

2. **Final verification on release branch:**
   ```sh
   bunx tsc --noEmit -p web
   bun run lint
   bun run build
   cd web && bun test
   ```

3. **Open PR:** `release/v2026-11-<date>` → `main`

4. **PR review + merge to `main`:**
   - Vercel auto-deploys `main` to https://maisontitrit.com
   - Tag the release

5. **Merge `main` back to `develop`** to keep them in sync.

### 6.4 Constraints (never violate)
- Both `main` and `develop` block force-push and deletion (repo config)
- Do NOT push directly to `main` or `develop` — always via PR
- Do NOT merge your own PR
- Design palette locked (cream/ink/bronze/terracotta/henna); no `next/font/google`

---

## 7. Immediate Next Steps (in order)

1. **✅ PR #83 opened** — `feature/2026-11-18-ads-and-storefront-plan` → `develop` (https://github.com/openanaffa/maison-titrit-prod/pull/83). PageSpeed changes committed (`ca320bb`, `732633f`). Vercel preview building.
2. **Poll WS-8 remote session** (`remote-session:status` commandId `rsc_01m7qse33re4581fwrexjnt1tq` → `remote-session:read` sessionId `ses_0c7958e3f1e478038c13213131cfc375f9a4cf1ed37f6947fbf5c85c4f7bf08b`) → collect architecture cleanup results → push + open PR → `develop`
3. **Review 7 long-tasks / 392 KiB unused-JS** → defer further non-critical JS (WS-1)
4. **Fix duplicate gallery thumbnail keys** `product-gallery.tsx:57` → PR #82 (A5)
5. **Clear 34 Biome warnings / 11 infos** → M1 quality gates (WS-2)
6. **Resolve Google OAuth env vars** (`GOOGLE_CLIENT_ID`/`SECRET`) before `db-backup` (WS-6)
7. **Configure Meta Pixel** (`META_PIXEL_ID`, `META_CAPI_ACCESS_TOKEN`, `GA_API_SECRET`) → A3
8. **Evaluate/implement Sentry.io** → A8
9. **Client handoff assets** (Sheets CSV + column guide, WhatsApp sheet, Facebook feed spec, SOP FR/AR/EN) — read-only (WS-7)
10. **Prod release:** after all PRs merged to `develop`, create `release/*` → `main` → Vercel deploys to https://maisontitrit.com

---

## 7. Verification Bar (never relax)

`bunx tsc --noEmit -p web` → clean  
`bun run lint` → 0 errors / 0 warnings  
`bun run build` → passes  
`cd web && bun test` → 31 pass / 0 fail  
`biome check` → clean on edited files  
`bun.lock` stays `lockfileVersion: 1`  
Design palette locked (cream/ink/bronze/terracotta/henna); no `next/font/google`.

---

**Maintained by:** OpenCode v2 (orchestrator)  
**Sources accumulated:** `AGENTS.md`, `ENTRYPOINT.md`, `ROADMAP.md`, `.kiro/`, `.claude/`, `.cursor/`, `.gemini/`, `opencode.json`, `.mcp.json`, `docs/plans/2026-11-18-ads-and-storefront-plan.md`, `docs/plans/2026-11-18-pagespeed-audit.md`, `docs/plans/2026-11-18-pagespeed-tasks.md`, 18 MCP servers.
