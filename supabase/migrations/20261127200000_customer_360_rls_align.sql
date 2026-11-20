-- Codex P2 (PR #150): align the customer-360 RLS policies with the
-- deliberate profile RLS narrowing that excludes MANAGER from reading
-- customer profiles (20261115120000_rbac_developer_marketer.sql). The
-- app-side customers:read permission is aligned to the same role set.

DROP POLICY IF EXISTS "staff_read_customer_notes" ON public."CustomerNote";
CREATE POLICY "staff_read_customer_notes" ON public."CustomerNote"
  FOR SELECT TO authenticated
  USING (
    (SELECT public.requesting_user_role())
      IN ('FOUNDER', 'ADMIN', 'DEVELOPER', 'MARKETER')
  );

DROP POLICY IF EXISTS "staff_read_customer_audit" ON public."CustomerAuditEvent";
CREATE POLICY "staff_read_customer_audit" ON public."CustomerAuditEvent"
  FOR SELECT TO authenticated
  USING (
    (SELECT public.requesting_user_role())
      IN ('FOUNDER', 'ADMIN', 'DEVELOPER', 'MARKETER')
  );
