# Accessibility, Mobile UX and Core Web Vitals Audit

**Issue:** #127 — Validate storefront accessibility, mobile UX and Core Web Vitals
**Parent:** #114 (Production readiness)
**Status:** Findings documented; critical-path fixes applied
**Audited:** Storefront (FR default + AR RTL + EN) and `/makteb` backoffice
**Date:** 2026-11-21

## Methodology

- Reviewed key flows at mobile breakpoints (375px / 768px / 1024px) and realistic network conditions.
- WCAG 2.2 AA-oriented checks: keyboard operability, focus visibility, labels, color contrast, error messaging, screen-reader announcements.
- Verified FR/AR/EN rendering and RTL layout (`dir="rtl"` on `<html>` when `locale === "ar"`).
- Contrast ratios computed against the locked brand palette (cream `#F4EAD5`, ink `#1C1A17`, bronze `#9A6A3A`, terracotta `#B0532F`, henna `#6B2D1F`).
- WCAG AA thresholds: 4.5:1 for normal text, 3:1 for large text (≥18.66px or ≥14px bold) and non-text UI components.

## Contrast ratio reference (computed)

| Foreground | Background | Ratio | AA normal (4.5:1) | AA large (3:1) |
|------------|------------|-------|-------------------|----------------|
| ink `#1C1A17` | cream `#F4EAD5` | 14.53:1 | Pass | Pass |
| henna `#6B2D1F` | cream | 8.70:1 | Pass | Pass |
| terracotta `#B0532F` | cream | 4.26:1 | **Fail** | Pass |
| bronze `#9A6A3A` | cream | 3.91:1 | **Fail** | Pass |
| cream on ink | — | 14.53:1 | Pass | Pass |

**Implication:** `bronze` and `terracotta` text at **normal size** (< ~14px bold / < ~18.66px) on a cream background fails WCAG AA. These are used for small labels, captions and secondary links across the storefront and backoffice. Large text and decorative icons pass.

## Findings

Each finding includes route, device/viewport, reproduction steps and severity.

### 1. Checkout success not announced to screen readers (P2)

**Route:** `/checkout` (success state)
**Device/viewport:** Mobile 375px / Desktop 1024px, all locales
**Reproduction:** Complete a COD order; the page replaces the form with `CheckoutSuccess`. The new heading ("Commande confirmée") is not exposed to screen readers — no `aria-live` region and no focus move.
**Severity:** P2 — screen-reader users cannot perceive that the order was created.
**Status:** Fixed — `CheckoutSuccess` section now has `aria-live="polite" aria-atomic="true"` and the decorative check icon is `aria-hidden`.

### 2. Checkout error message contrast (P2)

**Route:** `/checkout`
**Device/viewport:** Mobile 375px
**Reproduction:** Submit checkout with an invalid/unavailable item; the server returns an error rendered with `text-terracotta` at `text-sm` (regular) on a near-cream background. Ratio 4.26:1 < 4.5:1 → fails AA for normal text.
**Severity:** P2 — error text may be unreadable for low-vision users.
**Status:** Fixed — error text changed to `text-ink` (14.53:1).

### 3. Cart total label contrast (checkout + panier) (P2)

**Route:** `/checkout`, `/panier`
**Device/viewport:** Mobile 375px
**Reproduction:** The cart total label uses `text-bronze` at `text-[0.66rem]` (~10.6px) on cream. Ratio 3.91:1 < 4.5:1 → fails AA for normal text.
**Severity:** P2 — label may be hard to read for low-vision users.
**Status:** Fixed — label changed to `text-ink` on both routes.

### 4. Checkout / panier "continue shopping" link contrast (P2)

**Route:** `/checkout`, `/panier`
**Device/viewport:** Mobile 375px
**Reproduction:** The secondary "continue shopping" link uses `text-bronze` at `text-[0.62rem]` (~10px) on cream. Fails AA normal text.
**Severity:** P2 — low contrast secondary link.
**Status:** Fixed — link changed to `text-ink` on both routes.

### 5. Small bronze/terracotta labels across storefront and backoffice (P2, documented)

**Routes:** `/blog`, `/blog/[slug]`, `/auth/verify`, `/produit/[ref]`, `/makteb/*` (admin shell, dashboard, orders, products, customers, settings, integrations, fulfilment, team, contact-support, map-section, hero, product-card, product-purchase, contact-social, legal-page, about, craft-band, etc.)
**Device/viewport:** Mobile 375px / Desktop 1024px
**Reproduction:** Numerous small labels, captions, badges and secondary links use `text-bronze` or `text-terracotta` at `text-[0.5rem]`–`text-[0.75rem]` on cream backgrounds. All fail AA normal text (bronze 3.91:1, terracotta 4.26:1 < 4.5:1).
**Examples:** `admin-shell.tsx` breadcrumb, `dashboard-client.tsx` stat labels, `customer-360-client.tsx` status labels, `orders-table-client.tsx` status chips, `product-card.tsx` size/color labels, `hero.tsx` eyebrow text, `legal-page.tsx` definition terms, `contact-support-page.tsx` section labels.
**Severity:** P2 — affects low-vision readability across many pages.
**Status:** Fixed — all normal-size `text-bronze`/`text-terracotta` on cream backgrounds changed to `text-ink` across storefront and `/makteb`. Remaining `text-bronze`/`text-terracotta` occurrences are decorative icons (non-text, pass 3:1) or `text-bronze-light` on dark backgrounds (appropriate contrast).

### 6. Decorative icons & hover-only states (P3, informational)

**Routes:** Multiple
**Reproduction:** `AmazighStar`, `Truck`, `Calendar`, `Phone`, `Mail`, `MapPin` icons use `text-terracotta`/`text-bronze`. As non-text UI components they require 3:1 — both pass (4.26:1 / 3.91:1). Purely decorative icons carry no contrast requirement. `hover:text-terracotta` hover states are transient and not independently tested.
**Severity:** P3 — no change required.
**Status:** No action.

### 7. Keyboard operability — checkout (P1, verified)

**Route:** `/checkout`
**Device/viewport:** Mobile 375px / Desktop 1024px, keyboard only
**Reproduction:** Tab through the checkout form. All fields have explicit `<Label htmlFor>` associations; all buttons show `focus-visible:ring-2` rings; the submit button disables during loading; error messages use `role="alert" aria-live="assertive"`.
**Severity:** P1 — critical path must be keyboard-operable.
**Status:** Verified — no changes required. Form labels, focus rings, loading state and alert announcements are in place.

### 8. Keyboard operability — navigation (P1, verified)

**Route:** `/` and all storefront pages + `/makteb`
**Device/viewport:** Mobile 375px (hamburger `Sheet`) / Desktop 1024px
**Reproduction:** Tab through the site header. The mobile menu trigger button has `aria-label`; the `Sheet` dialog traps focus and returns focus on close; nav links show focus rings; skip link (`SkipLink`) targets `#main-content`.
**Severity:** P1 — primary navigation must be keyboard-operable.
**Status:** Verified — no changes required.

### 9. Skip link / landmark (P2, verified)

**Route:** All pages using `(site)` layout
**Device/viewport:** Mobile 375px
**Reproduction:** Activate the skip link; focus moves to `<main id="main-content">`. The `<main>` uses `tabIndex={-1}` and `outline-none`, but the global `:focus-visible` rule (`outline: 2px solid var(--ring)`) supplies the visible indicator.
**Severity:** P2 — skip link is a key screen-reader affordance.
**Status:** Verified — no changes required.

### 10. RTL / locale behavior (P2, verified)

**Routes:** Storefront + `/makteb` with `locale=ar` (`dir="rtl"`)
**Device/viewport:** Mobile 375px
**Representation:** `<html lang={locale} dir={dir}>`; mobile menu opens from the correct side (`side={dir === "rtl" ? "left" : "right"}`); the back arrow uses `rtl:rotate-180`; dictionaries contain FR/AR/EN strings including `a11y.skipToContent`.
**Severity:** P2 — Arabic RTL is a core market requirement.
**Status:** Verified — no changes required.

### 11. Service worker / offline (P3, informational)

**Route:** All public routes
**Reproduction:** `sw.js` caches static assets and navigations; private routes (`/api/`, `/makteb`, `/compte`, `/checkout`, `/panier`, `/auth`) are excluded from caching so no authenticated or checkout data is stored offline.
**Severity:** P3 — offline behavior is resilient and private data is never cached.
**Status:** No change required.

### 12. PWA manifest (P3, informational)

**Route:** All
**Reproduction:** `/site.webmanifest` defines `name`, `short_name`, `start_url`, `scope`, `display: standalone`, `background_color`, `theme_color`, and maskable icons (192/512). Linked from `<head>`.
**Severity:** P3 — installability is in place.
**Status:** No change required.

## Follow-up remediation (not brand redesign)

The contrast failures in finding #5 have been resolved: all normal-size `text-bronze`/`text-terracotta` on cream backgrounds were changed to `text-ink` using the existing locked palette. No brand redesign was performed.

All contrast findings above have been remediated. No remaining normal-text `text-bronze`/`text-terracotta` on cream backgrounds.

## Performance budgets

See [`docs/performance-budgets.md`](performance-budgets.md) for route-level LCP/INP/CLS budgets and the CI check.

## Acceptance criteria status

| Criterion | Status |
|-----------|--------|
| Findings include route, device/viewport, reproduction and severity | Done (this document) |
| Critical checkout and navigation flows keyboard-operable | Verified (findings #7, #8) |
| Performance budgets documented and CI enforces failures | Lighthouse CI in `.github/workflows/ci.yml` fails the build on budget regression; field CWV via Vercel Speed Insights is the release gate |

## Rejected scope

- No redesign of the brand system or palette (locked by design-system convention).
- No new colors introduced; all fixes use existing `ink`/`cream` tokens.
- No CMS or second backend introduced.
