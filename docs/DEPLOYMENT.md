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
   postgresql://postgres.[PROJECT]:[PASSWORD]@aws-0-eu-west-1.pooler.supabase.com:5432/postgres
   ```
3. Use the checked-in Postgres schema; keep `schema.prisma` on SQLite for local development.
4. Push the Postgres schema and synchronize the catalog/editorial seed:
   ```sh
   cd web
   DATABASE_URL="postgresql://postgres.[PROJECT]:[PASSWORD]@aws-0-eu-west-1.pooler.supabase.com:5432/postgres" \
     bunx prisma db push --accept-data-loss --schema=prisma/schema.postgres.prisma
   DATABASE_URL="postgresql://postgres.[PROJECT]:[PASSWORD]@aws-0-eu-west-1.pooler.supabase.com:5432/postgres" \
     bun run seed:prod
   ```
   `seed:prod` generates the Postgres Prisma client and upserts only the seeded categories, product references, and article slugs. It does not delete products, order items, orders, users, or unrelated categories. The script refuses SQLite URLs.

   The auth migration intentionally removes the old NextAuth token/account tables and the app-owned password hash column; application profiles, roles, and orders are retained. Run [`supabase/migrations/20261114000100_supabase_auth_rbac.sql`](../supabase/migrations/20261114000100_supabase_auth_rbac.sql) in Supabase SQL Editor after `db push`. It links Supabase Auth users to existing app profiles, installs the role hook, and enables RLS on the application tables.

5. Verify in Supabase → Table Editor: 14 seeded `Product` rows, 7 each in `Modern` and `Moroccan`, and 16 seeded `Article` rows. Unseeded products, orders, users, and articles remain untouched.

> **Local dev** keeps Prisma on SQLite (`DATABASE_URL=file:...`), but auth, RLS-protected backoffice pages, and protected API mutations use Supabase. Use a separate development Supabase project for local auth and staff data; do not point local development at production customer data. Apply the schema and auth migration there as well. The production catalog seed intentionally targets Postgres only.

## 1b. Supabase Auth, roles, and RLS

1. In Supabase → **Authentication → Providers**, enable Email and Google, and require email confirmation. Configure the Google OAuth client in Google Cloud with Supabase's callback URL (`https://[PROJECT-REF].supabase.co/auth/v1/callback`) as its authorized redirect URI; enter the client ID/secret in Supabase, not Vercel.
2. Set **Authentication → URL Configuration → Site URL** to `https://maisontitrit.com`. Add `https://maisontitrit.com/auth/callback`, `http://localhost:3000/auth/callback`, and the exact Vercel preview callback URLs to the redirect allow list.
3. Configure **Authentication → Hooks → Custom Access Token** to call `public.custom_access_token_hook`. This adds the `user_role` claim for UI state. RLS policies resolve the current role from the linked profile row, so role changes take effect immediately instead of waiting for an old JWT to expire.
4. Set `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY` from Project Settings → API in the app environment. Do not expose a service-role key. The server-side Prisma connection remains private and is used only for public catalog content and validated checkout/order creation; staff and account data pages and mutations use the cookie-authenticated Supabase client and RLS.
5. Seed the initial founder profile with `ADMIN_EMAIL` before creating that Supabase Auth identity, then create/confirm an identity for the same address. The database trigger links it to the existing profile and role. If the identity already exists, explicitly assign its intended role to the linked app profile. New self-service registrations receive only the `CUSTOMER` role; do not grant staff roles through user metadata.

RLS is enforced at the database API for authenticated staff/customer reads and writes. The role hook is not a substitute for the policies; do not remove or bypass the migration. Keep the two Prisma schemas in sync when changing the profile model.

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
   | `NEXT_PUBLIC_SUPABASE_URL` | `https://[PROJECT-REF].supabase.co` | Production + Preview |
   | `NEXT_PUBLIC_SUPABASE_ANON_KEY` | `<Supabase publishable/anon key>` | Production + Preview |
   | `NEXT_PUBLIC_SITE_URL` | `https://maisontitrit.com` | Production |
   | `R2_ACCOUNT_ID` | `<from R2>` | Production |
   | `R2_BUCKET` | `maison-titrit` | Production |
   | `R2_ACCESS_KEY_ID` | `<from R2>` | Production |
   | `R2_SECRET_ACCESS_KEY` | `<from R2>` | Production |
   | `R2_PUBLIC_URL` | `https://cdn.maisontitrit.com` | Production |
   | `EMAIL_SERVER_HOST` | `smtp-relay.brevo.com` | Production (staff order alerts only) |
   | `EMAIL_SERVER_PORT` | `587` | Production |
   | `EMAIL_SERVER_USER` | `<Brevo SMTP login, xxx@smtp-brevo.com>` | Production |
   | `EMAIL_SERVER_PASSWORD` | `<Brevo SMTP key>` | Production |
   | `EMAIL_FROM` | `Maison Titrit <hello@maisontitrit.com>` | Production |
   | `NEXT_PUBLIC_GTM_ID` | `GTM-XXXXXXX` | Production (optional) |
   | `NEXT_PUBLIC_GA4_ID` | `G-XXXXXXXXXX` | Production (optional) |
   | `NEXT_PUBLIC_FB_PIXEL_ID` | `<15-digit ID>` | Production (optional) |
   | `NEXT_PUBLIC_PINTEREST_TAG_ID` | `<Pinterest Tag ID>` | Production (optional) |
   | `NEXT_PUBLIC_TIKTOK_PIXEL_ID` | `<TikTok Pixel ID>` | Production (optional) |
   | `NEXT_PUBLIC_YOUTUBE_CHANNEL_ID` | `<YouTube channel @handle>` | Production (optional) |
   | `GA_MEASUREMENT_ID` | `G-XXXXXXXXXX` | Production (optional, server) |
   | `GA_API_SECRET` | `<from GA4>` | Production (optional, server) |
   | `META_PIXEL_ID` | `<Meta Pixel ID>` | Production (optional, server) |
   | `META_CAPI_ACCESS_TOKEN` | `<Meta CAPI token>` | Production (optional, server) |

   `ADMIN_EMAIL` is only needed when `seed:prod` should create a founder profile. Google credentials belong in Supabase Auth provider settings, not Vercel.

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
- [ ] Sign in with Google or a confirmed email/password account using the founder email (must match the seeded `ADMIN_EMAIL`) → dashboard shows the seeded catalog
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
| Login fails or auth callback returns an error | Check Supabase Auth provider settings, URL allow list, and `NEXT_PUBLIC_SUPABASE_URL` / `NEXT_PUBLIC_SUPABASE_ANON_KEY` |
| Staff account is redirected away from `/makteb` or gets no RLS rows | Confirm the Supabase identity's email matches its application profile, SQL migration is applied, role hook is enabled, and profile has the intended role |
| Image upload 500 in prod | R2 env vars not set; Vercel FS is ephemeral |
| Sitemap URLs are localhost | `NEXT_PUBLIC_SITE_URL` not set to your domain |
| Staff order alert email missing | `EMAIL_SERVER_*` not set (Supabase Auth email delivery is configured separately in Supabase) |
| Prisma "database not found" | Supabase project paused (free tier); resume in Supabase |
| `provider = sqlite` error after swap | Run `bunx prisma generate` after editing schema.prisma |

---

## TL;DR one-liner order

1. Create Supabase project + get `DATABASE_URL`
2. Push the Postgres Prisma schema, seed, and apply the Supabase Auth/RLS SQL migration
3. Configure Supabase Email/Google providers, redirect URLs, and the custom access-token hook
4. Create R2 bucket + API token + custom domain
5. Import repo to Vercel, set all env vars, deploy
6. Point Cloudflare DNS to Vercel, verify
7. Submit sitemap + feed to Google

You're live. 🚀

## Backups & restore

Nightly at 02:17 UTC, `.github/workflows/db-backup.yml` dumps the Supabase `public` schema (`pg_dump` 17, custom format), encrypts it with `age`, and uploads it to the private R2 bucket `maison-titrit-backups` under `db/YYYY/MM/DD/`. Objects under `db/` expire after 30 days (R2 lifecycle rule `expire-db-30d`). A run fails, and GitHub emails you, if the dump has fewer than 10 tables.

GitHub Actions secrets: `BACKUP_DATABASE_URL` (session pooler `aws-0-eu-west-1.pooler.supabase.com:5432`, user `postgres.<project-ref>`, `sslmode=require`; the direct `db.*.supabase.co` host is IPv6-only and unreachable from Actions), `R2_BACKUP_ACCESS_KEY_ID`, `R2_BACKUP_SECRET_ACCESS_KEY` (an R2 token scoped to this bucket only), `R2_ACCOUNT_ID`. The age private key is only in `pass maison-titrit/backup/age-identity`.

Do **not** reuse the app's `DATABASE_URL` here: it uses the transaction pooler (`:6543`, `?pgbouncer=true`), which Supabase does not support for `pg_dump`. Backups need the **session pooler** on `:5432` with user `postgres.<project-ref>`. Copy the string from Supabase Dashboard → Connect → Session pooler and percent-encode reserved characters in the password (`&`, `#`, `?`, `@`, space). The workflow validates the URL shape first and fails with a diagnostic — without printing the password — if it is wrong.

Run one now: GitHub → Actions → db-backup → Run workflow.

Restore (into a scratch database first, never straight over prod):

```sh
aws s3 cp s3://maison-titrit-backups/db/<date>/<file>.pgc.age . --endpoint-url https://<account-id>.r2.cloudflarestorage.com
age -d -i <(pass show maison-titrit/backup/age-identity) <file>.pgc.age > dump.pgc
pg_restore --list dump.pgc | grep -c 'TABLE DATA'            # sanity check
pg_restore --no-owner --no-privileges --clean --if-exists -d "$TARGET_DATABASE_URL" dump.pgc
```
