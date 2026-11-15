-- RBAC: add DEVELOPER (code owner, founder-level powers) and MARKETER
-- (orders/customers read + blog write) to the RLS policy set.
--
-- Introduces role-set helper functions so future role changes touch one place.
-- Role changes take effect at the user's next sign-in (JWT claim refresh).

create or replace function public.app_owner()
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select (select public.requesting_user_role()) in ('FOUNDER', 'DEVELOPER')
$$;

create or replace function public.app_staff()
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select (select public.requesting_user_role())
    in ('FOUNDER', 'DEVELOPER', 'ADMIN', 'MANAGER', 'MARKETER')
$$;

create or replace function public.app_catalog_writer()
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select (select public.requesting_user_role()) in ('FOUNDER', 'DEVELOPER', 'ADMIN')
$$;

-- Customers readable by staff except MANAGER (was FOUNDER/ADMIN/MANAGER).
drop policy if exists "profile_read_self_or_staff" on public."User";
create policy "profile_read_self_or_staff" on public."User"
  for select to authenticated
  using (
    (
      "supabaseId" = (select auth.uid())::text
      and (select public.is_verified_auth_user())
    )
    or (select public.requesting_user_role()) in ('FOUNDER', 'DEVELOPER', 'ADMIN', 'MARKETER')
  );

drop policy if exists "founder_manage_invites" on public."Invite";
drop policy if exists "owner_manage_invites" on public."Invite";
create policy "owner_manage_invites" on public."Invite"
  for all to authenticated
  using ((select public.app_owner()))
  with check ((select public.app_owner()));

drop policy if exists "staff_write_products" on public."Product";
create policy "staff_write_products" on public."Product"
  for all to authenticated
  using ((select public.app_catalog_writer()))
  with check ((select public.app_catalog_writer()));

drop policy if exists "staff_write_categories" on public."Category";
create policy "staff_write_categories" on public."Category"
  for all to authenticated
  using ((select public.app_catalog_writer()))
  with check ((select public.app_catalog_writer()));

drop policy if exists "staff_write_images" on public."Image";
create policy "staff_write_images" on public."Image"
  for all to authenticated
  using ((select public.app_catalog_writer()))
  with check ((select public.app_catalog_writer()));

drop policy if exists "staff_read_orders" on public."Order";
create policy "staff_read_orders" on public."Order"
  for select to authenticated
  using ((select public.app_staff()));

drop policy if exists "admin_manage_orders" on public."Order";
create policy "admin_manage_orders" on public."Order"
  for all to authenticated
  using ((select public.app_catalog_writer()))
  with check ((select public.app_catalog_writer()));

drop policy if exists "admin_manage_order_items" on public."OrderItem";
create policy "admin_manage_order_items" on public."OrderItem"
  for all to authenticated
  using ((select public.app_catalog_writer()))
  with check ((select public.app_catalog_writer()));

drop policy if exists "staff_read_all_articles" on public."Article";
create policy "staff_read_all_articles" on public."Article"
  for select to authenticated
  using ((select public.app_staff()));

drop policy if exists "staff_manage_articles" on public."Article";
create policy "staff_manage_articles" on public."Article"
  for all to authenticated
  using ((select public.app_catalog_writer()) or (select public.requesting_user_role()) = 'MARKETER')
  with check ((select public.app_catalog_writer()) or (select public.requesting_user_role()) = 'MARKETER');

drop policy if exists "founder_manage_settings" on public."Setting";
drop policy if exists "owner_manage_settings" on public."Setting";
create policy "owner_manage_settings" on public."Setting"
  for all to authenticated
  using ((select public.app_owner()))
  with check ((select public.app_owner()));

revoke all on function public.app_owner() from public, anon;
revoke all on function public.app_staff() from public, anon;
revoke all on function public.app_catalog_writer() from public, anon;
grant execute on function public.app_owner() to authenticated;
grant execute on function public.app_staff() to authenticated;
grant execute on function public.app_catalog_writer() to authenticated;
