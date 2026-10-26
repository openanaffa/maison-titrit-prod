# Maison Titrit — Production Codebase

Stack: **Next.js 16 (web, Vercel) + Supabase (Postgres/auth/storage) + Strapi (CMS, Oracle Cloud)**.
Seeded from `ws-2/` in the parent repo — read `../ws-2/worklog.md` and `../ws-2/DEPLOYMENT.md` for the design-decision history this inherits.

```
prod/
├── web/   Next.js app — see its own README section below + ../ws-2/DEPLOYMENT.md
└── cms/   Strapi 5 app — self-hosted on Oracle Cloud, Postgres-backed
```

## Topology

| Piece | Where | Notes |
|---|---|---|
| Next.js storefront + backoffice (`/makteb`) | Vercel | seeded from ws-2, prisma→Supabase Postgres already proven (ws-2 Task 29) |
| Postgres + auth data | Supabase (`rrhzxrcgphlaxybahhep`, eu-west-1) | session pooler host `aws-0-eu-west-1.pooler.supabase.com:5432` (direct host is IPv6-only) |
| Media uploads | Cloudflare R2 bucket `maison-titrit` | env-gated in `web/src/lib/storage.ts`; local `/public/uploads` fallback in dev only |
| Strapi CMS | Oracle Cloud VPS (Docker or PM2) | editorial content: blog / lookbook; DB = dedicated `titrit_strapi` database on the same Supabase project |
| DNS / CDN | Cloudflare | `maisontitrit.ma` → Vercel, `cdn.maisontitrit.ma` → R2, `cms.maisontitrit.ma` → Oracle VPS behind TLS |

## Division of content ownership

- **Products, categories, orders, users, admin settings** → stay in the Next.js app's own Postgres tables (Prisma ws_get tables). Not CMS-managed.
- **Blog / articles / lookbook pages** → migrate to Strapi collections; the Next.js `/blog` routes fetch from Strapi at request time via `CMS_BASE_URL` (+ `CMS_TOKEN` for draft preview). Until the migration lands, ws-2's Article model still works as the source of truth — do not rewrite blog UI until Strapi content types exist.

## web/ — how it differs from ws-2

Inherited as-is: `src/` (site + admin + cart + WhatsApp COD deeplinks), `public/assets` (Amazigh design system, fonts via Google Fonts `<link>` — Turbopack-safe), SEO helpers `src/lib/seo.ts`. Prisma schema uses String pseudo-enums — keep them, schema must stay providers-compatible.

Changed:

- **`package.json`** renamed `maison-titrit-web`; correct `build`/`start` (no `standalone` copy hacks); dropped `z-ai-web-dev-sdk` (sandbox VLM), `next-intl` (installed but never used), `pg` (was only a Supabase-region probe).
- **`scripts/dev.sh`** no longer hardcodes the z.ai sandbox path.
- **`.env`** points at Supabase Postgres (pooler) — replace `SUPABASE_DB_PASSWORD` with the real project DB password.
- **Prisma provider split**: local dev stays `sqlite` (`prisma/schema.prisma`); `prisma/schema.postgres.prisma` is the deploy-time schema. `vercel:build` now runs `prisma generate --schema=prisma/schema.postgres.prisma` so Vercel builds speak Postgres; locally use `bunx prisma generate` (sqlite) and `DATABASE_URL=file:./db/custom.db bunx prisma db push` to bootstrap the local DB.
- **`/auth/signin` Suspense fix**: `useSearchParams()` now sits inside a `React.Suspense` boundary — `next build` prerender previously bailed out on it (a latent ws-2 bug; `next build` was never run locally in the sandbox).

## Strapi on Oracle Cloud (roadmap)

1. Provision VPS, point `cms.maisontitrit.ma` in Cloudflare (proxied, Full-strict SSL).
2. Install Postgres client libs are inside Strapi already (pg); run Strapi with `pm2` or Docker, `NODE_ENV=production`.
3. Strapi DB: create a dedicated database `titrit_strapi` + role on the Supabase project (Supabase supports multiple databases only via SQL — otherwise use the same `postgres` DB with a separate schema; `cms/config/env/database.ts` hides tables from Prisma introspection is NOT needed — Prisma is schema-scoped via search_path, so a dedicated role with its own `search_path` is the clean way).
4. Expose only through HTTPS with an API token; let Vercel fetch content (`CMS_TOKEN` scoped read-only).
5. Future: move blog to Strapi content types, add `/blog` fetch layer in `web/src/lib/cms.ts`.

## Environment variables (web)

Required: `DATABASE_URL`, `NEXTAUTH_URL`, `NEXTAUTH_SECRET`, `NEXT_PUBLIC_SITE_URL`, `ADMIN_EMAIL`, `ADMIN_PASSWORD` (seed only), `R2_*` (uploads), `CMS_BASE_URL`, `CMS_TOKEN` (once blog moves to Strapi). Full table with optional vars (Resend email, Google OAuth, GTM/GA4/Pixel) in `../ws-2/DEPLOYMENT.md`.

## Git

`prod/` is its own repo (created fresh). The parent `maison-titrit` root repo stays empty (no commits) — do NOT commit prod inside the parent repo; commit inside `prod/`. Vercel: import the GitHub repo with **Root Directory = `web/`**.
