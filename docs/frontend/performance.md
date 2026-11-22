# Performance — Maison Titrit

## 1. Targets (75th percentile, field data authoritative)

- LCP ≤ 2.5s, INP ≤ 200ms, CLS ≤ 0.1 (backoffice `/makteb/*` LCP ≤ 3.0s).
- Source: Vercel Speed Insights / CrUX. Lab (Lighthouse) is diagnostic.

## 2. Budgets

See `docs/performance-budgets.md` for route-level budgets and the Lighthouse CI snippet.

## 3. Guardrails in place

- `next/image` for storefront/admin; product hero paints immediately for LCP.
- Fonts via `<link>` with `display=swap` + preconnect (no `next/font/google`).
- GTM/GA4 deferred (`lazyOnload`); consent-gated.
- SW: static cache-first, navigations network-first; private routes never cached.
- Hero brand intro loader removed (was 3.2s main-thread blocker).
- `reactStrictMode: false` (intentional; revisit).

## 4. Enforcement (planned)

- Remove `continue-on-error` from Lighthouse CI or replace with explicit field-data gate (TODO M12).
- Bundle-size check in CI (fail on regression beyond threshold).
- Image priority audit: ensure LCP image has `priority`/`fetchPriority="high"`.
- Avoid long main-thread tasks; break up heavy work.

## 5. Rejected scope

- No Redis for perf monitoring; no new analytics vendor; no brand redesign for metrics.