---
title: "Admin row-action buttons: never add text-ink on default Button (bg-primary)"
author: Mohamed
date: 2026-11-23
branch: feat/ui-ux-a11y-revamp
id: l-c674dc82
scope: repo
status: active
src: agent
touches:
  - web/src/components/admin/order-detail-dialog.tsx
  - web/src/components/admin/orders-table-client.tsx
  - web/src/i18n/dictionaries/lang/ar.ts
  - web/src/i18n/dictionaries/lang/en.ts
  - web/src/i18n/dictionaries/lang/fr.ts
---

## Decided
In makteb admin tables, row-action buttons use `variant="outline"` with explicit bronze-border brand classes. The shared `ChipButton` (`web/src/components/admin/chip-button.tsx`) is the single source of truth for vintage filter/status chips (aria-pressed, focus ring, dark variants) — reuse it instead of re-writing the `rounded-full border px-3 py-1.5 font-label` classes.

## Watch out
The screenshot bug where "Détails" rendered as a solid black box with invisible text: `Button`'s default variant is `bg-primary text-primary-foreground` (bg-ink + text-cream), and passing `text-ink` in className overrode the foreground → ink text on ink background. Never combine the default Button variant with `text-ink`.

## Tried and ruled out
`role="group"` for filter chip rows — Biome's `useSemanticElements` rejects it; use `<fieldset>` + sr-only `<legend>` instead.
