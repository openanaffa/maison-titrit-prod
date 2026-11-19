-- Public pages (storefront footer, legal pages) read the owner-editable
-- legal identity (key 'site.legal') with the anon key. The read policy is a
-- key whitelist; add 'site.legal' so saved values are publicly readable.
-- Writes stay restricted to owners via "owner_manage_settings" (app_owner()).
drop policy if exists "public_read_visible_settings" on public."Setting";
create policy "public_read_visible_settings" on public."Setting"
  for select to anon, authenticated
  using (
    key in (
      'announcement',
      'integration.analytics',
      'integration.verification',
      'site.legal'
    )
  );
