-- Codex P1 (PR #147): the OrderNotification ledger stores customer
-- identifiers (email / digits-only phone in `to`). Created via prisma db
-- push, it inherits the default public-schema grants, so a caller holding
-- the storefront's public anon key could read notification rows without
-- passing any admin permission check.
--
-- The storefront never reads this table through the anon client; writes go
-- through the service role (Prisma), which bypasses RLS. Anon access is
-- revoked; authenticated staff get read access only.

REVOKE SELECT ON TABLE public."OrderNotification" FROM anon;

ALTER TABLE public."OrderNotification" ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "staff_read_order_notifications" ON public."OrderNotification";
CREATE POLICY "staff_read_order_notifications" ON public."OrderNotification"
  FOR SELECT TO authenticated
  USING (
    (SELECT public.requesting_user_role())
      IN ('FOUNDER', 'ADMIN', 'DEVELOPER', 'MANAGER', 'MARKETER')
  );
