# ADR 0001 — Product variants and SKU data model

Status: Accepted (issue #115)

## Context

Products previously modelled availability as free-text `colors` / `sizes` strings
plus a single `inStock` boolean. There was no stable identity for a
size/colour combination, so inventory and checkout could not reason about a
specific sellable unit.

## Decision

Introduce a `ProductVariant` table where each row is one purchasable
size/colour combination of a `Product`:

- `id` (cuid), `productId` FK (cascade delete)
- `sku` (globally unique, stable)
- `size`, `color` (nullable for products without options)
- `priceOverride` (optional, null falls back to product price/salePrice)
- `isActive`, `position`
- unique constraint on `(productId, size, color)`

`OrderItem` gains `variantId` (nullable FK, set null on variant delete),
`sku` (snapshot) and `color` (snapshot), while keeping `productId`, `ref`,
`name`, `price`, `quantity`, `size` for historical accuracy.

Existing `Product.colors` / `Product.sizes` / `Product.inStock` are retained
for backward compatibility with the storefront and admin until #120 migrates
editing to variants.

## SKU strategy

`SKU = <PRODUCT_REF>[-<SIZE_TOKEN>][-<COLOR_TOKEN>]`, upper-cased and
sanitised. Helpers live in `web/src/lib/variants.ts`
(`buildVariantSku`, `variantCombinations`, `parseOptions`).

## Migration / backfill

- `supabase/migrations/20261120000000_product_variants.sql` creates the
  table, extends `OrderItem`, backfills one default variant per existing
  product (sku = product ref) and links existing order items to it.
- Prisma schemas (sqlite + postgres) updated in lockstep; both clients
  regenerated.

## Consequences

- Inventory (#116) can attach quantities to a variant instead of a product.
- Checkout (#117) can validate against a variant and snapshot its SKU.
- Backoffice editing and PDP selection migrate in #120/#124; until then the
  legacy fields remain authoritative for display.

## Rejected alternatives

- Replacing `Product` entirely with variants: too invasive, breaks existing
  storefront/feed/analytics keyed on product ref.
- Storing variants as JSON on Product: loses referential integrity and
  prevents per-variant inventory/locking.
