-- #147 review: the Order delivery provider/reference columns and the
-- OrderNotification ledger were applied to the live database with
-- `prisma db push` (documented in the PR). This migration records the
-- same DDL so the change is reproducible from the repository's migration
-- history. All statements are idempotent: the live database already has
-- these objects.

ALTER TABLE public."Order"
  ADD COLUMN IF NOT EXISTS "deliveryProvider" TEXT;
ALTER TABLE public."Order"
  ADD COLUMN IF NOT EXISTS "deliveryReference" TEXT;

CREATE TABLE IF NOT EXISTS public."OrderNotification" (
  "id"            TEXT NOT NULL,
  "orderId"       TEXT NOT NULL,
  "event"         TEXT NOT NULL,          -- CONFIRMED | DISPATCHED | DELIVERED
  "channel"       TEXT NOT NULL,          -- EMAIL | WHATSAPP
  "to"            TEXT NOT NULL,          -- email address or digits-only phone
  "status"        TEXT NOT NULL DEFAULT 'PENDING', -- SENT | FAILED | PENDING | SENDING
  "attempts"      INTEGER NOT NULL DEFAULT 0,
  "lastError"     TEXT,
  "lastAttemptAt" TIMESTAMP(3),
  "createdAt"     TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

  CONSTRAINT "OrderNotification_pkey" PRIMARY KEY ("id")
);

CREATE INDEX IF NOT EXISTS "OrderNotification_orderId_idx"
  ON public."OrderNotification"("orderId");
CREATE INDEX IF NOT EXISTS "OrderNotification_status_idx"
  ON public."OrderNotification"("status");
-- Duplicate-safe enqueue backstop (also asserted in application logic).
CREATE UNIQUE INDEX IF NOT EXISTS "OrderNotification_orderId_event_channel_key"
  ON public."OrderNotification"("orderId", "event", "channel");

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint
    WHERE conname = 'OrderNotification_orderId_fkey'
      AND conrelid = 'public."OrderNotification"'::regclass
  ) THEN
    ALTER TABLE public."OrderNotification"
      ADD CONSTRAINT "OrderNotification_orderId_fkey"
      FOREIGN KEY ("orderId") REFERENCES public."Order"("id")
      ON DELETE CASCADE ON UPDATE CASCADE;
  END IF;
END $$;
