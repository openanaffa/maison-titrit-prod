# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.2.0] - 2026-11-22

### Added
- **Commerce (M1)**: product variants and SKU data model; inventory ledger with reservations and atomic stock updates; transactional, idempotent order creation; validated order/payment/fulfilment state transitions with status history; delivery zones, rates and a checkout quote service. Supabase RLS lockdowns for variants, inventory and notifications.
- **Makteb operations (M2)**: inventory management workspace (stock table, actions, history, CSV export + CSV import with preview, row validation and ledger-safe commit); fulfilment queue and delivery operations; customer 360 with segments, notes, consents and audit timeline.
- **Production readiness (M4)**: isolated-local-Supabase Playwright E2E suite running against a production build in CI; accessibility, mobile UX and Core Web Vitals pass with WCAG AA contrast fixes and a CWV CI gate (CLS enforced in LHCI; performance/LCP tracked as warn + field-data release gate per `docs/performance-budgets.md`); Sentry monitoring (server + edge), correlation-ID tracing on checkout, backup restore drill + operational runbooks (ADR-0006); PWA M7 install UX, offline page and localized offline banner (fr/ar/en).
- **Trust & compliance**: delivery, returns, contact and sizing support pages; owner-editable legal identity settings; enforced tracking consent; multilingual metadata, sitemap and JSON-LD alignment.
- **i18n**: locale parity improvements, RTL layout and a11y affordances.

### Changed
- Removed unofficial Wafine WhatsApp API sends; staff and customer order notifications now use email only. Customer-initiated wa.me links remain available.
- Performance: removed the 3.2s brand intro loader on the homepage.
- Attribution capture hydrates consent before UTM capture; UTM columns normalized on orders.

### Fixed
- Variant enforcement at checkout + reservation settlement on order transitions.
- Unified size parsing between storefront UI and checkout.
- Primary-key generation for Supabase-client inserts; RBAC anon read for legal settings; Arabic legal copy and revision dates.

### Removed
- Wafine integration code, env vars and dependencies (`WAFINE_*`).

## [1.1.0] - 2026-11-07

### Added
- Categories CRUD edit gap closed: `PATCH /api/admin/categories/[id]` (name/slug/position, `categories:write`) and inline edit UI in `categories-client.tsx` alongside existing add/delete (makteb backoffice)
- Makteb order details page (O1-O3)
- Add-to-cart on product cards with inline size picker
- Staff new-order email alerts, branded emails
- Vercel BotID on checkout, register, and track
- Nightly encrypted Supabase backups to R2
- Runtime-configurable trackers and domain-verification tags editable via `/makteb/settings` without a redeploy: GTM, GA4, Meta Pixel, Pinterest Tag, TikTok Pixel, YouTube channel, plus Google, Facebook, Instagram, TikTok and custom verification tags

### Changed
- Align Postgres Prisma schema with the order/UTM fields used by the app and production deployment
- UTM parameters captured and saved on orders (Mission 4 M6)

### Performance
- Hero image paints immediately for LCP (P2)
- CSS-only Reveal, framer-motion removed (P4); GTM/GA4 deferred to `lazyOnload` (P4)
- `next/image` for storefront and admin rasters

### SEO
- SEO S0: crawlable `noindex` instead of `Disallow` in `robots.txt`
- Mission 6 SEO + P4 speed/a11y completion
- JSON-LD structured data layer for Organization, LocalBusiness, WebSite, Product, Breadcrumb, ItemList, and FAQPage
- AI/LLM discovery surface: `/llms.txt`, `/llms-full.txt`, `/feed.xml` (Merchant Center), and dynamic `sitemap.xml`

## [1.0.0] - 2026-10-29

### Added
- Initial public release (maison-titrit-prod storefront + makteb backoffice)
