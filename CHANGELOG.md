# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

## [1.1.0] - 2026-11-07

### Added
- Categories CRUD edit gap closed: `PATCH /api/admin/categories/[id]` (name/slug/position, `categories:write`) and inline edit UI in `categories-client.tsx` alongside existing add/delete (makteb backoffice)
- Makteb order details page (O1-O3)
- Add-to-cart on product cards with inline size picker
- Staff new-order alerts (email + WAFINE WhatsApp), branded emails
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
