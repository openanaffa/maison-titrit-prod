-- Product variants (size/colour combinations) with stable SKUs.
--
-- Introduces a ProductVariant table so each purchasable size/colour
-- combination of a Product has its own identity and SKU. Existing products
-- are backfilled with one default variant each; existing OrderItem rows are
-- backfilled with the product ref as their SKU snapshot and linked to the
-- product's default variant where possible.
--
-- Idempotent: every step is guarded.

-- 1. Create the ProductVariant table.
CREATE TABLE IF NOT EXISTS public."ProductVariant" (
  "id"            text PRIMARY KEY,
  "productId"     text NOT NULL REFERENCES public."Product"("id") ON DELETE CASCADE,
  "sku"           text NOT NULL UNIQUE,
  "size"          text,
  "color"         text,
  "priceOverride" integer,
  "isActive"      boolean NOT NULL DEFAULT true,
  "position"      integer NOT NULL DEFAULT 0,
  "createdAt"     timestamptz NOT NULL DEFAULT now(),
  "updatedAt"     timestamptz NOT NULL DEFAULT now()
);

-- Unique combination per product (NULLs allowed: a product with no options
-- gets a single default variant with NULL size/colour).
CREATE UNIQUE INDEX IF NOT EXISTS "ProductVariant_productId_size_color_key"
  ON public."ProductVariant" ("productId", "size", "color");

CREATE INDEX IF NOT EXISTS "ProductVariant_productId_idx"
  ON public."ProductVariant" ("productId");
CREATE INDEX IF NOT EXISTS "ProductVariant_isActive_idx"
  ON public."ProductVariant" ("isActive");

-- 2. Backfill a default variant for every existing product that has none.
INSERT INTO public."ProductVariant" ("id", "productId", "sku", "isActive", "position")
SELECT
  'pv_' || p."id",
  p."id",
  p."ref",
  true,
  0
FROM public."Product" p
WHERE NOT EXISTS (
  SELECT 1 FROM public."ProductVariant" v WHERE v."productId" = p."id"
);

-- 3. Extend OrderItem with variant reference + snapshot columns.
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'OrderItem' AND column_name = 'variantId'
  ) THEN
    ALTER TABLE public."OrderItem" ADD COLUMN "variantId" text
      REFERENCES public."ProductVariant"("id") ON DELETE SET NULL;
  END IF;
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'OrderItem' AND column_name = 'sku'
  ) THEN
    ALTER TABLE public."OrderItem" ADD COLUMN "sku" text;
  END IF;
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'OrderItem' AND column_name = 'color'
  ) THEN
    ALTER TABLE public."OrderItem" ADD COLUMN "color" text;
  END IF;
END $$;

CREATE INDEX IF NOT EXISTS "OrderItem_variantId_idx" ON public."OrderItem" ("variantId");

-- 4. Backfill OrderItem snapshots.
--    SKU is always set to the product ref as a stable historical snapshot.
--    variantId is linked ONLY when a matching variant (productId + size +
--    color) already exists; historical order items whose size/colour does not
--    map to a real variant keep variantId NULL instead of being mis-attributed
--    to the product's default (null/null) variant.
UPDATE public."OrderItem" oi
SET "sku" = p."ref"
FROM public."Product" p
WHERE oi."productId" = p."id" AND oi."sku" IS NULL;

UPDATE public."OrderItem" oi
SET "variantId" = v."id"
FROM public."ProductVariant" v
WHERE oi."variantId" IS NULL
  AND v."productId" = oi."productId"
  AND v."size" IS NOT DISTINCT FROM oi."size"
  AND v."color" IS NOT DISTINCT FROM oi."color";

-- 5. RLS for ProductVariant (mirror Product: public read, staff write).
ALTER TABLE public."ProductVariant" ENABLE ROW LEVEL SECURITY;

REVOKE ALL ON TABLE public."ProductVariant" FROM anon, authenticated;
GRANT SELECT ON TABLE public."ProductVariant" TO anon, authenticated;
GRANT INSERT, UPDATE, DELETE ON TABLE public."ProductVariant" TO authenticated;

DROP POLICY IF EXISTS "catalog_read_variants" ON public."ProductVariant";
CREATE POLICY "catalog_read_variants" ON public."ProductVariant"
  FOR SELECT TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "staff_write_variants" ON public."ProductVariant";
CREATE POLICY "staff_write_variants" ON public."ProductVariant"
  FOR ALL TO authenticated
  USING ((SELECT public.requesting_user_role()) IN ('FOUNDER', 'ADMIN'))
  WITH CHECK ((SELECT public.requesting_user_role()) IN ('FOUNDER', 'ADMIN'));
