insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'secure-files',
  'secure-files',
  false,
  10485760,
  array['application/pdf', 'image/png', 'image/jpeg', 'text/plain']
)
on conflict (id) do update
set public = excluded.public,
    file_size_limit = excluded.file_size_limit,
    allowed_mime_types = excluded.allowed_mime_types;

create policy secure_files_select_same_tenant
on storage.objects
for select
to authenticated
using (
  bucket_id = 'secure-files'
  and (storage.foldername(name))[1] = public.current_tenant_id()::text
);

create policy secure_files_insert_same_tenant
on storage.objects
for insert
to authenticated
with check (
  bucket_id = 'secure-files'
  and (storage.foldername(name))[1] = public.current_tenant_id()::text
  and public.require_aal2()
);

create policy secure_files_update_privileged
on storage.objects
for update
to authenticated
using (
  bucket_id = 'secure-files'
  and (storage.foldername(name))[1] = public.current_tenant_id()::text
  and public.require_aal2()
  and public.has_role(array['admin', 'manager', 'dsb']::public.app_role[])
)
with check (
  bucket_id = 'secure-files'
  and (storage.foldername(name))[1] = public.current_tenant_id()::text
  and public.require_aal2()
  and public.has_role(array['admin', 'manager', 'dsb']::public.app_role[])
);

create policy secure_files_delete_privileged
on storage.objects
for delete
to authenticated
using (
  bucket_id = 'secure-files'
  and (storage.foldername(name))[1] = public.current_tenant_id()::text
  and public.require_aal2()
  and public.has_role(array['admin', 'manager', 'dsb']::public.app_role[])
);

create or replace function public.apply_retention_policies()
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  update public.contacts c
  set
    full_name = '[redacted]',
    job_title = null,
    email_ciphertext = null,
    email_hash = null,
    phone_ciphertext = null,
    phone_hash = null,
    city = null,
    anonymized_at = coalesce(c.anonymized_at, timezone('utc', now())),
    deleted_at = coalesce(c.deleted_at, timezone('utc', now())),
    updated_at = timezone('utc', now())
  from public.data_retention_policies p
  where p.id = c.retention_policy_id
    and p.entity_name = 'contacts'
    and p.deletion_strategy = 'anonymize'
    and c.deleted_at is null
    and c.created_at < timezone('utc', now()) - make_interval(days => p.retention_days);

  delete from public.activities a
  using public.data_retention_policies p
  where p.tenant_id = a.tenant_id
    and p.entity_name = 'activities'
    and p.deletion_strategy = 'delete'
    and a.created_at < timezone('utc', now()) - make_interval(days => p.retention_days);

  delete from public.user_sessions s
  using public.data_retention_policies p
  where p.tenant_id = s.tenant_id
    and p.entity_name = 'user_sessions'
    and p.deletion_strategy = 'delete'
    and coalesce(s.revoked_at, s.expires_at) < timezone('utc', now()) - make_interval(days => p.retention_days);
end;
$$;

do $$
begin
  if not exists (select 1 from cron.job where jobname = 'crm-retention-daily') then
    perform cron.schedule('crm-retention-daily', '17 2 * * *', $job$select public.apply_retention_policies();$job$);
  end if;
end
$$;
