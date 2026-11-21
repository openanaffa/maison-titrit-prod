# Design System — Maison Titrit

> Locked palette and vintage Amazigh aesthetic. Do not recolor without a brand decision.

## 1. Tokens

### Colors (light / dark)

| Token | Light | Dark | Usage |
|---|---|---|---|
| `--cream` | `#f4ead5` | `#f4ead5` | brand surface |
| `--cream-light` | `#fbf6ea` | `#fbf6ea` | card/popover |
| `--ink` | `#1c1a17` | `#1c1a17` | text / primary |
| `--ink-soft` | `#3a352c` | `#cfc6b0` | secondary text |
| `--bronze` | `#9a6a3a` | `#b8915a` | accent / labels (large text only for AA) |
| `--bronze-light` | `#b8915a` | `#cfa978` | focus ring |
| `--bronze-deep` | `#7a552c` | `#b8915a` | label text |
| `--terracotta` | `#b0532f` | `#c9704a` | accent (large text / icons only for AA) |
| `--henna` | `#6b2d1f` | `#a0492f` | deep accent |
| `--olive` | `#6b6b3a` | `#8a8a4f` | chart |
| `--sand` | `#e8dbc0` | `#3a352c` | secondary surface |

Semantic aliases: `--background`, `--foreground`, `--card`, `--primary`, `--secondary`, `--muted`, `--accent`, `--destructive`, `--border`, `--input`, `--ring`, `--sidebar-*`, `--chart-1..5`. All defined in `web/src/app/globals.css` `:root` and `.dark`.

### Typography

Font families (loaded via `<link>` in `layout.tsx`): Jost (sans), Playfair Display (display), Cormorant Garamond (serif/body), Marcellus (label), Cinzel (wordmark), Allura (script), Noto Sans Tifinagh.

Semantic type roles: `.label-vintage*`, `.heading-vintage*`, `.body-vintage*`, `.eyebrow`, `.wordmark`, `.script-tagline`, `.tifinagh`.

### Radii, shadows, motion

- `--radius: 0.18rem` (sharp, vintage).
- Shadows via `.card-vintage`, `.vintage-frame`.
- Motion: `.reveal` (CSS-only, reduced-motion aware); prefer CSS over Framer Motion where possible.

### Breakpoints

Tailwind defaults (sm 640, md 768, lg 1024, xl 1280, 2xl 1536). Mobile-first.

### RTL

`dir="rtl"` on `<html>` for `ar`. Use `rtl:` overrides where needed; migrate to logical properties (`ms-`, `me-`, `ps-`, `pe-`, `start`, `end`) incrementally (TODO M2).

### Forced-colors

Not yet supported. Planned: `@media (forced-colors: active)` overrides for borders/focus (TODO M5).

### Contrast (WCAG 2.2 AA)

`bronze` (3.91:1) and `terracotta` (4.26:1) fail AA for normal text on cream. Use `text-ink`/`text-cream` for normal-size text; reserve bronze/terracotta for large text (≥18.66px or ≥14px bold) and decorative icons. See `docs/a11y-cwv-audit.md` finding #5.