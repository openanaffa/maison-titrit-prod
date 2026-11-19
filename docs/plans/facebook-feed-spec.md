# Facebook Commerce Feed Spec — Maison Titrit

**Feed endpoint:** `https://maisontitrit.com/feed.xml`  
**Format:** RSS 2.0 + Google `g:` namespace (Google Merchant Center compatible)  
**Cache:** `public, max-age=3600, s-maxage=3600`  
**Locale:** fr (site default)  
**Currency:** MAD

---

## Feed Item Schema

| Field | Source | Required | Description | Example |
|-------|--------|----------|-------------|---------|
| `g:id` | `p.ref` | ✅ | Product reference / SKU | `MT-NOUR` |
| `title` | `p.name` | ✅ | Product name | `Robe Nour` |
| `description` | `p.shortStory` or `p.description` | ✅ | Product description (XML-escaped) | `Une ligne longue et ceinturée...` |
| `link` | `SITE_URL + /produit/${p.ref}` | ✅ | Product page URL | `https://maisontitrit.com/produit/MT-NOUR` |
| `image_link` | `p.images[0].url` (fallback: `lora-beige.png`) | ✅ | Primary product image | `https://maisontitrit.com/images/maison-titrit/robe-nour.png` |
| `g:availability` | Hardcoded `in_stock` (only `inStock: true` products are returned) | ✅ | `in_stock` or `out_of_stock` | `in_stock` |
| `g:price` | `(p.salePrice ?? p.price).toFixed(2)` | ✅ | Price in MAD | `290.00` |
| `g:sale_price` | `p.salePrice` if set | ⬜ | Sale price | `249.00` |
| `g:brand` | `site.name` | ✅ | Brand name | `Maison Titrit` |
| `g:condition` | Hardcoded `new` | ✅ | Item condition | `new` |
| `g:gtin` | `p.ref` | ✅ | GTIN (uses ref as placeholder) | `MT-NOUR` |
| `g:mpn` | `p.ref` | ✅ | Manufacturer part number | `MT-NOUR` |
| `g:product_type` | `p.category.name` | ✅ | Product type | `Modern` / `Moroccan` |
| `g:google_product_category` | Hardcoded `1604` | ✅ | Apparel & Accessories > Clothing | `1604` |
| `g:identifier_exists` | Hardcoded `no` | ✅ | No GTIN/MPN real values | `no` |
| `g:shipping` | country `MA`, service `Standard`, price `0.00 MAD` | ✅ | Free standard shipping to Morocco | |
| `g:custom_label_0` | Hardcoded `modest fashion` | ✅ | Custom label | `modest fashion` |
| `g:custom_label_1` | Hardcoded `made in morocco` | ✅ | Custom label | `made in morocco` |

---

## Current State (as of 2026-11-18)

- **Feed returns products where `inStock: true` only** (SQL `where: { inStock: true }`).
- **All 14 seeded products are `inStock: false`** → feed currently returns **0 items**.
- **Feed declares `in_stock` for every item it returns** — this is correct per-item but the feed is empty until stock flags are flipped.
- **Homepage/feed price mismatch:** Sahar seed price 520 MAD vs feed/homepage 399 MAD; Étoile seed 720 MAD vs 438 MAD. Royal matches at 890 MAD.

---

## What the Client Needs to Provide

1. **Physical stock count** for each of the 14 products → update `stock_qty` and `in_stock` in `docs/plans/inventory-template.csv`.
2. **Price confirmation** — Sahar (520 → 399?), Étoile (720 → 438?) and all other prices are editorial drafts.
3. **Material confirmation** — 13 of 14 products have `Composition à confirmer`.
4. **Meta Pixel ID + CAPI access token** — needed for server-side purchase tracking (`META_PIXEL_ID`, `META_CAPI_ACCESS_TOKEN` env vars). Currently unconfigured.
5. **Facebook Business / Commerce Manager access** — to connect this feed as a catalogue source (read-only templates only this session; no account edits).

---

## Feed URL for Commerce Manager

Submit this URL in Facebook Commerce Manager → Catalogs → Add items → Use a data feed:

```
https://maisontitrit.com/feed.xml
```
