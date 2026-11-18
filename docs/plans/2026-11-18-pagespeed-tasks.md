# PageSpeed audit — task plan (2026-11-18)

Tracks the mobile LCP/FCP/CLS bloat reduction work for https://maisontitrit.com on branch `feature/2026-11-18-ads-and-storefront-plan`.

## Status
- **In progress** — audit complete, minimal changes committed, verification green.  
- **Not deployed** — branch intentionally not merged to main/develop and not pushed (per task instructions).

## Tasks

### Completed
- [x] Fetch & analyze mobile PageSpeed report (LCP 4.4 s, FCP 1.7 s, CLS 0.009, score 78)
- [x] Identify top image/font/JS bloat sources across layout.tsx, analytics-scripts.tsx, product-gallery.tsx, globals.css
- [x] Lazy-load non-critical gallery thumbnails (`loading="lazy"`); hero image kept `priority`
- [x] Defer consent-gated trackers `afterInteractive` → `lazyOnload` (Meta/Pinterest/TikTok/YouTube)
- [x] Evaluate non-blocking font preload in layout.tsx — reverted (Next server component disallows `onLoad`); preconnect already present
- [x] Evaluate critical-CSS inlining in globals.css — skipped (design-breakage risk)
- [x] Verify: `tsc --noEmit` clean · biome clean · `bun run build` passes · `cd web && bun test` 31/0 · `bun run lint` 0/0
- [x] Commit changes (`ca320bb`) + write report (`docs/plans/2026-11-18-pagespeed-audit.md`)

### Remaining (blocked on deploy — do not merge/push yet)
- [ ] Re-audit mobile PageSpeed after deploy to capture **after** metrics (LCP/FCP/TBT/CLS) and update `docs/plans/2026-11-18-pagespeed-audit.md`
- [ ] Consider exact-gstatic-font-file `preload` (UA-dependent woff2 URLs) via a small client component if LCP remains font-bound
- [ ] Review 7 long-tasks / 392 KiB unused-JS audit insight for additional deferrals beyond consent-gated trackers
- [ ] Merge to `develop` (then `main` per flow) once after-metrics are acceptable

### Out of scope (deliberately)
- `next/font/google` — Turbopack import-map bug; keep Google Fonts `<link>` in `layout.tsx`
- Design palette / vintage Amazigh style — locked in `globals.css` (cream/ink/bronze/terracotta/henna)
- CLS remediation — already good (0.009); no layout-shift-inducing changes made

## Before → After (target)
| Metric | Before (measured) | After | Source |
|---|---|---|---|
| Performance | 78 | TBD | PageSpeed mobile lab |
| FCP | 1.7 s | TBD | PageSpeed mobile lab |
| LCP | 4.4 s | TBD | PageSpeed mobile lab |
| TBT | 80 ms | TBD | PageSpeed mobile lab |
| CLS | 0.009 | TBD | PageSpeed mobile lab |

*After numbers are TBD until the branch is deployed and re-audited.*

## Notes
- Do not merge to `main` or `develop`; do not push (per task instructions).
- Verification bar before any structural change: `tsc` + `lint` 0/0 + `next build` + `bun test` green.
- Report: `docs/plans/2026-11-18-pagespeed-audit.md`
