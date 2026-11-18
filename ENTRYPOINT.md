# Maison Titrit — Canonical Entrypoint

**Single source of truth for humans and agents.** Read this first. Everything else (README, AGENTS, docs/, .mcp.json, .serena) is detail.

## 1. What this is

Full-stack web app for local stores (`maisontitrit.com`). Bun workspace: `web/` (Next.js 16 storefront + `/makteb` backoffice on Vercel), Prisma → Supabase Postgres, media on Cloudflare R2. No CMS; all content in Prisma tables edited in `/makteb`. i18n FR/AR/EN.

## 2. Quick start

```sh
bun install           # repo root
bun run dev:web       # Next dev :3000
bun run lint          # web eslint (0 errors / 0 warnings)
bunx tsc --noEmit -p web
bun run build
cd web && bun test
```

Package manager is **Bun**. Never npm on the host (Vercel build uses bundled Bun 1.3.x; keep `bun.lock` at lockfileVersion 1).

## 3. Layout

```
maison-titrit-prod/
├── web/                 Next.js 16 app (root dir for Vercel)
│   ├── src/             storefront + admin + cart + i18n
│   ├── prisma/          schema.prisma (sqlite dev) + schema.postgres.prisma (deploy)
│   ├── public/          assets
│   └── .env.example
├── docs/                DEPLOYMENT.md + history/worklog-ws2.md
├── supabase/migrations/ raw SQL (RBAC, article locales)
├── terraform/           Cloudflare DNS
├── .serena/             Serena project (memories, LSP config)
├── .trail/              repo context graph
├── .mcp.json            MCP servers (standard clients)
├── opencode.json        MCP servers (OpenCode)
├── .kiro/settings/mcp.json  MCP servers (Kiro)
└── repomix.config.json  token-efficient repo packing
```

## 4. Source of truth files

| Concern | File |
|---|---|
| Brand/contact/socials | `web/src/config/site.ts` |
| Design tokens | `web/src/app/globals.css` (cream/ink/bronze/terracotta/henna) |
| Fonts | Google Fonts `<link>` in `web/src/app/layout.tsx` (no next/font/google) |
| SEO | `web/src/lib/seo/seo.ts` + `buildPageMetadata` (in `build-page.metadata.ts`); JSON-LD in `seo/json-ld/` |
| i18n strings | `web/src/i18n/dictionaries/lang/{fr,ar,en}.ts` |
| Prisma schemas | `web/prisma/schema.prisma` (sqlite) + `schema.postgres.prisma` (postgres) |
| Env template | `web/.env.example` |
| Deploy runbook | `docs/DEPLOYMENT.md` |
| Build history | `docs/history/worklog-ws2.md` |
| Agent conventions | `AGENTS.md` |
| MCP config | `.mcp.json` / `opencode.json` (and `.cursor`, `.gemini`, `.kiro`, `.claude`) |
| Serena memories | `.serena/memories/*` |
| Repo graph | `.trail/` (trail MCP) |
| Knowledge base | `F:\0brain` (open-knowledge MCP) |

## 5. Conventions (do not violate)

- No CMS; content in Prisma tables, edited in `/makteb`.
- Keep the two Prisma schemas in lockstep; regenerate clients per provider.
- Do not un-comment real `enum` blocks (SQLite compat).
- Design system locked; keep new UI on the palette.
- Route new pages through `buildPageMetadata`.
- Private pages (`/panier`, `/checkout`, `/compte`, `/auth/*`, `/makteb`) noindexed.
- `react-hooks/set-state-in-effect` intentionally off.
- New UI strings go in all three locale dictionaries.
- Env files gitignored everywhere; `.env.example` ships instead.
- Secret leak check: `git ls-files | grep -i '\.env'`.
- `bun.lock` must stay lockfileVersion 1.
- Supabase raw SQL migrations live in `supabase/migrations/`; don't re-express in Prisma.
- Tests colocated (`*.test.ts`).

## 6. Verification bar

`tsc --noEmit` + `lint` 0/0 + `next build` + `bun test` green before declaring any structural change done.

## 7. Branching (git flow)

- `main` = production (Vercel auto-deploys). Only merge `release/*` or `hotfix/*`.
- `develop` = integration (GitHub default). Pushes get Vercel preview URLs.
- Work on `feature/<name>` off `develop`; urgent prod fixes on `hotfix/<name>` off `main`, merged back to both.
- Both `main` and `develop` block force-push and deletion.

## 8. MCP servers configured (18)

trail, next-devtools, serena, repomix, context7, figma, open-knowledge, filesystem, filesystem-brain (F:\0brain), supabase, prisma, cloudflare, github, postgres, sqlite, vercel, terraform, docker.

Secrets via env vars; see `web/.env.example`. Serena uses Python 3.12 (via uv). Cloudflare MCP needs `npx wrangler login` + `CLOUDFLARE_ACCOUNT_ID`. Terraform/Docker CLIs must be installed to use those MCPs.

## 9. Serena project registration

Project `maison-titrit-prod` registered in `.serena/project.yml` (TypeScript LSP). Onboarding memories: `core`, `tech_stack`, `suggested_commands`, `conventions`, `task_completion`. Read `mem:core` first.

## 10. Environment (production)

- Supabase project `rrhzxrcgphlaxybahhep`, eu-west-1, session pooler `aws-0-eu-west-1.pooler.supabase.com:5432`.
- R2 bucket `maison-titrit`, public `cdn.maisontitrit.com`.
- DNS: `maisontitrit.com` → Vercel, `cdn.maisontitrit.com` → R2.
- Vercel root dir = `web/`, build = `vercel:build`.

## 11. Where to look next

- Status and next milestones: `ROADMAP.md`
- Deploy: `docs/DEPLOYMENT.md`
- Build history / design decisions: `docs/history/worklog-ws2.md`
- Agent notes: `AGENTS.md`
- MCP/knowledge: `.mcp.json`, `F:\0brain`
- Repo graph: `trail ask "<question>" --source`
- Repomix pack: `repomix.config.json` → `repomix-output.xml` (gitignored)

## 12. Owners

- Founder/owner: Mohamed Moughamir (founder@maisontitrit.com)
- Repo: github.com/openanaffa/maison-titrit-prod (branch main)
