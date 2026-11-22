-- Delivery zones: coverage and fees.
--
-- Adds a DeliveryZone table and delivery snapshot columns on Order.
-- Idempotent.

CREATE TABLE IF NOT EXISTS public."DeliveryZone" (
  "id"        text PRIMARY KEY,
  "name"      text NOT NULL,
  "cities"    text NOT NULL,
  "fee"       integer NOT NULL DEFAULT 0,
  "isActive"  boolean NOT NULL DEFAULT true,
  "createdAt" timestamptz NOT NULL DEFAULT now(),
  "updatedAt" timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS "DeliveryZone_isActive_idx" ON public."DeliveryZone" ("isActive");

-- Add delivery snapshot columns to Order.
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='Order' AND column_name='deliveryZoneId') THEN
    ALTER TABLE public."Order" ADD COLUMN "deliveryZoneId" text REFERENCES public."DeliveryZone"("id") ON DELETE SET NULL;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='Order' AND column_name='deliveryZoneName') THEN
    ALTER TABLE public."Order" ADD COLUMN "deliveryZoneName" text;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='Order' AND column_name='deliveryFee') THEN
    ALTER TABLE public."Order" ADD COLUMN "deliveryFee" integer NOT NULL DEFAULT 0;
  END IF;
END $$;

CREATE INDEX IF NOT EXISTS "Order_deliveryZoneId_idx" ON public."Order" ("deliveryZoneId");

-- RLS for DeliveryZone (public read active, staff write).
ALTER TABLE public."DeliveryZone" ENABLE ROW LEVEL SECURITY;

REVOKE ALL ON TABLE public."DeliveryZone" FROM anon, authenticated;
GRANT SELECT ON TABLE public."DeliveryZone" TO anon, authenticated;
GRANT INSERT, UPDATE, DELETE ON TABLE public."DeliveryZone" TO authenticated;

DROP POLICY IF EXISTS "catalog_read_zones" ON public."DeliveryZone";
CREATE POLICY "catalog_read_zones" ON public."DeliveryZone"
  FOR SELECT TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "staff_write_zones" ON public."DeliveryZone";
CREATE POLICY "staff_write_zones" ON public."DeliveryZone"
  FOR ALL TO authenticated
  USING ((SELECT public.requesting_user_role()) IN ('FOUNDER', 'DEVELOPER', 'ADMIN'))
  WITH CHECK ((SELECT public.requesting_user_role()) IN ('FOUNDER', 'DEVELOPER', 'ADMIN'));
