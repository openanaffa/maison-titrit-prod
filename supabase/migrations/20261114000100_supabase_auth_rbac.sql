alter table public."User"
  add column if not exists "supabaseId" text;

alter table public."User"
  drop column if exists password;

drop table if exists public."VerificationToken";
drop table if exists public."Session";
drop table if exists public."Account";

create unique index if not exists "User_supabaseId_key"
  on public."User" ("supabaseId");

create or replace function public.link_auth_user_to_profile()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  linked_user public."User"%rowtype;
begin
  if new.email is null or new.email_confirmed_at is null then
    return new;
  end if;

  if tg_op = 'UPDATE' then
    update public."User"
       set email = lower(new.email),
           "emailVerified" = new.email_confirmed_at,
           "updatedAt" = now()
     where "supabaseId" = new.id::text;
    if found then
      return new;
    end if;
  end if;

  select *
    into linked_user
    from public."User"
   where lower(email) = lower(new.email)
   limit 1
   for update;

  if found then
    if linked_user."supabaseId" is not null
       and linked_user."supabaseId" <> new.id::text then
      raise exception 'An application profile is already linked to another auth user';
    end if;

    update public."User"
       set "supabaseId" = new.id::text,
           name = coalesce(name, new.raw_user_meta_data ->> 'name', new.raw_user_meta_data ->> 'full_name'),
           "emailVerified" = coalesce("emailVerified", new.email_confirmed_at),
           "updatedAt" = now()
     where id = linked_user.id;
  else
    insert into public."User" (
      id, "supabaseId", name, email, "emailVerified", role, "createdAt", "updatedAt"
    )
    values (
      new.id::text,
      new.id::text,
      coalesce(new.raw_user_meta_data ->> 'name', new.raw_user_meta_data ->> 'full_name'),
      lower(new.email),
      new.email_confirmed_at,
      'CUSTOMER',
      now(),
      now()
    );
  end if;

  return new;
end;
$$;

drop trigger if exists on_auth_user_created_link_profile on auth.users;
create trigger on_auth_user_created_link_profile
  after insert on auth.users
  for each row execute procedure public.link_auth_user_to_profile();
drop trigger if exists on_auth_user_email_updated_link_profile on auth.users;
create trigger on_auth_user_email_updated_link_profile
  after update of email, email_confirmed_at on auth.users
  for each row
  when (
    old.email is distinct from new.email
    or old.email_confirmed_at is distinct from new.email_confirmed_at
  )
  execute procedure public.link_auth_user_to_profile();
revoke all on function public.link_auth_user_to_profile() from public, anon, authenticated;

create or replace function public.custom_access_token_hook(event jsonb)
returns jsonb
language plpgsql
stable
security definer
set search_path = ''
as $$
declare
  claims jsonb;
  profile_role text;
begin
  select role
    into profile_role
    from public."User" profile
    join auth.users identity on identity.id::text = profile."supabaseId"
   where profile."supabaseId" = event ->> 'user_id'
     and identity.email_confirmed_at is not null;

  claims := coalesce(event -> 'claims', '{}'::jsonb);
  claims := jsonb_set(
    claims,
    '{user_role}',
    to_jsonb(coalesce(profile_role, 'CUSTOMER')),
    true
  );
  return jsonb_set(event, '{claims}', claims, true);
end;
$$;

revoke all on function public.custom_access_token_hook(jsonb) from public, anon, authenticated;
grant usage on schema public to supabase_auth_admin;
grant execute on function public.custom_access_token_hook(jsonb) to supabase_auth_admin;

create or replace function public.is_verified_auth_user()
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1
      from auth.users identity
     where identity.id = (select auth.uid())
       and identity.email_confirmed_at is not null
  )
$$;

revoke all on function public.is_verified_auth_user() from public, anon;
grant execute on function public.is_verified_auth_user() to authenticated;

create or replace function public.requesting_user_role()
returns text
language sql
stable
security definer
set search_path = ''
as $$
  select coalesce(
    (
      select profile.role
        from public."User" profile
        where profile."supabaseId" = (select auth.uid())::text
          and (select public.is_verified_auth_user())
       limit 1
    ),
    'CUSTOMER'
  )
$$;

revoke all on function public.requesting_user_role() from public, anon;
grant usage on schema public to anon, authenticated;
grant execute on function public.requesting_user_role() to authenticated;

alter table public."User" enable row level security;
alter table public."Invite" enable row level security;
alter table public."Product" enable row level security;
alter table public."Category" enable row level security;
alter table public."Image" enable row level security;
alter table public."Order" enable row level security;
alter table public."OrderItem" enable row level security;
alter table public."Article" enable row level security;
alter table public."Setting" enable row level security;

revoke all on table public."User" from anon, authenticated;
grant select on table public."User" to authenticated;
grant update (name, phone, "updatedAt") on table public."User" to authenticated;

drop policy if exists "profile_read_self_or_staff" on public."User";
create policy "profile_read_self_or_staff" on public."User"
  for select to authenticated
  using (
    (
      "supabaseId" = (select auth.uid())::text
      and (select public.is_verified_auth_user())
    )
    or (select public.requesting_user_role()) in ('FOUNDER', 'ADMIN', 'MANAGER')
  );

drop policy if exists "profile_update_self" on public."User";
create policy "profile_update_self" on public."User"
  for update to authenticated
  using (
    "supabaseId" = (select auth.uid())::text
    and (select public.is_verified_auth_user())
  )
  with check (
    "supabaseId" = (select auth.uid())::text
    and (select public.is_verified_auth_user())
  );

revoke all on table public."Invite" from anon, authenticated;
grant select, insert, update, delete on table public."Invite" to authenticated;
drop policy if exists "founder_manage_invites" on public."Invite";
create policy "founder_manage_invites" on public."Invite"
  for all to authenticated
  using ((select public.requesting_user_role()) = 'FOUNDER')
  with check ((select public.requesting_user_role()) = 'FOUNDER');

revoke all on table public."Product" from anon, authenticated;
grant select on table public."Product" to anon, authenticated;
grant insert, update, delete on table public."Product" to authenticated;
drop policy if exists "catalog_read_products" on public."Product";
create policy "catalog_read_products" on public."Product"
  for select to anon, authenticated using (true);
drop policy if exists "staff_write_products" on public."Product";
create policy "staff_write_products" on public."Product"
  for all to authenticated
  using ((select public.requesting_user_role()) in ('FOUNDER', 'ADMIN'))
  with check ((select public.requesting_user_role()) in ('FOUNDER', 'ADMIN'));

revoke all on table public."Category" from anon, authenticated;
grant select on table public."Category" to anon, authenticated;
grant insert, update, delete on table public."Category" to authenticated;
drop policy if exists "catalog_read_categories" on public."Category";
create policy "catalog_read_categories" on public."Category"
  for select to anon, authenticated using (true);
drop policy if exists "staff_write_categories" on public."Category";
create policy "staff_write_categories" on public."Category"
  for all to authenticated
  using ((select public.requesting_user_role()) in ('FOUNDER', 'ADMIN'))
  with check ((select public.requesting_user_role()) in ('FOUNDER', 'ADMIN'));

revoke all on table public."Image" from anon, authenticated;
grant select on table public."Image" to anon, authenticated;
grant insert, update, delete on table public."Image" to authenticated;
drop policy if exists "catalog_read_images" on public."Image";
create policy "catalog_read_images" on public."Image"
  for select to anon, authenticated using (true);
drop policy if exists "staff_write_images" on public."Image";
create policy "staff_write_images" on public."Image"
  for all to authenticated
  using ((select public.requesting_user_role()) in ('FOUNDER', 'ADMIN'))
  with check ((select public.requesting_user_role()) in ('FOUNDER', 'ADMIN'));

revoke all on table public."Order" from anon, authenticated;
grant select on table public."Order" to authenticated;
grant insert, update, delete on table public."Order" to authenticated;
drop policy if exists "staff_read_orders" on public."Order";
create policy "staff_read_orders" on public."Order"
  for select to authenticated
  using ((select public.requesting_user_role()) in ('FOUNDER', 'ADMIN', 'MANAGER'));
drop policy if exists "customer_read_own_orders" on public."Order";
create policy "customer_read_own_orders" on public."Order"
  for select to authenticated
  using (
    (select public.is_verified_auth_user())
    and (
      "customerEmail" = (select auth.jwt() ->> 'email')
      or exists (
        select 1
          from public."User" profile
         where profile.id = "Order"."userId"
           and profile."supabaseId" = (select auth.uid())::text
      )
    )
  );
drop policy if exists "admin_manage_orders" on public."Order";
create policy "admin_manage_orders" on public."Order"
  for all to authenticated
  using ((select public.requesting_user_role()) in ('FOUNDER', 'ADMIN'))
  with check ((select public.requesting_user_role()) in ('FOUNDER', 'ADMIN'));

revoke all on table public."OrderItem" from anon, authenticated;
grant select on table public."OrderItem" to authenticated;
grant insert, update, delete on table public."OrderItem" to authenticated;
drop policy if exists "read_order_items_with_order" on public."OrderItem";
create policy "read_order_items_with_order" on public."OrderItem"
  for select to authenticated
  using (
    exists (
      select 1
        from public."Order" parent
       where parent.id = "OrderItem"."orderId"
    )
  );
drop policy if exists "admin_manage_order_items" on public."OrderItem";
create policy "admin_manage_order_items" on public."OrderItem"
  for all to authenticated
  using ((select public.requesting_user_role()) in ('FOUNDER', 'ADMIN'))
  with check ((select public.requesting_user_role()) in ('FOUNDER', 'ADMIN'));

revoke all on table public."Article" from anon, authenticated;
grant select on table public."Article" to anon, authenticated;
grant insert, update, delete on table public."Article" to authenticated;
drop policy if exists "public_read_published_articles" on public."Article";
create policy "public_read_published_articles" on public."Article"
  for select to anon, authenticated using (published = true);
drop policy if exists "staff_read_all_articles" on public."Article";
create policy "staff_read_all_articles" on public."Article"
  for select to authenticated
  using ((select public.requesting_user_role()) in ('FOUNDER', 'ADMIN', 'MANAGER'));
drop policy if exists "staff_manage_articles" on public."Article";
create policy "staff_manage_articles" on public."Article"
  for all to authenticated
  using ((select public.requesting_user_role()) in ('FOUNDER', 'ADMIN'))
  with check ((select public.requesting_user_role()) in ('FOUNDER', 'ADMIN'));

revoke all on table public."Setting" from anon, authenticated;
grant select on table public."Setting" to anon, authenticated;
grant insert, update, delete on table public."Setting" to authenticated;
drop policy if exists "public_read_visible_settings" on public."Setting";
create policy "public_read_visible_settings" on public."Setting"
  for select to anon, authenticated
  using (key in ('announcement', 'integration.analytics', 'integration.verification'));
drop policy if exists "founder_manage_settings" on public."Setting";
create policy "founder_manage_settings" on public."Setting"
  for all to authenticated
  using ((select public.requesting_user_role()) = 'FOUNDER')
  with check ((select public.requesting_user_role()) = 'FOUNDER');
