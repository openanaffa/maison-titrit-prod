# Maison Titrit — Production Codebase (Next.js + Supabase + Strapi)

Stack: **Next.js 16 (web, Vercel) + Supabase (Postgres/auth/storage) + Strapi (CMS, Oracle Cloud)**.
Monorepo (Bun workspaces + Turborepo), published at `https://github.com/openanaffa/maison-titrit-prod`.

```
prod/
├── web/                  Next.js 16 storefront + backoffice → Vercel (root dir = web)
├── cms/                  Strapi 5 CMS → Docker image on Oracle Cloud
├── docker/cms.Dockerfile Production image for the CMS (multi-stage, node runtime)
├── docker-compose.yml    Local stack: cms + throwaway Postgres (dev only)
├── turbo.json            task graph (build / dev / lint / vercel:build)
├── package.json          workspace root (bun) — turbo orchestration
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
| Strapi CMS | Oracle Cloud VPS (Docker) | editorial content: blog / lookbook; DB = dedicated `titrit_strapi` database on the same Supabase project |
| DNS / CDN | Cloudflare | `maisontitrit.ma` → Vercel, `cdn.maisontitrit.ma` → R2, `cms.maisontitrit.ma` → Oracle VPS behind TLS |

## Division of content ownership

- **Products, categories, orders, users, admin settings** → stay in the Next.js app's own Postgres tables (Prisma models). Not CMS-managed.
- **Blog / articles / lookbook pages** → migrate to Strapi collections; the Next.js `/blog` routes fetch from Strapi at request time via `CMS_BASE_URL` (+ `CMS_TOKEN` for draft preview). Until the migration lands, the existing `Article` model stays the source of truth — do not rewrite blog UI until Strapi content types exist.

## web/

Inherited site code: `src/` (storefront + admin + cart + WhatsApp COD deeplinks), `public/assets` (Amazigh vintage design system — cream/ink/bronze/terracotta/henna, locked in `globals.css`; fonts via Google Fonts `<link>`, Turbopack-safe), single config source `src/config/site.ts`, SEO helpers `src/lib/seo.ts`. Prisma schema uses String pseudo-enums — keep them, schema must stay providers-compatible.

Production-specific changes vs the inherited sandbox:

- **`package.json`** renamed `maison-titrit-web`; correct `build`/`start` (no `standalone` copy hacks); dropped sandbox-only deps (`z-ai-web-dev-sdk`) and unused ones (`next-intl`, `pg`).
- **`.env`** points at Supabase Postgres (pooler) — replace `SUPABASE_DB_PASSWORD` with the real project DB password. **Never commit it** (env files are gitignored; `.env.example` exists).
- **Prisma provider split**: local dev stays `sqlite` (`prisma/schema.prisma`); `prisma/schema.postgres.prisma` is the deploy-time schema. `vercel:build` runs `prisma generate --schema=prisma/schema.postgres.prisma` so Vercel builds speak Postgres; locally `bunx prisma generate` (sqlite) and bootstrap with `DATABASE_URL=file:./db/custom.db bunx prisma db push`.
- **`/auth/signin` Suspense fix**: `useSearchParams()` sits inside a `React.Suspense` boundary — `next build` prerender previously bailed out on it (latent bug from the sandbox, which never ran `next build` locally).

## Quickstart

```bash
bun install                      # workspace root (installs web + cms)
bun run dev:web                  # Next.js dev server :3000
docker compose up --build cms    # Strapi dev on :1337 (+ Postgres :5433) — dev only
bun run build                    # build all workspaces
```

## Strapi on Oracle Cloud (roadmap)

1. Local first: `docker compose up --build cms` (above); swap `cms/.env` `DATABASE_*` to the Supabase `titrit_strapi` database once it exists.
2. Provision VPS, point `cms.maisontitrit.ma` in Cloudflare (proxied, Full-strict SSL).
3. Deploy via `docker/cms.Dockerfile` (built by compose, or pushed to a registry and pulled by the VPS) behind Caddy or Cloudflare origin TLS; run with restart policy.
4. Strapi DB: dedicated database `titrit_strapi` on the same Supabase project, with a `strapi` role scoped to it (`search_path`) — Prisma on the web side is role-scoped, so the two schema spaces stay separated.
5. Expose only through HTTPS with an API token; let Vercel fetch content (`CMS_TOKEN` scoped read-only). Future: move blog to Strapi content types + a `/blog` fetch layer in `web/src/lib/cms.ts`.

## Environment variables (web)

Required: `DATABASE_URL`, `NEXTAUTH_URL`, `NEXTAUTH_SECRET`, `NEXT_PUBLIC_SITE_URL`, `ADMIN_EMAIL`, `ADMIN_PASSWORD` (seed only), `R2_*` (uploads), `CMS_BASE_URL`, `CMS_TOKEN` (once blog moves to Strapi).
**Full table with optional vars** (Resend email, Google OAuth, GTM/GA4/Meta Pixel) → [`docs/DEPLOYMENT.md`](docs/DEPLOYMENT.md).

## Verification bar

`tsc --noEmit` + `bun run lint` (0 errors, 0 warnings) + `next build` (all routes) + `strapi build` + docker image smoke test — all green at repo seed time (see git log).

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
   - cms: create database `titrit_strapi` + a `strapi` role scoped to it (not superuser);
     put pooler credentials in cms/.env (DATABASE_CLIENT=postgres, DATABASE_SSL=true).
4. Vercel: link the repo, set Root Directory = web/, Build = turbo pipeline
   (vercel.json already wires `cd ../.. && bun install` + `turbo run vercel:build --filter=web`).
   Set env vars per docs/DEPLOYMENT.md (DATABASE_URL, NEXTAUTH_URL/SECRET,
   NEXT_PUBLIC_SITE_URL, ADMIN_EMAIL/PASSWORD for seed, R2_* if media, CMS_BASE_URL/CMS_TOKEN
   once the blog moves to Strapi). Deploy to production for maisontitrit.ma and
   verify: fonts render, /produit/MT-LORA, /blog, /makteb redirects to sign-in,
   robots/sitemap use absolute URLs.
5. Oracle Cloud (Strapi): ask me for VPS details (ssh user/IP), install Docker,
   deploy with docker/docker-compose.yml or push the prebuilt
   openanaffa/maison-titrit-cms:latest image to a registry and pull it.
   Point cms.maisontitrit.ma in Cloudflare (proxied, SSL Full-strict) at the VPS.
   Verify: https://cms.maisontitrit.ma loads the admin panel.
6. Never commit or echo secrets. Create/keep all .env files local (gitignored);
   copy values from .env.example files. If any verification fails, stop and report
   the exact error before retrying with a fix.
```

## Git

This repo is standalone (`github.com/openanaffa/maison-titrit-prod`, branch `main`). Commit here, never inside a parent workspace repo. Vercel: import this GitHub repo with **Root Directory = `web/`**.
