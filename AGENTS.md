# Maison Titrit — production repo agent notes

## Layout
- Bun workspace (no Turborepo): `web/` (Next.js 16 storefront + `/makteb` backoffice on Vercel; Prisma → Supabase Postgres; media on Cloudflare R2). No CMS: Strapi was removed in 2026-10, don't reintroduce a second backend. `docs/` carries the deployment runbook and the inherited build history.
- Everything a developer or agent needs lives inside this repo: `README.md` (topology + quickstart), `docs/DEPLOYMENT.md` (full env table, R2/DNS, checklists), `docs/history/worklog-ws2.md` (design-decision trail: vintage Amazigh design system, brand assets, RBAC, SEO).

## Commands (from repo root)
```sh
bun install           # root, installs both workspaces
bun run dev:web       # Next dev :3000
bun run lint          # web eslint (must stay 0 errors / 0 warnings)
bunx tsc --noEmit -p web
bun run build         # next build
```

## Branching (git flow)
- `main` = production. Vercel auto-deploys it to https://maisontitrit.com. Only merge `release/*` or `hotfix/*` into it.
- `develop` = integration (GitHub default branch). Pushes get Vercel preview URLs.
- Work on `feature/<name>` off `develop`; urgent prod fixes on `hotfix/<name>` off `main`, merged back to both.
- Both `main` and `develop` block force-push and deletion.

## Conventions & gotchas
- Package manager is **Bun**.
- Prisma provider split: local dev = `sqlite` (`web/prisma/schema.prisma`), deploy = `web/prisma/schema.postgres.prisma` (used by `vercel:build`). Keep schemas in lockstep when models change; output client files via the matching `bunx prisma generate --schema=...`. Do not un-comment real `enum` blocks (SQLite compatibility).
- Design system is locked: cream `#F4EAD5` / ink `#1C1A17` / bronze `#9A6A3A` / terracotta `#B0532F` / henna `#6B2D1F` in `web/src/app/globals.css`. Keep new UI on this palette. Fonts come from a Google Fonts `<link>` in `web/src/app/layout.tsx` — never reintroduce `next/font/google` (Turbopack bug, see docs/history Task 22).
- `web/src/config/site.ts` is the single source of brand/contact/social truth; `web/src/lib/brand.ts` and `web/src/lib/seo.ts` are passthrough helpers. Route new pages through `buildPageMetadata`.
- Private pages (`/panier`, `/checkout`, `/compte`, `/auth/*`, `/makteb`) are noindexed — keep it that way.
- `react-hooks/set-state-in-effect` is intentionally off in `web/eslint.config.mjs` (hydration-gated mount reads); the TODO to refactor those sites and re-enable is in the audit comment there.
- Env files are gitignored everywhere (`.env.example` ships instead). Secret leak check before pushing: `git ls-files | grep -i '\.env'`.
- Content split: products/orders/users/pricing live in the web app's own Prisma tables; so does the blog (`Article`, edited at `/makteb/blog`).

## Verification bar
`tsc --noEmit` + `lint` 0/0 + `next build` green before declaring any structural change done.
