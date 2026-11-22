# Modern Web Guidance — Audit Report (Maison Titrit)

> Generated from `npx modern-web-guidance@latest legacy-scan .` on the `develop` baseline.
> Static analysis is provisional — findings verified against Keep/Drop criteria before action.
> No code changes applied during this integration task.

## 1. Scope & method

- Scanned repository root, excluding docs/tests by default.
- 38 guides evaluated with deterministic rules; 6 modernization opportunities found across 3 guides.
- Priorities: storefront components → checkout/cart → shared UI → backoffice → a11y/perf hotspots.

## 2. Findings

### F1 — Icon color via chained CSS filters (2 findings)

- **Files:** `web/src/app/globals.css:519`, `web/src/app/globals.css:533`
- **Rule:** `.dark .titrit-logo-mark` and hover variant chain `filter: invert(...) sepia(...) saturate(...) hue-rotate(...)`.
- **Recommendation:** Modernize to CSS mask icons (`mask: url(...)`) + `background-color: currentColor`, or inline SVG with `fill="currentColor"`. Improves theming and reduces filter cost.
- **Risk:** Low — visual parity must be verified in light/dark.
- **Effort:** Small. Keep if the filter is used to recolor a logo; drop if applied to photos/avatars.

### F2 — IME-unsafe Enter handling (3 findings)

- **Files:** `web/src/components/admin/categories-client.tsx:144`, `web/src/components/admin/customers-table-client.tsx:60`, `web/src/components/admin/fulfilment-queue-client.tsx:154`
- **Rule:** `keydown` listeners checking `e.key === "Enter"` without `e.isComposing` / `e.keyCode === 229` guard, breaking CJK IME input.
- **Recommendation:** Add `if (e.isComposing || e.keyCode === 229) return;` before handling Enter. Low-risk, high-correctness.
- **Risk:** Low.
- **Effort:** Trivial.

### F3 — Array copy + sort (1 finding)

- **File:** `web/src/lib/products.ts:12`
- **Rule:** `[...(p.images ?? [])].sort(...)` should use `toSorted()` (ES2023).
- **Recommendation:** Replace with `(p.images ?? []).toSorted((a,b) => a.position - b.position)`. Requires Baseline check (toSorted is Baseline 2023).
- **Risk:** Low; verify target browsers support.
- **Effort:** Trivial.

## 3. Keep/Drop decisions

| Finding | Decision | Notes |
|---|---|---|
| F1 icons filter | Keep (migrate) | Visual parity check required |
| F2 IME Enter | Keep (fix) | Accessibility/correctness |
| F3 toSorted | Keep (fix) | Baseline 2023; verify browser matrix |

## 4. Out of scope / not scanned

- Docs and test files skipped (use `--include-docs-and-tests` to audit).
- ~80% of the guidance corpus not covered by deterministic rules; manual review recommended for new components.

## 5. Recommended next steps

1. Fix F2 (IME) — trivial, correctness.
2. Fix F3 (toSorted) — trivial, modernization.
3. Migrate F1 (icon filter) — small, visual verification needed.
4. Track as dedicated issues, not bundled into this tooling PR.