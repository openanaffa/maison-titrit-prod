# Google Sheets Inventory Template — Column Guide

**File:** `docs/plans/inventory-template.csv`  
**Purpose:** Single source of truth for the 14-product Maison Titrit catalogue.  
**Use:** Copy this CSV into Google Sheets → File → Import → replace current sheet.  
**Language:** FR (storefront default) — column names in English for tooling compatibility.

---

## Columns

| Column | Type | Required | Description | Example |
|--------|------|----------|-------------|---------|
| `ref` | text | ✅ Yes | Product reference / SKU, unique across the catalogue. Used as `g:id` in the Facebook/Google product feed and `item_id` in GA4/Meta events. | `MT-NOUR` |
| `name` | text | ✅ Yes | Product display name, French-first. Used in titles, meta tags, and WhatsApp catalogue. | `Robe Nour` |
| `code` | text | ✅ Yes | Alias for `ref` (kept for feed compatibility). Same value as `ref`. | `MT-NOUR` |
| `category` | text | ✅ Yes | One of: `Modern`, `Moroccan`. Drives product-type in the feed and filtering on the storefront. | `Modern` |
| `price_mad` | number | ✅ Yes | Price in Moroccan Dirhams (MAD), whole number. Synced to the feed and checkout. | `290` |
| `size` | text | ✅ Yes | Size run, separator ` · ` (space-middle-dot-space). | `S · M · L · XL` |
| `material` | text | ✅ Yes | Fabric/composition. If not yet confirmed, write: `Composition à confirmer avant publication`. | `Brun cacao` |
| `stock_qty` | number | ✅ Yes | Physical units on hand. `0` = sold out / `in_stock: false`. Update after each store count. | `0` |
| `in_stock` | boolean | ✅ Yes | `true` if `stock_qty > 0`, else `false`. Drives `<g:availability>` in the feed and the out-of-stock badge on product cards. | `false` |
| `last_scan` | date | ⬜ Optional | Last physical inventory count date (ISO: YYYY-MM-DD). | `2026-11-18` |
| `notes` | text | ⬜ Optional | Free-text notes for the team (e.g. "photo pending", "price to confirm"). | |

---

## Rules

1. **One row per product.** 14 products currently seeded — do not delete rows.
2. **`ref` must be unique** — duplicates break the feed and analytics events.
3. **`in_stock` = `true` only when `stock_qty > 0`.** All 14 seeds are currently `false` (sold out) until the store count is done.
4. **Prices are editorial drafts** — confirm with the client before publishing.
5. **Materials marked "à confirmer"** must be confirmed before the product is listed as orderable.
6. **Export:** Google Sheets → File → Download → Comma-separated values (.csv). Replace `docs/plans/inventory-template.csv` with the new file.

---

## Sync to Storefront

The storefront reads the catalogue from `web/src/config/products.ts` (seed source) and from Supabase Postgres (runtime DB). After updating this sheet:

1. Review prices, stock flags, and materials.
2. Update `web/src/config/products.ts` if prices/stock changed (run `bun run seed:prod` from `web/` to push to Supabase).
3. The product feed at `/feed.xml` reflects DB `inStock: true` products only — update stock flags before the feed goes live for ordering.
