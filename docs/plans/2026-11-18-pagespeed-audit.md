# PageSpeed audit — 2026-11-18 (mobile)

**Target:** https://maisontitrit.com (mobile)
**Report URL:** https://pagespeed.web.dev/analysis/https-maisontitrit-com/hl4smxk2od?hl=en&form_factor=mobile
**Lab conditions:** Emulated Moto G Power, Slow 4G, Lighthouse 13.6.0, single page load, captured 2026-11-18 13:48 UTC.
**Branch:** `feature/2026-11-18-ads-and-storefront-plan` (not merged to main/develop, not pushed).

## Before — measured metrics

| Metric | Value | Rating |
|---|---|---|
| Performance score | 78 / 100 | — |
| First Contentful Paint (FCP) | 1.7 s | +9 (needs work) |
| Largest Contentful Paint (LCP) | 4.4 s | +10 (poor) |
| Total Blocking Time (TBT) | 80 ms | +30 |
| Cumulative Layout Shift (CLS) | 0.009 | good |
| Speed Index (SI) | 6.4 s | +4 |

No CrUX/field data was available ("No Data" for real-user experience).

## Top bloat sources

### 1. Render-blocking resources (→ FCP/LCP)
The Google Fonts `<link rel="stylesheet">` in `web/src/app/layout.tsx` (HEAD) blocks the first paint until `fonts.googleapis.com` returns the CSS. `rel="preconnect"` to `fonts.gstatic.com` is already present, but the stylesheet itself is render-blocking. `display=swap` is set, so text stays readable in a fallback; the block is the CSS round-trip on Slow 4G.

### 2. Images (→ LCP, "Improve image delivery" est. 93 KiB)
- Hero image `web/public/images/maison-titrit/hero-atelier.png` = ~147 KB PNG. It is the LCP candidate and already uses `next/image` with `priority` (correct — keep eager).
- Gallery thumbnails in `web/src/components/maison/product-gallery.tsx` were loaded eagerly (non-critical, below-the-fold swatch images).

### 3. Third-party / analytics JS (→ TBT, 7 long tasks, "Reduce unused JavaScript" est. 392 KiB)
`web/src/components/analytics/analytics-scripts.tsx` mounts GTM, GA4 (gtag), Meta Pixel, Pinterest Tag, TikTok Pixel, and YouTube tracker on/near the main thread. GTM and GA4 already used `lazyOnload`; the consent-gated marketing pixels (Meta, Pinterest, TikTok, YouTube) used `afterInteractive`, contending with initial load despite being gated behind marketing consent (granted after load/interaction anyway).

### 4. Fonts
Six Google Fonts families (Cinzel, Allura, Cormorant Garamond, Jost, Marcellus, Playfair Display, Noto Sans Tifinagh) via `<link>` in `layout.tsx` (the required approach — `next/font/google` is avoided due to a known Turbopack import-map bug). No `preload` on font files; fonts load after the stylesheet. Design palette untouched (cream/ink/bronze/terracotta/henna in `globals.css`).

## Changes made

### `web/src/components/maison/product-gallery.tsx`
- Added `loading="lazy"` to the gallery thumbnail `next/image` components (non-critical swatch images). The main product image keeps `priority` so the LCP hero image is unaffected.

### `web/src/components/analytics/analytics-scripts.tsx`
- Deferred the consent-gated, non-critical marketing trackers from `strategy="afterInteractive"` to `strategy="lazyOnload"`: Meta Pixel, Pinterest Tag, TikTok Pixel (src + init), YouTube tracker. GTM and GA4 were already `lazyOnload`. These scripts only fire after marketing consent is granted anyway, so loading them after `window.load` reduces main-thread contention during initial page load (TBT / long tasks) with no analytics data loss for consented events.

### `web/src/app/layout.tsx` (evaluated, no net change)
- Attempted a non-render-blocking font stylesheet (`rel="preload" as="style"` + `onLoad` flip to `stylesheet`). Reverted: Next.js server components disallow event-handler props (`onLoad`) on DOM elements in the root layout, breaking `next build`. Preconnect to `fonts.googleapis.com`/`fonts.gstatic.com` and `display=swap` remain in place. A clean font-file `preload` would require the exact gstatic woff2 URLs (UA-dependent) and/or a new client component — scoped out to keep this change minimal and build-safe.

### `web/src/app/globals.css` (evaluated, no change)
- Inlining critical CSS was considered but rejected: the design tokens and base styles are bundled by Tailwind/Next; extracting and inlining above-the-fold CSS risks duplication, flash, and design-system breakage. Palette and vintage Amazigh style are preserved.

## Verification

All run from repo root:
- `bunx tsc --noEmit -p web` — clean
- `bun run biome:check` (edited files) — clean
- `bun run lint` — 0 errors / 0 warnings
- `bun run build` — passes
- `cd web && bun test` — 31 pass, 0 fail

## Before / After metrics

| Metric | Before (measured) | After | Notes |
|---|---|---|---|
| Performance | 78 | TBD | Re-audit after deploy |
| FCP | 1.7 s | TBD | Non-blocking font path reverted; image/JS wins expected to help |
| LCP | 4.4 s | TBD | Hero image kept `priority`; thumbnails now lazy |
| TBT | 80 ms | TBD | Consent-gated trackers deferred to `lazyOnload` |
| CLS | 0.009 | TBD | No layout-shift-inducing changes |

**After numbers are not yet measurable** because this branch is intentionally not pushed/deployed (per task instructions). The Lighthouse lab re-audit should be re-run against the deployed preview/production URL after merge to capture real after values. Direction of improvement: lower TBT (fewer main-thread tasks during load), lower LCP/FCP contribution from non-critical images and trackers; CLS expected to stay ~0 (no layout-shift changes, palette/fonts unchanged).

## Files changed

- `web/src/components/maison/product-gallery.tsx` — `loading="lazy"` on gallery thumbnails
- `web/src/components/analytics/analytics-scripts.tsx` — consent-gated trackers `afterInteractive` → `lazyOnload`

No design palette, typography, or vintage Amazigh styling was altered. `next/font/google` was not reintroduced (Turbopack bug) — fonts remain a Google Fonts `<link>` in `layout.tsx`.
