# Maison Titrit — Engineering & Release Progress

Last updated: 2026-11-21 20:10 UTC
Current phase: Phase 3 — P0 implementation (#120 CSV import → #127/#128) + docs sync
Overall status: IN PROGRESS

## Progress
- PRs inventoried: 6 / 6 relevant PRs at audit start (+#156 merged during audit, all merged/closed PRs reviewed)
- PRs reviewed by Codex: 6 / 6 relevant PRs (#151–#156 + docs-sync #157)
- PRs with actionable findings: 5
- Findings resolved: 17 / 17 (all threads resolved; final rounds clean)
- Review threads unresolved: 0
- CI passing: develop `b079432` (#157 docs sync merged; verify + e2e) ✅
- Open blockers: 2 (owner decisions) + 3 P0 workstreams
- Production release: NOT PREPARED

## 1. Overall status

Audit snapshot verified 2026-11-21 20:05 UTC:
- `develop` = `b079432` (#157 docs sync merged: Wafine env/ROADMAP reconciliation)
- `main` = `7a9b437`
- Default branch: develop
- Divergence: main is 15 commits behind / 41 commits ahead of merge-base — **diverged**, release requires a dedicated reconciliation PR (see Production Release Gate).
- CI on develop tip: success (verify + e2e).
- Vercel previews comment on all PRs; production auto-deploys from `main`.

## 2. PR tracking matrix

| PR | Title | State | In develop? | Codex review | Findings | Resolved | CI | Status |
|---|---|---|---|---:|---:|---:|---|---|
| #147 | Fulfilment queue & delivery operations (#121) | Merged | Yes | Complete (6 findings, fixed 268a1f8+35270e6) | 6 | 6 | Pass (at merge) | DONE |
| #148 | Inventory integrity: variant enforcement + settlement (#145) | Merged | Yes | Complete (1 finding) | 1 | 1 | Pass | DONE |
| #150 | Customer 360 & activity timeline (#122) | Merged | Yes | Complete (3 findings, fixed d28267c) | 3 | 3 | Pass | DONE |
| #151 | E2E suite (#126) | Merged | Yes | Complete (17 findings over 3 rounds, final round 0) | 17 | 17 | Pass | DONE |
| #152 | Inventory workspace (#120) | Merged | Yes | Complete (verified during merge; lint/typing fixed) | 3 | 3 | Pass | DONE |
| #153 | A11y audit + CWV budgets (#127) | Merged | Yes | Completed (merged after conflict rebase) | 0 new | 0 | Pass | DONE |
| #154 | Attribution UX, a11y landmarks, UTF-8 (#154) | Merged | Yes | Complete (3 rounds, final round 0) | 9 | 9 | Pass | DONE |
| #156 | Remove Wafine WhatsApp integration | Merged | Yes | Complete, 0 findings (`b21a2ad`) | 0 | 0 | Pass | DONE |
| #157 | Docs: ROADMAP/env reconciliation with Wafine removal (B-05) | Merged | Yes | Complete, 0 findings (`598e74c`) | 0 | 0 | Pass | DONE |
| #158 | Inventory CSV import (#120 remainder) | Open — awaiting Codex | No (PR open) | Requested (`@codex review`) | pending | — | Pass (verify+e2e) | IN REVIEW |
| #155 | Storefront+makteb revamp | Closed unmerged | No (superseded) | Complete (2×P1 + 1×P2 unresolved) | 3 | 0 | Pass | NOT APPLICABLE — superseded by #154; P1 Flight/content-type bug documented; storefront-only parts re-proposable |
| #149 | PostHog wizard | Closed unmerged | No | n/a (bot PR; verify failing: frozen lockfile + no deps installed) | 0 | 0 | Fail | NOT APPLICABLE — redundant with consent-gated GA4/Meta layer + Sentry |

Legacy background: #133–#146 (variants, ledger, transactional checkout, order lifecycle, delivery zones, release branches) all merged into both develop and main where applicable.

## 3. Codex findings log

All findings across #147–#156 were resolved in-cycle with threaded replies and re-reviews; final rounds had zero findings. Full per-finding history lives in the PR conversations. Notable resolutions:

| PR | Finding (abbreviated) | Severity | Decision | Fix | Status |
|---|---|---|---|---|---|
| #151 | Pre-hydration clicks lost (native form submit) | High | Fix | `waitForHydration` polls `__reactProps$` on buttons; suite moved to a production build | Resolved |
| #151 | Reservation settlement never matched keys (double prefix) | High | Fix | `activeReservations` scopes on `<orderKey>:reserve:` — stock now releases/commits | Resolved |
| #151 | rbac expectations / FR sign-in label / zone-less contract | Med | Fix | 401∪403 accepted; `Se connecter` regex; zone-less test rewritten to the enforced-zones contract | Resolved |
| #151 | supabase/setup-cli rate limits | Med | Fix | CLI via npx; auth smoke step added | Resolved |
| #152 | Delivery-zone permission silently widened (`orders:write`→`products:*`) | High | Fix during merge | Kept Prisma implementation, restored `orders:write` | Resolved |
| #154 | CSV formula injection | High | Fix | `csvCell` neutralization | Resolved |
| #154 | Source totals not filtered-consistent; substring test markers; focus not clamped | Med | Fix `f262180` | filtered aggregation, token boundaries, tabIndex clamp | Resolved |
| #153 | ci.yml conflict with develop e2e job | Med | Fix | Rebase keeping Lighthouse step + e2e job | Resolved |
| #156 | — | — | Clean review, 0 findings | — | Resolved |

## 4. Blockers and decisions

| ID | Blocker / decision | Impact | Required action / owner | Status |
|---|---|---|---|---|
| B-01 | Wafine removal is final (PR #156). Issues #113/#123–#125 closed **NOT_PLANNED** | Roadmap M3 cancelled | None — do not reopen | Closed by decision |
| B-02 | Legal identity/retention/policy facts require owner confirmation (#92/#93 closed as COMPLETED 2026-11-19 — claims need re-verification against current code) | Trust/compliance content | Owner/legal review | Open (audit pending, P1) |
| B-03 | Cookie-based locale selection is not crawlable per-URL (i18n/SEO, #96 closed COMPLETED) — no independent FR/AR/EN URLs exist | SEO | Owner decision on locale-URL migration | Open (audit pending, P1) |
| B-04 | Production release: develop↔main diverged; 41 commits unreleased incl. schema migrations + RBAC + Wafine removal env changes | Blocks release | Release-readiness report → release PR → human approval | Not prepared |
| B-05 | WAFINE_*/STAFF_WHATSAPP vars still present in `web/.env.example`; ROADMAP.md has stale M2/M3 status | Documentation drift | Docs-sync PR | **Resolved — PR #157 merged** (env example verified clean upstream + ROADMAP refreshed) |

## 5. Reconciliation matrix (Issue → AC → Implementation → PR → develop → main → Remaining)

| Issue | Acceptance criteria status | Implementation | PR(s) | In develop | In main | Remaining work |
|---|---|---|---|---|---|---|
| #115 variants | Met | ProductVariant + admin UI | #133 | ✅ | ⚠️ partially (via #139/#145 releases) | release sync |
| #116 inventory ledger | Met | StockMovement ledger, atomic movements | #135 | ✅ | ⚠️ | release sync |
| #117 transactional checkout | Met | Idempotent COD checkout | #137, #142 | ✅ | ✅ (#145 release) | — |
| #118 order lifecycle | Met | Validated transitions | #140 | ✅ | ⚠️ | release sync |
| #119 delivery zones | Met | Zones + quote service | #143 | ✅ | ⚠️ | release sync |
| #145 integrity | Met | Variant enforcement + settlement | #148 | ✅ | ✅ | settlement key bug found later fixed in #151 |
| #121 fulfilment | Met (email notifications after Wafine removal) | 6 queues + delivery fields + notification ledger | #147, #156 | ✅ | ❌ | release sync; WhatsApp retries removed per B-01 |
| #122 customer 360 | Met | Segments, 360 view, notes/consent, audits | #150 | ✅ | ❌ | release sync |
| #126 E2E | Met | 15 Playwright tests on prod-build + isolated Supabase | #151 | ✅ | ❌ | release sync |
| **#120 inventory** | **Partial** — CSV import in review | Stock table, actions, history, CSV export + **CSV import (PR #158)** | #152, #158 | ✅ (#158 pending review) | ❌ | Codex review → merge |
| **#127 a11y/CWV** | **Partial** — audit done; remaining contrast + Lighthouse gate | Contrast fixes + budgets + LHCI (suppressed) | #153 | ✅ | ❌ | **P0: remaining contrast, LHCI startup fix or explicit field-data gate** |
| **#128 ops/recovery** | **Not met** — backup creation only; no restore drill | Nightly encrypted backups to R2 (`db-backup.yml`) | — | ✅ | ❌ | **P0: restore drill, R2 recovery, correlation IDs, runbooks, Sentry routing** |
| #92/#93 legal | Closed COMPLETED — re-verify claims vs code/owner facts | Settings + legal pages + email templates | #136 | ✅ | ⚠️ | P1 audit; owner confirmations |
| #96 SEO | Closed COMPLETED — cookie locale, no per-locale URLs | Locale cookie + buildPageMetadata | pre-#136 | ✅ | ⚠️ | P1: document limitation, propose locale-URL strategy |
| #113/#123–#125 | NOT PLANNED (Wafine) | Removed by #156 | #156 | ✅ | ❌ | none — keep closed |
| #112/#114 epics | Open | — | — | — | — | close when P0s above close |

## 6. Verification evidence (Phase 1)

| Check | Command / workflow | Result | Evidence |
|---|---|---|---|
| Remote state | `git fetch` + `gh pr list` | Pass | develop `b079432`, main `7a9b437`; open PRs: #158 only |
| Develop CI | CI run on `a9032d3` | Pass | verify ✅ e2e ✅ |
| Issue states | `gh issue view` | Pass | #120 REOPENED, #127 OPEN, #128 OPEN, #113/#123–#125 NOT_PLANNED |
| Wafine removal | `grep WAFINE` across docs/code | Pass (post-#157) | `web/.env.example` clean; ROADMAP.md reflects M3 cancellation (#157) |

## 7. Production Release Gate

- [ ] All relevant PRs reconciled — ✅ (this matrix)
- [ ] All required Codex reviews completed — ✅ (#147–#156)
- [ ] All actionable findings resolved — ✅ (0 unresolved threads)
- [ ] No unresolved review threads — ✅
- [x] Full develop CI passing — ✅ (`b079432`)
- [ ] Production diff reviewed against main (15/41 diverged; release PR must reconcile main's release commits with develop)
- [ ] Database migrations reviewed and ordered (supabase/migrations vs Prisma schemas — audit pending)
- [ ] Production environment variables verified (WAFINE_* removal → Vercel env cleanup needed)
- [ ] Backup and restore readiness verified (restore drill pending — #128)
- [ ] Security and access controls checked (RLS migrations in diff — audit pending)
- [ ] Changelog and release notes updated (CHANGELOG updated by #156; release notes pending)
- [ ] Deployment and rollback procedures documented (DEPLOYMENT.md has restore sketch; runbooks pending — #128)
- [ ] Final Codex review completed (release PR)
- [ ] Human release approval obtained

Release recommendation: **HOLD** (P0s + release-readiness report first)
