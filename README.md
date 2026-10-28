# Maison Titrit — Production Codebase (Next.js + Supabase)

Stack: **Next.js 16 (storefront + `/makteb` backoffice, Vercel) + Supabase Postgres + Cloudflare R2/DNS**. No separate CMS: catalog, orders, customers and blog are all managed in `/makteb`.
Bun workspace (single app, `web/`), published at `https://github.com/openanaffa/maison-titrit-prod`.

```
prod/
├── web/                  Next.js 16 storefront + backoffice → Vercel (root dir = web)
├── package.json          workspace root (bun) — scripts forward to web/
└── docs/                 deployment runbook + build history (self-contained)
```

## Docs (everything lives in this repo)

- **`docs/DEPLOYMENT.md`** — full runbook: Supabase project details, Cloudflare R2 + DNS, Vercel import, complete env-var table, post-deploy checklist, SEO submission, ops/rollback. Originally written for the pre-production sandbox; commands remain valid inside `web/`.
- **`docs/history/worklog-ws2.md`** — 31 tasks of build history and design decisions the site code inherits (design system lockdown, brand tasks, admin RBAC, SEO, storage gating). Read before questioning any inherited choice.

## Topology

| Piece | Where | Notes |
|---|---|---|
| Next.js storefront + backoffice (`/makteb`) | Vercel | migrated from the sandbox workspace; Prisma → Supabase Postgres already proven (see docs/history Task 29) |
| Postgres + auth data | Supabase (`rrhzxrcgphlaxybahhep`, eu-west-1) | session pooler host `aws-0-eu-west-1.pooler.supabase.com:5432` (direct host is IPv6-only) |
| Media uploads | Cloudflare R2 bucket `maison-titrit` | env-gated in `web/src/lib/storage.ts`; local `/public/uploads` fallback in dev only |
| DNS / CDN | Cloudflare | `maisontitrit.com` → Vercel, `cdn.maisontitrit.com` → R2 |

## Division of content ownership

Everything (products, categories, orders, users, settings, blog `Article`) lives in the web app's Prisma tables on Supabase and is edited in `/makteb`. Strapi was tried and removed (2026-10): one backend, one admin login, one checkout transaction.

## web/

Inherited site code: `src/` (storefront + admin + cart + WhatsApp COD deeplinks), `public/assets` (Amazigh vintage design system — cream/ink/bronze/terracotta/henna, locked in `globals.css`; fonts via Google Fonts `<link>`, Turbopack-safe), single config source `src/config/site.ts`, SEO helpers `src/lib/seo.ts`. Prisma schema uses String pseudo-enums — keep them, schema must stay providers-compatible.

Production-specific changes vs the inherited sandbox:

- **`package.json`** renamed `maison-titrit-web`; correct `build`/`start` (no `standalone` copy hacks); dropped sandbox-only deps (`z-ai-web-dev-sdk`) and unused ones (`next-intl`, `pg`).
- **`.env`** points at Supabase Postgres (pooler) — replace `SUPABASE_DB_PASSWORD` with the real project DB password. **Never commit it** (env files are gitignored; `.env.example` exists).
- **Prisma provider split**: local dev stays `sqlite` (`prisma/schema.prisma`); `prisma/schema.postgres.prisma` is the deploy-time schema. `vercel:build` runs `prisma generate --schema=prisma/schema.postgres.prisma` so Vercel builds speak Postgres; locally `bunx prisma generate` (sqlite) and bootstrap with `DATABASE_URL=file:./db/custom.db bunx prisma db push`.
- **`/auth/signin` Suspense fix**: `useSearchParams()` sits inside a `React.Suspense` boundary — `next build` prerender previously bailed out on it (latent bug from the sandbox, which never ran `next build` locally).

## Quickstart

```bash
bun install                      # workspace root
bun run dev:web                  # Next.js dev server :3000
bun run build                    # next build
```

## Environment variables (web)

Required: `DATABASE_URL`, `NEXTAUTH_URL`, `NEXTAUTH_SECRET`, `NEXT_PUBLIC_SITE_URL`, `ADMIN_EMAIL`, `ADMIN_PASSWORD` (seed only), `R2_*` (uploads).
**Full table with optional vars** (Resend email, Google OAuth, GTM/GA4/Meta Pixel) → [`docs/DEPLOYMENT.md`](docs/DEPLOYMENT.md).

## Verification bar

`tsc --noEmit` + `bun run lint` (0 errors, 0 warnings) + `next build` (all routes) — all green at repo seed time (see git log).

## Bootstrap with a coding agent

Paste this to any coding agent with repo access (it will ask you for the few secret values it cannot invent):

```text
You are bootstrapping the Maison Titrit production repo at
https://github.com/openanaffa/maison-titrit-prod (branch main).
Read README.md, AGENTS.md, and docs/DEPLOYMENT.md FIRST — they are the
conventions and the source of truth. Package manager is Bun (never npm on the host).

Do, in order, verifying each step before the next:
1. Clone the repo, run `bun install` at the repo root (Bun workspaces).
2. web/: set DATABASE_URL to a local `file:./db/custom.db`, `bunx prisma generate`,
   `bunx prisma db push`, then seed with ADMIN_EMAIL/ADMIN_PASSWORD + `bun run seed:prod`.
   Verify: `bunx tsc --noEmit -p web`, `bun run lint` (0/0), `bun run build` (all routes green).
3. Supabase (project rrhzxrcgphlaxybahhep, eu-west-1 — ask me to resume it if paused;
   ask me for the DB password, never guess it):
   - web: `DATABASE_URL` = postgresql://postgres.<ref>:<PW>@aws-0-eu-west-1.pooler.supabase.com:5432/postgres
     then `bunx prisma db push --schema=prisma/schema.postgres.prisma` + re-run `seed:prod`
     against that URL.
4. Vercel: link the repo, set Root Directory = web/, build is wired in web/vercel.json
   (`cd .. && bun install` + `bun run vercel:build`).
   Set env vars per docs/DEPLOYMENT.md (DATABASE_URL, NEXTAUTH_URL/SECRET,
   NEXT_PUBLIC_SITE_URL, ADMIN_EMAIL/PASSWORD for seed, R2_* for media).
   Deploy to production for maisontitrit.com and
   verify: fonts render, /produit/MT-LORA, /blog, /makteb redirects to sign-in,
   robots/sitemap use absolute URLs.
5. Never commit or echo secrets. Create/keep all .env files local (gitignored);
   copy values from .env.example files. If any verification fails, stop and report
   the exact error before retrying with a fix.
```

## Git

This repo is standalone (`github.com/openanaffa/maison-titrit-prod`, branch `main`). Commit here, never inside a parent workspace repo. Vercel: import this GitHub repo with **Root Directory = `web/`**.
