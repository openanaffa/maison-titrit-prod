-- Idempotent checkout: add idempotency key to Order.
--
-- Allows repeated form submissions / webhook retries to resolve to a single
-- order. Idempotent.

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'Order' AND column_name = 'idempotencyKey'
  ) THEN
    ALTER TABLE public."Order" ADD COLUMN "idempotencyKey" text;
  END IF;
END $$;

CREATE UNIQUE INDEX IF NOT EXISTS "Order_idempotencyKey_key"
  ON public."Order" ("idempotencyKey");
CREATE INDEX IF NOT EXISTS "Order_idempotencyKey_idx"
  ON public."Order" ("idempotencyKey");
