# Maison Titrit — production repo agent notes

## Layout
- Turborepo + Bun workspaces: `web/` (Next.js 16 storefront + `/makteb` admin on Vercel), `cms/` (Strapi 5.59 on Oracle Cloud). `docs/` carries the deployment runbook and the inherited build history.
- Everything a developer or agent needs lives inside this repo: `README.md` (topology + quickstart), `docs/DEPLOYMENT.md` (full env table, R2/DNS, checklists), `docs/history/worklog-ws2.md` (design-decision trail: vintage Amazigh design system, brand assets, RBAC, SEO).

## Commands (from repo root)
```sh
bun install           # root, installs both workspaces
bun run dev:web       # Next dev :3000
bun run lint          # turbo → web eslint (must stay 0 errors / 0 warnings)
bunx tsc --noEmit -p web
bun run build         # turbo build all
docker compose up --build cms   # local Strapi :1337 + disposable Postgres :5433
docker build -f docker/cms.Dockerfile -t openanaffa/maison-titrit-cms:latest .
```

## Conventions & gotchas
- Package manager is **Bun** for the repo. `docker/cms.Dockerfile` is the one sanctioned npm/node usage (container runtime parity with Strapi's supported target) — don't "fix" it.
- Prisma provider split: local dev = `sqlite` (`web/prisma/schema.prisma`), deploy = `web/prisma/schema.postgres.prisma` (used by `vercel:build`). Keep schemas in lockstep when models change; output client files via the matching `bunx prisma generate --schema=...`. Do not un-comment real `enum` blocks (SQLite compatibility).
- Design system is locked: cream `#F4EAD5` / ink `#1C1A17` / bronze `#9A6A3A` / terracotta `#B0532F` / henna `#6B2D1F` in `web/src/app/globals.css`. Keep new UI on this palette. Fonts come from a Google Fonts `<link>` in `web/src/app/layout.tsx` — never reintroduce `next/font/google` (Turbopack bug, see docs/history Task 22).
- `web/src/config/site.ts` is the single source of brand/contact/social truth; `web/src/lib/brand.ts` and `web/src/lib/seo.ts` are passthrough helpers. Route new pages through `buildPageMetadata`.
- Private pages (`/panier`, `/checkout`, `/compte`, `/auth/*`, `/makteb`) are noindexed — keep it that way.
- `react-hooks/set-state-in-effect` is intentionally off in `web/eslint.config.mjs` (hydration-gated mount reads); the TODO to refactor those sites and re-enable is in the audit comment there.
- Strapi 5 notes: no `@strapi/typescript-utils` (standalone tsconfig), `strapi ts:lint` no longer exists. `cms/.env` carries generated dev secrets — never commit it.
- Env files are gitignored everywhere (`.env.example` ships instead). Secret leak check before pushing: `git ls-files | grep -i '\.env'`.
- Content split: products/orders/users/pricing live in the web app's own Prisma tables; blog/lookbook are headed for Strapi collections (don't rewrite blog UI until content types exist).

## Verification bar
`tsc --noEmit` + `lint` 0/0 + `next build` green + `strapi build` green + docker smoke test before declaring any structural change done.
