-- Inventory ledger: on-hand/reserved quantities per variant + StockMovement audit.
--
-- Adds inventory columns to ProductVariant and introduces the StockMovement
-- ledger. Idempotent.

-- 1. Add inventory columns to ProductVariant.
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='ProductVariant' AND column_name='onHand') THEN
    ALTER TABLE public."ProductVariant" ADD COLUMN "onHand" integer NOT NULL DEFAULT 0;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='ProductVariant' AND column_name='reserved') THEN
    ALTER TABLE public."ProductVariant" ADD COLUMN "reserved" integer NOT NULL DEFAULT 0;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='ProductVariant' AND column_name='lowStockThreshold') THEN
    ALTER TABLE public."ProductVariant" ADD COLUMN "lowStockThreshold" integer NOT NULL DEFAULT 0;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='ProductVariant' AND column_name='version') THEN
    ALTER TABLE public."ProductVariant" ADD COLUMN "version" integer NOT NULL DEFAULT 0;
  END IF;
END $$;

-- 2. Create StockMovement table.
CREATE TABLE IF NOT EXISTS public."StockMovement" (
  "id"              text PRIMARY KEY,
  "variantId"       text NOT NULL REFERENCES public."ProductVariant"("id") ON DELETE CASCADE,
  "type"            text NOT NULL,
  "quantity"        integer NOT NULL,
  "onHandAfter"     integer NOT NULL,
  "reservedAfter"   integer NOT NULL,
  "reason"          text,
  "actorId"         text,
  "sourceRef"       text,
  "idempotencyKey"  text UNIQUE,
  "createdAt"       timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS "StockMovement_variantId_idx" ON public."StockMovement" ("variantId");
CREATE INDEX IF NOT EXISTS "StockMovement_createdAt_idx" ON public."StockMovement" ("createdAt");
CREATE INDEX IF NOT EXISTS "StockMovement_sourceRef_idx" ON public."StockMovement" ("sourceRef");
CREATE INDEX IF NOT EXISTS "StockMovement_idempotencyKey_idx" ON public."StockMovement" ("idempotencyKey");

-- 3. RLS for StockMovement (staff read/write; no anon access).
ALTER TABLE public."StockMovement" ENABLE ROW LEVEL SECURITY;

REVOKE ALL ON TABLE public."StockMovement" FROM anon, authenticated;
GRANT SELECT, INSERT ON TABLE public."StockMovement" TO authenticated;

DROP POLICY IF EXISTS "staff_read_movements" ON public."StockMovement";
CREATE POLICY "staff_read_movements" ON public."StockMovement"
  FOR SELECT TO authenticated
  USING ((SELECT public.requesting_user_role()) IN ('FOUNDER', 'ADMIN', 'MANAGER'));

DROP POLICY IF EXISTS "staff_write_movements" ON public."StockMovement";
CREATE POLICY "staff_write_movements" ON public."StockMovement"
  FOR INSERT TO authenticated
  WITH CHECK ((SELECT public.requesting_user_role()) IN ('FOUNDER', 'ADMIN', 'MANAGER'));
