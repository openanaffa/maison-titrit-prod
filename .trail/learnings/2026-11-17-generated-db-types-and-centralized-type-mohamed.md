---
title: Generated DB types and centralized type modules decisions
author: Mohamed
date: 2026-11-17
branch: develop
id: l-709b093c
scope: repo
status: active
src: agent
touches:
  - AGENTS.md
  - bun.lock
  - package.json
  - web/.env.example
  - web/next-env.d.ts
  - web/next.config.ts
  - web/package.json
  - "web/src/app/(site)/blog/[slug]/page.tsx"
  - web/src/app/(site)/blog/page.tsx
  - web/src/app/(site)/cgv/page.tsx
---

## Decided
- `web/src/lib/supabase/database.types.ts` is GENERATED, not hand-written: `web/scripts/generate-db-types.ts` parses `web/prisma/schema.postgres.prisma` and emits Supabase's canonical `Database` shape (`Row`/`Insert`/`Update`/`Relationships`, `Json`, `Tables`/`TablesInsert`/`TablesUpdate`). Regenerate with `bun run db:types` (root or web/). Prisma schema is the source of truth.
- Shared types live in `web/src/lib/types/` with a pure barrel `index.ts`; UI-kit local types were extracted to `web/src/components/ui/types.ts`. Admin API routes use the Supabase `Tables<"Table">` helpers rather than hand-maintained `*Row` aliases.
- `ProductWithRelations` derives from Prisma's generated `Prisma.ProductGetPayload<{ include: ... }>` instead of repeating the row fields by hand; `Row` (admin table) is a `Pick<ProductDTO>` projection.

## Tried and ruled out
- `WithRelations<T,R>` / `Paginated<T>` generic helpers: nothing in the codebase is paginated and Prisma's payload covers the only relation case — adding them would be YAGNI.
- Keeping `ProductDTO` re-exported from `lib/products.ts` as a compatibility shim: removed; all four consumers now import from `@/lib/types`.

## Watch out
- The old hand-written `ArticleRow` was stale — it omitted the `locale` column added by `supabase/migrations/20261115130000_article_locale_trilingual.sql`. Regenerating from the Prisma schema fixes it; re-run `bun run db:types` whenever schema models change.
- `bun.lock` must stay `lockfileVersion: 1` — Vercel's build image ships Bun 1.3.x and cannot read v2.
- `web/next-env.d.ts` is rewritten by `next build` (it flips `.next/dev/types` to `.next/types`); don't hand-edit it.
