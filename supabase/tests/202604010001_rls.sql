do $$
begin
  if not exists (
    select 1
    from pg_class c
    join pg_namespace n on n.oid = c.relnamespace
    where n.nspname = 'public' and c.relname = 'contacts' and c.relrowsecurity
  ) then
    raise exception 'RLS is not enabled on public.contacts';
  end if;

  if not exists (
    select 1
    from pg_policies
    where schemaname = 'public' and tablename = 'contacts' and policyname = 'contacts_select_limited'
  ) then
    raise exception 'contacts_select_limited policy missing';
  end if;

  if not exists (
    select 1
    from pg_class c
    join pg_namespace n on n.oid = c.relnamespace
    where n.nspname = 'audit' and c.relname = 'audit_logs' and c.relrowsecurity
  ) then
    raise exception 'RLS is not enabled on audit.audit_logs';
  end if;

  if not exists (
    select 1
    from pg_trigger
    where tgname = 'audit_contacts_change'
  ) then
    raise exception 'audit trigger missing for contacts';
  end if;
end
$$;
