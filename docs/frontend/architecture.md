# Frontend Architecture — Maison Titrit

> Companion to `ENTRYPOINT.md`, `AGENTS.md`, and `docs/DEPLOYMENT.md`. Covers the storefront (`web/src/app/(site)`) and the `/makteb` backoffice.

## 1. Stack

- Next.js 16.4.5 (App Router, RSC, Turbopack dev) on Bun 1.3.14.
- React 19.3.1, TypeScript strict (`noEmit`), Tailwind CSS 4.3.5 (CSS-first).
- shadcn/ui (new-york) over Radix primitives; `class-variance-authority` + `tailwind-merge` + `cn()` (`@/lib/utils`).
- Data: Prisma → Supabase Postgres (prod) / SQLite (dev); Supabase Auth (SSR); React Query for client state.
- Media: Cloudflare R2 (`cdn.maisontitrit.com`), served via `next/image`.

## 2. Routing & layout

- Root layout: `web/src/app/layout.tsx` (fonts via `<link>`, theme provider, locale provider, SW register, analytics).
- Storefront group: `web/src/app/(site)/*` — public, indexed (except private).
- Backoffice: `web/src/app/makteb/*` — noindexed (`X-Robots-Tag`).
- Private: `/panier`, `/checkout`, `/compte`, `/auth/*` — noindexed.
- i18n is cookie-based (`titrit-locale`); `<html lang dir>` set in root layout. No per-URL locales (tracked as B-03).

## 3. Data flow

- Server components fetch via Prisma/repositories (`web/src/lib/repositories/`).
- Client components use React Query hooks (`web/src/hooks/api/`).
- Mutations go through `/api/*` route handlers; server validates authorization independently.
- React Query cache keys are feature-scoped; mutations invalidate related keys.

## 4. Component layers

Tokens → Primitives (shadcn `ui/`) → Compositions (`maison/`, `admin/`) → Blocks (page sections) → Layouts (root `(site)` / `makteb`).

See `component-guidelines.md` and `component-inventory.md`.

## 5. State & providers

- `ThemeProvider` (next-themes), `LocaleProvider`, `SupabaseAuthProvider`, `ReactQueryProvider`.
- Cart state (zustand) for the drawer; server is source of truth for stock.

## 6. PWA boundary

- Service worker at `public/sw.js`, registered by `SwRegister` (prod only).
- Private routes never cached; auth state never cached.
- See `pwa-architecture.md`.

## 7. Security boundaries

- Authorization validated server-side on every `/api/*` and `/makteb` route.
- No access tokens in `localStorage`; Supabase SSR cookies.
- `botid` bot filtering enabled.
- CSP not yet configured (planned, see TODO M13).

## 8. Conventions (do not violate)

See `AGENTS.md` §conventions and `ENTRYPOINT.md` §5. Notably: keep schemas in lockstep, design-system lock, `buildPageMetadata`, trilingual dictionaries, env files gitignored.