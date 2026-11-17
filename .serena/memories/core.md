# Maison Titrit Prod — Core

Full-stack web app for local stores (maisontitrit.com). Bun workspace: web/ (Next.js 16 storefront + /makteb backoffice), Prisma -> Supabase Postgres, media on Cloudflare R2.

Modules:
- web/ — Next.js 16 app. Stack details: mem:tech_stack. Commands: mem:suggested_commands. Conventions: mem:conventions. Done criteria: mem:task_completion.
- supabase/ — raw SQL migrations (RBAC, article locales). Outside Prisma.
- terraform/ — Cloudflare DNS.

Invariants:
- No CMS; all content in Prisma tables edited via /makteb.
- Prisma provider split: local dev = sqlite (schema.prisma), deploy = postgres (schema.postgres.prisma). Keep in lockstep.
- Design system locked (cream/ink/bronze/terracotta/henna in globals.css).
- Fonts via Google Fonts <link> in layout.tsx, never next/font/google.
- web/src/config/site.ts is single source of brand/contact/social truth.
- Route new pages through buildPageMetadata.
- Private pages (/panier, /checkout, /compte, /auth/*, /makteb) noindexed.
- i18n FR/AR/EN via titrit-locale cookie; strings in web/src/i18n/dictionaries/lang/{fr,ar,en}.ts.
- bun.lock must stay lockfileVersion 1 (Vercel bundled Bun 1.3.x).
