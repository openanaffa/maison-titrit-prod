# Accessibility — Maison Titrit (WCAG 2.2 AA)

## 1. Targets

- WCAG 2.2 AA for storefront and `/makteb`.
- Semantic HTML before ARIA.
- Keyboard-only operability, visible focus, dialog focus trap + restore.
- Accessible form validation + error announcements.
- Correct heading hierarchy; sufficient contrast in light/dark.
- Touch targets ≥ 44px; reduced-motion and forced-colors support.

## 2. Baseline (verified)

See `docs/a11y-cwv-audit.md`. Verified: skip link, focus rings, checkout keyboard operability, nav Sheet focus trap, RTL, `aria-live` on checkout/cart/product states.

## 3. Open gaps

1. **Contrast**: `bronze` (3.91:1) and `terracotta` (4.26:1) fail AA for normal text on cream. ~40 instances across ~30 files (finding #5). Remediation: swap normal-size text to `text-ink`/`text-cream`, or bump to large text. Priority routes: `/blog`, `/makteb/*`, `/produit/[ref]`, `/auth/*`, `/`, `/contact`, legal pages.
2. **Forced-colors**: no support anywhere. Plan `@media (forced-colors: active)`.
3. **Reduced motion**: only `.reveal` (CSS) and `motifs.tsx` matchMedia. Audit framer-motion call sites.
4. **aria-live**: only 7 sites; add for async state changes (cart updates, toasts already via sonner).
5. **Automated tests**: no axe in CI. Add `@axe-core/playwright` checks on key routes (TODO M6).

## 4. Rules

- Never add ARIA without understanding semantics.
- Prefer native elements (`<button>`, `<dialog>`, `<details>`).
- Focus indicators: global `:focus-visible` outline 2px `--ring`; do not remove without replacement.
- Dialogs: Radix Dialog/Sheet already trap + restore focus; keep usage.
- Forms: `Label htmlFor`, `aria-invalid`, `aria-describedby` for errors; `role="alert"` for messages.

## 5. Testing

- Manual keyboard walkthrough on every new interactive component.
- axe automated checks in CI (planned).
- Screen-reader smoke (NVDA/VoiceOver) for critical flows: checkout, cart, nav, auth.