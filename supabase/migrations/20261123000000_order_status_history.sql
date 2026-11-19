-- Order status history and separate payment/fulfilment status.
--
-- Adds paymentStatus and fulfilmentStatus columns to Order, creates the
-- OrderStatusHistory audit table, and backfills existing orders. Idempotent.

-- 1. Add columns to Order.
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='Order' AND column_name='paymentStatus') THEN
    ALTER TABLE public."Order" ADD COLUMN "paymentStatus" text NOT NULL DEFAULT 'UNPAID';
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='Order' AND column_name='fulfilmentStatus') THEN
    ALTER TABLE public."Order" ADD COLUMN "fulfilmentStatus" text NOT NULL DEFAULT 'UNFULFILLED';
  END IF;
END $$;

-- 2. Backfill existing orders based on status.
-- Convert legacy SHIPPED status to the new DISPATCHED status.
UPDATE public."Order" SET "status" = 'DISPATCHED' WHERE "status" = 'SHIPPED';
UPDATE public."Order" SET "paymentStatus" = 'PAID' WHERE "status" = 'DELIVERED' AND "paymentStatus" = 'UNPAID';
UPDATE public."Order" SET "paymentStatus" = 'UNPAID' WHERE "status" IN ('PENDING','CONFIRMED','PROCESSING','DISPATCHED','CANCELLED','RETURN_REQUESTED') AND "paymentStatus" IS NULL;
UPDATE public."Order" SET "fulfilmentStatus" = 'DELIVERED' WHERE "status" IN ('DELIVERED','RETURN_REQUESTED');
UPDATE public."Order" SET "fulfilmentStatus" = 'SHIPPED' WHERE "status" = 'DISPATCHED';
UPDATE public."Order" SET "fulfilmentStatus" = 'PROCESSING' WHERE "status" = 'PROCESSING';
UPDATE public."Order" SET "fulfilmentStatus" = 'UNFULFILLED' WHERE "status" IN ('PENDING','CONFIRMED','CANCELLED');

-- 3. Create OrderStatusHistory table.
CREATE TABLE IF NOT EXISTS public."OrderStatusHistory" (
  "id"               text PRIMARY KEY,
  "orderId"          text NOT NULL REFERENCES public."Order"("id") ON DELETE CASCADE,
  "fromStatus"       text,
  "toStatus"         text NOT NULL,
  "paymentStatus"    text,
  "fulfilmentStatus" text,
  "actorId"          text,
  "reason"           text,
  "createdAt"        timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS "OrderStatusHistory_orderId_idx" ON public."OrderStatusHistory" ("orderId");
CREATE INDEX IF NOT EXISTS "OrderStatusHistory_createdAt_idx" ON public."OrderStatusHistory" ("createdAt");

-- 4. RLS.
ALTER TABLE public."OrderStatusHistory" ENABLE ROW LEVEL SECURITY;

REVOKE ALL ON TABLE public."OrderStatusHistory" FROM anon, authenticated;
GRANT SELECT, INSERT ON TABLE public."OrderStatusHistory" TO authenticated;

DROP POLICY IF EXISTS "staff_read_order_history" ON public."OrderStatusHistory";
CREATE POLICY "staff_read_order_history" ON public."OrderStatusHistory"
  FOR SELECT TO authenticated
  USING ((SELECT public.requesting_user_role()) IN ('FOUNDER', 'ADMIN', 'MANAGER'));

DROP POLICY IF EXISTS "staff_write_order_history" ON public."OrderStatusHistory";
CREATE POLICY "staff_write_order_history" ON public."OrderStatusHistory"
  FOR INSERT TO authenticated
  WITH CHECK ((SELECT public.requesting_user_role()) IN ('FOUNDER', 'ADMIN', 'MANAGER'));
