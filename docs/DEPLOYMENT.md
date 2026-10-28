# Maison Titrit — Deployment Runbook

Production target: **Vercel** (Next.js) + **Supabase** (Postgres) + **Cloudflare** (R2 storage + DNS).
*Written during the pre-production build phase; all paths it mentions (`prisma/schema.prisma`, `src/lib/storage.ts`, …) resolve inside `web/` in this repo.*

This is the single source of truth for taking the site live. Follow top to bottom.

---

## 0. Prerequisites

- A Vercel account (free Hobby tier is enough to start)
- A Supabase account + a new project (free tier: 500 MB DB, 2 GB bandwidth)
- A Cloudflare account with your domain `maisontitrit.com` added (free tier)
- The GitHub repo with this code pushed

---

## 1. Database — Supabase Postgres

1. Create a Supabase project → note the **Project ref** + **DB password**
2. Get the connection string (Project Settings → Database → Connection string → URI):
   ```
   postgresql://postgres.[PROJECT]:[PASSWORD]@db.[PROJECT].supabase.co:5432/postgres
   ```
3. **Swap the Prisma provider** in `prisma/schema.prisma`:
   ```diff
   datasource db {
   -  provider = "sqlite"
   +  provider = "postgresql"
     url      = env("DATABASE_URL")
   }
   ```
4. Push the schema + seed:
   ```sh
   DATABASE_URL="postgresql://postgres.[PROJECT]:[PASSWORD]@db.[PROJECT].supabase.co:5432/postgres" \
     bunx prisma db push --accept-data-loss
   DATABASE_URL="postgresql://..." ADMIN_EMAIL="founder@maisontitrit.com" ADMIN_PASSWORD="your-strong-password" \
     bun run scripts/seed.ts
   ```
5. Verify: Supabase → Table Editor shows `Product`, `Category`, `Order`, `User`, `Article`, `Image`, `Setting`, `Account`, `Session`, `VerificationToken`, `Invite`, `OrderItem`.

> **Local dev** stays on SQLite (the `.env` `DATABASE_URL=file:...`). Only production uses Postgres. Keep the schema provider as `postgresql` once you've migrated; SQLite dev still works because Prisma maps enums to strings and the schema is Postgres-compatible.

---

## 2. File storage — Cloudflare R2

Vercel's filesystem is **ephemeral** — uploaded images won't persist. R2 is S3-compatible and cheap (no egress fees on Cloudflare).

1. Cloudflare dashboard → **R2 Object Storage** → Buy / enable
2. **Create bucket** → `maison-titrit` (region: auto)
3. **Settings → Public access → R2.dev subdomain** OR connect a **custom domain** (recommended): `cdn.maisontitrit.com` → note the public URL
4. **R2 → Manage R2 API Tokens → Create API token**:
   - Permissions: Object Read & Write
   - Specify bucket: `maison-titrit`
   - Note **Account ID**, **Access Key ID**, **Secret Access Key**
5. Set these env vars in Vercel (step 4 below):
   ```
   R2_ACCOUNT_ID=...
   R2_BUCKET=maison-titrit
   R2_ACCESS_KEY_ID=...
   R2_SECRET_ACCESS_KEY=...
   R2_PUBLIC_URL=https://cdn.maisontitrit.com
   ```
6. The `/api/admin/upload` route auto-detects R2 (if `R2_ACCOUNT_ID` is set) and uploads there; otherwise falls back to local disk (dev only).

---

## 3. Cloudflare DNS

1. Cloudflare → your domain `maisontitrit.com` → **DNS**
2. Add records (Vercel will tell you the exact target after step 4):
   - `A`  `maisontitrit.com` → `76.76.21.21` (Vercel)
   - `CNAME` `www` → `cname.vercel-dns.com`
   - `CNAME` `cdn` → `<your-r2-public-bucket>.r2.dev` (for R2 custom domain, optional)
3. SSL/TLS → Full (strict). Cloudflare proxies automatically.

---

## 4. Vercel deploy

1. Vercel → **Add New → Project** → import the GitHub repo
2. Framework preset: **Next.js** (auto-detected). Build command: `bun run build` (or leave default — Vercel runs `next build`)
3. **Environment Variables** (Project Settings → Environment Variables) — set ALL of these:

   | Key | Value | Env |
   |-----|-------|-----|
   | `DATABASE_URL` | `postgresql://...supabase.co...` | Production + Preview |
   | `NEXTAUTH_URL` | `https://maisontitrit.com` | Production |
   | `NEXTAUTH_SECRET` | `openssl rand -base64 32` | Production + Preview |
   | `NEXT_PUBLIC_SITE_URL` | `https://maisontitrit.com` | Production |
   | `ADMIN_EMAIL` | `founder@maisontitrit.com` | Production (seed only) |
   | `ADMIN_PASSWORD` | `<your strong password>` | Production (seed only) |
   | `R2_ACCOUNT_ID` | `<from R2>` | Production |
   | `R2_BUCKET` | `maison-titrit` | Production |
   | `R2_ACCESS_KEY_ID` | `<from R2>` | Production |
   | `R2_SECRET_ACCESS_KEY` | `<from R2>` | Production |
   | `R2_PUBLIC_URL` | `https://cdn.maisontitrit.com` | Production |
   | `EMAIL_SERVER_HOST` | `smtp.resend.com` | Production (optional) |
   | `EMAIL_SERVER_PORT` | `587` | Production |
   | `EMAIL_SERVER_USER` | `resend` | Production |
   | `EMAIL_SERVER_PASSWORD` | `<Resend API key>` | Production |
   | `EMAIL_FROM` | `Maison Titrit <hello@maisontitrit.com>` | Production |
   | `GOOGLE_CLIENT_ID` | `<from Google Cloud>` | Production (optional) |
   | `GOOGLE_CLIENT_SECRET` | `<from Google Cloud>` | Production (optional) |
   | `NEXT_PUBLIC_GOOGLE_ENABLED` | `1` | Production (optional) |
   | `NEXT_PUBLIC_GTM_ID` | `GTM-XXXXXXX` | Production (optional) |
   | `NEXT_PUBLIC_GA4_ID` | `G-XXXXXXXXXX` | Production (optional) |
   | `NEXT_PUBLIC_FB_PIXEL_ID` | `<15-digit ID>` | Production (optional) |

4. **Build & Development Settings → Install command**: `bun install` (Vercel auto-detects Bun from `bun.lock`)
5. Deploy. First deploy runs `next build`; Prisma client is generated by the `postinstall` (add `prisma generate` to a build step if not — see `vercel:build` script)
6. Add the custom domain `maisontitrit.com` in Vercel → Settings → Domains → point DNS as step 3

---

## 5. Post-deploy verification

Visit `https://maisontitrit.com`:

- [ ] Homepage loads, fonts (Cinzel/Playfair) render, no console errors
- [ ] `/produit/MT-LORA` product detail loads
- [ ] `/blog` lists the seeded article
- [ ] `/makteb` redirects to `/auth/signin`
- [ ] Log in with `founder@maisontitrit.com` / your `ADMIN_PASSWORD` → dashboard shows 6 products
- [ ] Admin → Products → New → upload an image → it appears (R2 path active)
- [ ] Language switch FR → AR (RTL) → EN works
- [ ] `https://maisontitrit.com/robots.txt` shows disallows + sitemap
- [ ] `https://maisontitrit.com/sitemap.xml` has absolute URLs
- [ ] `https://maisontitrit.com/feed.xml` has product entries

---

## 5b. CMS — self-hosted Strapi (OCI VM) — DECOMMISSIONING

Strapi was removed from the codebase (2026-10, `feature/drop-strapi`); the blog reads Prisma `Article` again. The VM below still runs until this checklist is done. Each step is destructive — run it yourself or approve it explicitly:

1. [ ] Drop-strapi PR merged to `main`, prod `/blog` and `/sitemap.xml` return 200 with no request to `cms.maisontitrit.com`.
2. [ ] Optional archive: `pg_dump` the `titrit_strapi` database (0 published entries, so this is only belt-and-braces).
3. [ ] Terraform (`terraform/` also manages the apex/www/mail DNS records — never `destroy` the whole state): delete `oci.tf`, `oci-variables.tf`, `cloud-init/`, the OCI provider/vars, and `cloudflare_record.cms_a` from `dns.tf`; then `tofu plan` must list **only** OCI resources + `cms_a` to destroy; then `tofu apply`.
4. [ ] Supabase: `DROP DATABASE titrit_strapi;` and `DROP ROLE strapi;`
5. [ ] Secrets: remove `CMS_REVALIDATE_TOKEN` / `NEXT_PUBLIC_CMS_URL` from Vercel env; prune `pass maison-titrit/strapi/*`, `supabase/titrit/strapi-role`; delete `~/.ssh/oci_strapi_ed25519` and the `cms` ssh alias.
6. [ ] Delete this section.

**Was live:** `https://cms.maisontitrit.com/admin` (Strapi 5.59 + Postgres `titrit_strapi` on Supabase).

| What | Value |
|---|---|
| VM | `maison-titrit-cms`, OCI tenant `maison-titrit` (`cloud account: maison-titrit`), admin `maisontitrit167@gmail.com` (password in pass `accounts/oracle/cloud/maison-titrit`) |
| Shape | Always-Free `VM.Standard.A1.Flex` 2 OCPU / 12 GB, Ubuntu 22.04, region af-casablanca-1 |
| Public IP | `51.170.135.240` (managed via Terraform `terraform/`; may change on instance replace — terraform rewrites the Cloudflare `cms` A record automatically) |
| SSH | `ssh cms` (alias in `~/.ssh/config`; key `~/.ssh/oci_strapi_ed25519`, host key verified) |
| Stack | docker compose under `/srv/cms` (`docker-compose.yml` + `.env`, secrets from pass `maison-titrit/strapi/*` + `supabase/titrit/strapi-role`) |

Stack layout: Cloudflare (proxied, TLS) → nginx on VM (80 + self-signed 443) → docker compose `cms` → Strapi `127.0.0.1:1337` → Supabase Postgres (pooler `aws-0-eu-west-1.pooler.supabase.com`, user `strapi.rrhzxrcgphlaxybahhep`, SSL).

Content types: `api::article.article` (blog) and `api::lookbook.lookbook` (seasonal lookbooks) — schema in `cms/src/api/*/content-types/*/schema.json`, draft-and-publish on. Products/orders stay in the web app's Prisma DB, not in Strapi. Public API permissions for these types (`find`, `findOne`, enabled 2026-10-27 via `up_permissions` + `up_permissions_role_lnk` seeded for role `public`, verified `/api/articles` + `/api/lookbooks` → 200). Gotcha: tsc only emits JS — the image build copies `schema.json` into `dist/src/api/**` (docker/cms.Dockerfile), since Strapi 5 loads content-type schemas from `dist`.

Rebuild the CMS image (ARM! must build on the VM — the local dev box is x86):
```sh
tar -czf /tmp/cms-src.tar.gz --exclude='cms/node_modules' --exclude='cms/dist' cms docker/cms.Dockerfile
scp -i ~/.ssh/oci_strapi_ed25519 /tmp/cms-src.tar.gz cms:/tmp/
ssh cms 'tar -xzf /tmp/cms-src.tar.gz -C /tmp && docker build -f /tmp/docker/cms.Dockerfile -t openanaffa/maison-titrit-cms:latest /tmp && systemctl --version >/dev/null && cd /srv/cms && docker compose up -d'
```

**VM gotchas (bit us once — keep these):**
1. **iptables**: OCI Ubuntu images ship a default `REJECT all` on INPUT after SSH — 80/443 must be opened explicitly before UFW adds anything (`sudo iptables -I INPUT 5 -p tcp -m state --state NEW -m tcp --dport 80 -j ACCEPT`, same for 443, then `iptables-save > /etc/iptables/rules.v4`). UFW alone is not enough.
2. **Docker build**: Docker 29 defaulted to the containerd snapshotter which choked on large npm trees — `/etc/docker/daemon.json` pins `{"features":{"containerd-snapshotter":false}}` (overlay2 works).
3. **nginx sites**: `cms.conf` under `/etc/nginx/sites-available` (self-signed cert `/etc/ssl/certs/cms-self.crt`, 10 yrs) — `default` site removed.
4. Runtime deps live in `/srv/cms/.env` only; rotate secrets by editing + `docker compose up -d`.

---

## 6. SEO submission

1. **Google Search Console** → add property `maisontitrit.com` → verify (Cloudflare TXT or HTML) → submit `https://maisontitrit.com/sitemap.xml`
2. **Bing Webmaster Tools** → add site → submit sitemap
3. **Google Merchant Center** → Settings → Shopping ads → feed URL: `https://maisontitrit.com/feed.xml`
4. **Meta Business** → verify domain (`NEXT_PUBLIC_META_DOMAIN` env) for Pixel
5. **AI crawlers**: already allowed in `robots.txt` (GPTBot/ClaudeBot/PerplexityBot) — no submission needed; they'll pick up `LLMs.md` on crawl.

---

## 7. Backups & ongoing ops

- **Supabase**: auto daily backups on paid tier; on free tier, use `bunx prisma export` or Supabase's SQL dump weekly
- **R2**: durable; versioning can be enabled per bucket for accidental-delete protection
- **Logs**: Vercel dashboard → Functions/Edge logs; Supabase → Logs
- **Updates**: `bun update` → run `bun run lint` → deploy. Prisma migrations via `prisma migrate dev` (dev) / `prisma db push` (prod, with care)

---

## Rollback

Vercel keeps every deploy. Project → Deployments → any previous deploy → **... → Promote to Production**. Instant rollback.

---

## Common issues

| Symptom | Fix |
|---|---|
| Login → `error=Configuration` | `NEXTAUTH_SECRET` not set in Vercel env |
| Image upload 500 in prod | R2 env vars not set; Vercel FS is ephemeral |
| Sitemap URLs are localhost | `NEXT_PUBLIC_SITE_URL` not set to your domain |
| Magic link not emailed | `EMAIL_SERVER_*` not set (works in dev via console log) |
| Prisma "database not found" | Supabase project paused (free tier); resume in Supabase |
| `provider = sqlite` error after swap | Run `bunx prisma generate` after editing schema.prisma |

---

## TL;DR one-liner order

1. Create Supabase project + get `DATABASE_URL`
2. Swap `provider = "postgresql"` in `prisma/schema.prisma`, `prisma db push`, seed
3. Create R2 bucket + API token + custom domain
4. Import repo to Vercel, set all env vars, deploy
5. Point Cloudflare DNS to Vercel, verify
6. Submit sitemap + feed to Google

You're live. 🚀
