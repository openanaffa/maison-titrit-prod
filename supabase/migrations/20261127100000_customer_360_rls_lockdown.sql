-- #122 privacy: staff notes and audit events hold sensitive customer
-- context. Anon access is revoked; authenticated staff keep read access;
-- all writes go through the service role (Prisma), which bypasses RLS.

REVOKE SELECT ON TABLE public."CustomerNote" FROM anon;
REVOKE SELECT ON TABLE public."CustomerAuditEvent" FROM anon;

ALTER TABLE public."CustomerNote" ENABLE ROW LEVEL SECURITY;
ALTER TABLE public."CustomerAuditEvent" ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "staff_read_customer_notes" ON public."CustomerNote";
CREATE POLICY "staff_read_customer_notes" ON public."CustomerNote"
  FOR SELECT TO authenticated
  USING (
    (SELECT public.requesting_user_role())
      IN ('FOUNDER', 'ADMIN', 'DEVELOPER', 'MANAGER', 'MARKETER')
  );

DROP POLICY IF EXISTS "staff_read_customer_audit" ON public."CustomerAuditEvent";
CREATE POLICY "staff_read_customer_audit" ON public."CustomerAuditEvent"
  FOR SELECT TO authenticated
  USING (
    (SELECT public.requesting_user_role())
      IN ('FOUNDER', 'ADMIN', 'DEVELOPER', 'MANAGER', 'MARKETER')
  );
