# Performance Budgets — Core Web Vitals

**Issue:** #127 — Validate storefront accessibility, mobile UX and Core Web Vitals
**Parent:** #114 (Production readiness)
**Status:** Documented; CI check planned
**Applies to:** Storefront (public) and `/makteb` (backoffice), mobile-first

## Measurement approach

- **Field data (primary):** Vercel Speed Insights / Chrome UX Report (CrUX) at the 75th percentile. This is the authoritative source for Core Web Vitals and is used for release gating.
- **Lab data (diagnostic, CI where practical):** Lighthouse / `next build` output and local mobile-emulation checks. Lab results diagnose regressions; they do not replace field data.

Per the roadmap guardrail, no Redis or additional infra is added solely for performance monitoring.

## Route-level budgets

| Route | LCP | INP | CLS | Notes |
|-------|-----|-----|-----|-------|
| `/` (home) | ≤ 2.5s | ≤ 200ms | ≤ 0.1 | Hero image is the LCP candidate; paints immediately via `next/image` + fetch priority |
| `/produit/[ref]` | ≤ 2.5s | ≤ 200ms | ≤ 0.1 | Product gallery + purchase form |
| `/panier` | ≤ 2.5s | ≤ 200ms | ≤ 0.1 | Cart drawer, no layout shift after first paint |
| `/checkout` | ≤ 2.5s | ≤ 200ms | ≤ 0.1 | Critical commerce path; form must stay stable during loading |
| `/makteb/*` | ≤ 3.0s | ≤ 200ms | ≤ 0.1 | Backoffice; relaxed LCP due to data-heavy tables |
| `/auth/*` | ≤ 2.5s | ≤ 200ms | ≤ 0.1 | Sign-in entry point |

**Threshold definitions (web.dev / Chrome):**
- LCP: ≤ 2.5s good, ≤ 4.0s needs improvement, > 4.0s poor
- INP: ≤ 200ms good, ≤ 500ms needs improvement, > 500ms poor
- CLS: ≤ 0.1 good, ≤ 0.25 needs improvement, > 0.25 poor

## Existing performance guardrails (already in place)

- Fonts: Google Fonts `<link>` with `display=swap` (no `next/font/google` due to Turbopack bug); preconnect to `fonts.googleapis.com` / `fonts.gstatic.com`.
- Images: `next/image` for storefront and admin; product hero paints immediately for LCP.
- Hero: brand intro loader removed (was a 3.2s main-thread blocker).
- Cart/checkout: GTM/GA4 deferred to `lazyOnload`; consent-gated analytics; no render-blocking marketing pixels.
- Service worker: static assets cache-first; navigations network-first; private routes (checkout, account, makteb) never cached — no misleading offline inventory/checkout guarantees.
- PWA: `site.webmanifest` with `display: standalone`, theme/background colors matching the brand palette.

## CI check (where practical)

A lightweight CI step is added to `.github/workflows/ci.yml` that fails the build if a Lighthouse CI run (thresholds below) regresses on the key routes. Where running a full Lighthouse server is not practical in CI, the build itself is the gate: `next build` must succeed and the route-level LCP candidates (hero image, checkout form) must not regress in bundle size.

Suggested Lighthouse CI thresholds (`.lighthouserc.cjs`):

```js
module.exports = {
  ci: {
    collect: {
      numberOfRuns: 3,
      url: [
        "http://localhost:3000/",
        "http://localhost:3000/produit/[ref]",
        "http://localhost:3000/checkout",
        "http://localhost:3000/panier",
      ],
    },
    assert: {
      assertions: {
        "categories:performance": ["error", { minScore: 0.9 }],
        "LCP": ["error", { minScore: 0.9 }],
        "CLS": ["error", { minScore: 0.9 }],
        "INP": ["error", { minScore: 0.9 }],
      },
    },
  },
};
```

**Release gate:** A route is "good" only when field data (CrUX/Speed Insights) at the 75th percentile meets all three thresholds. Lab CI is a regression guard, not a substitute for field data.

## Rejected scope

- No Redis added for performance monitoring (roadmap guardrail: only when a measured requirement exists).
- No new analytics vendor; existing consent-gated GTM/GA4 + Sentry are reused.
- No redesign of the brand system to improve metrics.
