---
inclusion: always
---

# Maison Titrit — agent onboarding

## Read first (canonical)

- **`ENTRYPOINT.md`** — single source of truth: repo layout, source-of-truth file table, conventions, MCP servers, branching, production environment, owners. **Not auto-loaded by Kiro** — read it explicitly before any task.
- **`AGENTS.md`** — always auto-loaded by Kiro; carries the conventions & gotchas list.

Everything else (tech stack, structure, conventions) lives in those two and in `docs/`. This file only bridges Kiro's auto-loaded steering to them.

## What this is

Full-stack e-commerce app for `maisontitrit.com`: Next.js 16 storefront + `/makteb` backoffice on Vercel, Prisma → Supabase Postgres, media on Cloudflare R2. No CMS — all content in Prisma tables, edited in `/makteb`. Trilingual FR/AR/EN. Checkout is WhatsApp cash-on-delivery (no online payments).

## Verification bar (must be green before declaring any change done)

```sh
bunx tsc --noEmit -p web   # type check
bun run lint               # 0 errors, 0 warnings
bun run build              # next build, all routes
cd web && bun test         # colocated *.test.ts
```

Package manager is **Bun** (never npm on the host); `bun.lock` must stay `lockfileVersion: 1`.

## Repo navigation

Indexed in `.trail/cache/`. Before grepping or opening source, run `trail ask "<question>" --source`. Full command set is in the trail block at the bottom of `AGENTS.md`.
