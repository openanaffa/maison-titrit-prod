-- Codex P2: the unrestricted "catalog_read_variants" policy (USING (true))
-- made the exact inventory counts (onHand, reserved) queryable by any
-- visitor holding the storefront's public anon key, once the inventory
-- migration added those columns to ProductVariant.
--
-- The storefront does not read ProductVariant through the anon client at
-- all (variant data reaches the browser inside the server-composed Product
-- payload), so anon access is simply revoked. Staff keep authenticated
-- read access; admin writes go through the service role (Prisma), which
-- bypasses RLS.

REVOKE SELECT ON TABLE public."ProductVariant" FROM anon;

DROP POLICY IF EXISTS "catalog_read_variants" ON public."ProductVariant";
DROP POLICY IF EXISTS "staff_read_variants" ON public."ProductVariant";
CREATE POLICY "staff_read_variants" ON public."ProductVariant"
  FOR SELECT TO authenticated
  USING (
    (SELECT public.requesting_user_role())
      IN ('FOUNDER', 'ADMIN', 'DEVELOPER', 'MANAGER')
  );
