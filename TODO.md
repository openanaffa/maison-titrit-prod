# TODO — Frontend Standards, Component Governance & PWA

> Sequential roadmap. Each milestone must pass the verification bar before the next begins.
> Verification bar: `bun run biome:check` + `bunx tsc --noEmit -p web` + `bun run lint` (0/0) + `bun run build` + `cd web && bun test`.

## M0 — Audit & baseline (done)

- **Status:** Complete (see chat audit report).
- **Deliverable:** This report; modern web guidance confirmed installed under `.agents/skills/`.

## M1 — Standards skeleton & component inventory (docs only)

- **Dependencies:** M0.
- **Scope:** Create `docs/frontend/*` (9 files) + this `TODO.md`.
- **Acceptance:** All 9 docs present and non-empty; links resolve.
- **Verification:** `bun run biome:check`.

## M2 — Design tokens & Tailwind conventions

- **Dependencies:** M1.
- **Scope:** Token table (done in design-system.md); document container-query adoption plan; logical-props convention; forced-colors plan.
- **Acceptance:** Conventions documented; at least one component migrated to container queries as proof-of-concept.
- **Verification:** verification bar.

## M3 — Component governance

- **Dependencies:** M1.
- **Scope:** Inventory of 57 primitives + maison/admin components (done); approved/prohibited patterns; cva centralization audit; wrapper convention for primitive edits.
- **Acceptance:** No new duplicate components; documented rationale for any primitive edit.
- **Verification:** verification bar.

## M4 — Accessibility remediation (contrast)

- **Dependencies:** M2.
- **Scope:** Mechanical `text-bronze`/`text-terracotta` → `text-ink` (or large-text) on normal-size text across ~30 files. Priority routes: `/blog`, `/makteb/*`, `/produit/[ref]`, `/auth/*`, `/`, `/contact`, legal.
- **Acceptance:** No normal-size bronze/terracotta text on cream; audit doc updated.
- **Verification:** verification bar + manual contrast check.

## M5 — Forced-colors & reduced-motion

- **Dependencies:** M4.
- **Scope:** `@media (forced-colors: active)` overrides; audit framer-motion for `prefers-reduced-motion`.
- **Acceptance:** Key flows usable in Windows high-contrast.
- **Verification:** verification bar + manual.

## M6 — Axe + component tests in CI

- **Dependencies:** M3.
- **Scope:** Add axe checks on key routes; component interaction tests for primitives; re-enable `react-hooks/set-state-in-effect` after refactoring 8 hydration-gated sites (or document why deferred).
- **Acceptance:** Axe passes on `/`, `/produit/[ref]`, `/checkout`, `/panier`, `/makteb`.
- **Verification:** verification bar + CI green.

## M7 — PWA manifest & install UX

- **Dependencies:** M1.
- **Status:** Complete — manifest enhanced (categories, shortcuts, lang/dir, icon purposes); `usePwaInstall` hook; `InstallPrompt` + `OfflineIndicator` components wired into root layout; `/offline` page; SW v2 with precache + offline fallback. Verification: tsc 0, lint 0, build 0, tests 76 pass.
- **Scope:** Enhanced manifest (screenshots, shortcuts, categories, lang/dir, icon variants); `beforeinstallprompt` handler; install button; iOS instructions; offline indicator.
- **Acceptance:** Installable per Lighthouse PWA; custom install prompt shown on supported browsers.
- **Verification:** verification bar + Lighthouse PWA audit.

## M8 — Service worker modernization

- **Dependencies:** M7.
- **Scope:** Decide Workbox/Serwist vs. keep manual; versioned rollout; update-available + reload UX; `controllerchange`; offline fallback page; sensitive-cache audit.
- **Acceptance:** Update flow works; offline fallback page shown when offline.
- **Verification:** verification bar + manual offline test.

## M9 — Offline capabilities

- **Dependencies:** M8.
- **Scope:** Offline info page; defined available/restricted matrix; revalidation on reconnect; no false success claims; pending-state UI for queued ops.
- **Acceptance:** Offline launch shows shell + info page; no checkout success while offline.
- **Verification:** verification bar + Playwright offline scenarios.

## M10 — Notifications architecture

- **Dependencies:** M8.
- **Scope:** Permission-aware in-app → browser → (optional) Web Push; VAPID server endpoints; subscription management; preferences; expiry handling. Email remains fallback.
- **Acceptance:** Permission requested only after user action; denied state respected; subscription CRUD works.
- **Verification:** verification bar + manual permission scenarios.

## M11 — Selective modern Web APIs

- **Dependencies:** M1, M8.
- **Scope:** Evaluate View Transitions, Popover API, BroadcastChannel, Credential Management/Passkeys; feature-detect + fallback + documented decision per API.
- **Acceptance:** Each evaluated API has a documented decision in `browser-api-support.md`.
- **Verification:** verification bar.

## M12 — Performance enforcement

- **Dependencies:** M4, M8.
- **Scope:** Lighthouse gate (remove `continue-on-error` or explicit field-data gate); bundle-size check; image priority audit.
- **Acceptance:** Lighthouse passes on key routes in CI or field-data gate documented.
- **Verification:** verification bar + Lighthouse CI.

## M13 — Security hardening

- **Dependencies:** M8, M10.
- **Scope:** CSP + Permissions-Policy headers; trusted types where practical; offline-storage PII audit; token storage review.
- **Acceptance:** CSP deployed without breaking app; no secrets in client storage.
- **Verification:** verification bar + security review.

## M14 — Final documentation & report

- **Dependencies:** all.
- **Scope:** Complete `docs/frontend/*`, final report, definition-of-done verification.
- **Acceptance:** All definition-of-done items met.
- **Verification:** full verification bar + CI green.