# Maison Titrit — Unfinished Tasks & Milestones Inventory

Consolidated from ROADMAP.md, PROGRESS.md, TODO.md (frontend standards), TODO_ENTITIES_REFACTOR.md, docs/DEPLOYMENT.md, docs/plans/*, a11y/CWV audit, and code TODOs. Last inventoried 2026-11-21.

## 1. Open GitHub issues

| Issue | Status | Remaining |
|---|---|---|
| #120 Inventory | Partial — CSV import PR #158 in review | Codex review → merge |
| #127 a11y/CWV | Partial — audit done | remaining contrast swaps (~40 instances), LHCI gate or field-data gate |
| #128 ops/recovery | Not met | restore drill, R2 recovery, correlation IDs, runbooks, Sentry routing |
| #92/#93 legal | Closed COMPLETED — re-verify | owner confirmations on identity/retention/policy facts |
| #96 SEO | Closed COMPLETED — cookie locale | document limitation, propose locale-URL strategy |
| #112/#114 epics | Open | close when P0s above close |

## 2. ROADMAP milestones

- M2 Architecture cleanup (in progress): /panier split, YAGNI dep audit, re-enable react-hooks/set-state-in-effect, DRY (19 admin fetch → react-query), KISS (split 3 page components + 4 oversized components), Hexagonal, Structure/domain grouping.
- M3 Forkable plug-and-play starter (planned): de-brand, bootstrap, packaging, fork docs, fork-agnostic CI, optionality.
- M4 Hardening & scale (backlog): test coverage, a11y pass, perf budgets, dependency cadence, Bun lock v1 revisit.

## 3. Blockers / decisions (PROGRESS §4)

- B-02 legal identity/retention — owner review (open).
- B-03 cookie-based locale not crawlable — owner decision (open).
- B-04 production release: develop/main diverged, 41 commits unreleased — release PR + human approval (not prepared).
- B-01, B-05 resolved.

## 4. Production Release Gate (PROGRESS §7) — unchecked

Production diff review, DB migration ordering, prod env vars, backup/restore readiness, security/RLS audit, changelog/release notes, deploy/rollback runbooks, final Codex review, human approval.

## 5. Frontend standards TODO (root TODO.md) — status

Done: M0 (audit), M1 (docs skeleton), M7 (PWA manifest/install/offline). Pending: M2 (tokens/Tailwind), M3 (component governance), M4 (contrast remediation), M5 (forced-colors/reduced-motion), M6 (axe + component tests), M8 (SW update UX), M9 (offline capabilities), M10 (notifications), M11 (modern Web APIs), M12 (perf enforcement), M13 (security/CSP), M14 (final docs).

## 6. Entities/types refactor (TODO_ENTITIES_REFACTOR.md)

Status contradictory: header says "inventory done, no code changed yet", but Phases 1–3 marked DONE with verification. Needs verification whether refactor actually landed.

## 7. Deployment checklist (docs/DEPLOYMENT.md) — 10 unchecked post-deploy items

Homepage/fonts, product detail, blog, /makteb redirect, sign-in/dashboard, image upload (R2), language switch RTL, robots.txt, sitemap.xml, feed.xml.

## 8. Plans with unchecked items

- docs/plans/2026-11-18-ads-and-storefront-plan.md (8): PageSpeed re-audit, Meta Pixel config, Google OAuth env, Sentry, restore nightly db-backup, push plan, open PRs, client handoff.
- docs/plans/2026-11-18-backup-r2.md (7): upload route 200, R2 URL, Vercel env, rotated BACKUP_DATABASE_URL, manual backup run, lifecycle, restore test.
- docs/plans/2026-11-18-pagespeed-tasks.md (4): re-audit mobile PageSpeed after deploy, gstatic preload, unused-JS review, merge to develop/main.

## 9. Accessibility audit follow-ups

- Finding #5: contrast swaps for bronze/terracotta normal-size text across ~30 files.
- Forced-colors mode: not supported anywhere.
- Reduced-motion: only .reveal + motifs.tsx matchMedia.
- No axe automation in CI.

## 10. Performance

- Lighthouse CI step is continue-on-error (advisory). Gate or explicit field-data gate pending.
- No bundle-size monitoring.
- LCP image priority audit pending.

## 11. Code TODOs

- web/src/i18n/legal-docs.ts:171 — confirm 7-day return/exchange window (owner).

## 12. a11y/perf doc follow-ups

- docs/performance-budgets.md — CI check planned (Lighthouse CI where practical).
- docs/a11y-cwv-audit.md — follow-up remediation tracked.

## Suggested priority order

1. P0 (release-blocking): #120 CSV import merge (#158), #127 contrast, #128 restore drill, production release gate (B-04).
2. P1 (quality): frontend standards M4/M5/M6 (contrast, forced-colors, axe), M8 (SW update UX), M12 (perf gate).
3. P2 (architecture): M2 cleanup (panier split, react-query migration, re-enable set-state-in-effect), verify entities refactor status.
4. P3 (starter): M3 forkable starter, M13 security (CSP), M10 notifications, M11 modern APIs.
5. Operational: deployment checklist, backup-r2 verification, PageSpeed re-audit, legal/SEO owner decisions (B-02, B-03).