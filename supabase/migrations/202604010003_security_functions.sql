create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = timezone('utc', now());
  return new;
end;
$$;

create or replace function public.current_tenant_id()
returns uuid
language sql
stable
security definer
set search_path = public
as $$
  select tenant_id
  from public.user_profiles
  where id = auth.uid()
    and is_active = true
  limit 1;
$$;

create or replace function public.current_user_role()
returns public.app_role
language sql
stable
security definer
set search_path = public
as $$
  select role
  from public.user_profiles
  where id = auth.uid()
    and is_active = true
  limit 1;
$$;

create or replace function public.same_tenant(target_tenant_id uuid)
returns boolean
language sql
stable
as $$
  select target_tenant_id = public.current_tenant_id();
$$;

create or replace function public.has_role(roles public.app_role[])
returns boolean
language sql
stable
as $$
  select public.current_user_role() = any(roles);
$$;

create or replace function public.require_aal2()
returns boolean
language sql
stable
as $$
  select coalesce((auth.jwt() ->> 'aal') = 'aal2', false);
$$;

create or replace function public.can_manage_owner(owner_id uuid)
returns boolean
language sql
stable
as $$
  select coalesce(owner_id, auth.uid()) = auth.uid()
      or public.has_role(array['admin', 'manager', 'dsb']::public.app_role[]);
$$;

create or replace function public.bootstrap_default_retention_policies(target_tenant_id uuid)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.data_retention_policies (tenant_id, entity_name, retention_days, deletion_strategy, legal_basis)
  values
    (target_tenant_id, 'contacts', 365, 'anonymize', 'sales_and_customer_management'),
    (target_tenant_id, 'activities', 365, 'delete', 'security_and_operational_traceability'),
    (target_tenant_id, 'user_sessions', 180, 'delete', 'security_operations'),
    (target_tenant_id, 'dsar_requests', 1095, 'archive', 'legal_accountability')
  on conflict (tenant_id, entity_name) do nothing;
end;
$$;

create or replace function public.bootstrap_tenant(
  owner_user_id uuid,
  tenant_name text,
  tenant_slug text,
  owner_full_name text
)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  created_tenant_id uuid;
begin
  insert into public.tenants (legal_name, slug)
  values (tenant_name, tenant_slug)
  returning id into created_tenant_id;

  insert into public.user_profiles (id, tenant_id, role, full_name)
  values (owner_user_id, created_tenant_id, 'admin', owner_full_name)
  on conflict (id) do update
  set tenant_id = excluded.tenant_id,
      role = excluded.role,
      full_name = excluded.full_name;

  perform public.bootstrap_default_retention_policies(created_tenant_id);
  return created_tenant_id;
end;
$$;

create or replace function audit.prevent_audit_log_change()
returns trigger
language plpgsql
as $$
begin
  raise exception 'audit logs are append-only';
end;
$$;

create or replace function audit.fill_hash_chain()
returns trigger
language plpgsql
set search_path = audit, public
as $$
declare
  previous_entry_hash text;
begin
  select entry_hash
    into previous_entry_hash
  from audit.audit_logs
  where tenant_id = new.tenant_id
  order by id desc
  limit 1;

  new.previous_hash = previous_entry_hash;
  new.entry_hash = encode(
    digest(
      coalesce(previous_entry_hash, '')
      || coalesce(new.tenant_id::text, '')
      || coalesce(new.actor_user_id::text, '')
      || coalesce(new.actor_role, '')
      || coalesce(new.action, '')
      || coalesce(new.resource_type, '')
      || coalesce(new.resource_id, '')
      || coalesce(new.created_at::text, ''),
      'sha256'
    ),
    'hex'
  );
  return new;
end;
$$;

create or replace function audit.capture_row_change()
returns trigger
language plpgsql
security definer
set search_path = public, audit
as $$
declare
  tenant_value uuid;
  actor_role_value text;
  action_value text;
  resource_id_value text;
  before_state_value jsonb;
  after_state_value jsonb;
begin
  if tg_op = 'INSERT' then
    tenant_value := new.tenant_id;
    resource_id_value := new.id::text;
    before_state_value := null;
    after_state_value := to_jsonb(new);
  elsif tg_op = 'UPDATE' then
    tenant_value := new.tenant_id;
    resource_id_value := new.id::text;
    before_state_value := to_jsonb(old);
    after_state_value := to_jsonb(new);
  else
    tenant_value := old.tenant_id;
    resource_id_value := old.id::text;
    before_state_value := to_jsonb(old);
    after_state_value := null;
  end if;

  actor_role_value := coalesce(public.current_user_role()::text, 'system');
  action_value := lower(tg_table_name) || '.' ||
    case tg_op
      when 'INSERT' then 'created'
      when 'UPDATE' then 'updated'
      when 'DELETE' then 'deleted'
      else lower(tg_op)
    end;

  insert into audit.audit_logs (
    tenant_id,
    actor_user_id,
    actor_role,
    action,
    resource_type,
    resource_id,
    before_state,
    after_state,
    metadata
  )
  values (
    tenant_value,
    auth.uid(),
    actor_role_value,
    action_value,
    tg_table_name,
    resource_id_value,
    before_state_value,
    after_state_value,
    jsonb_build_object('trigger', tg_name)
  );

  return coalesce(new, old);
end;
$$;

create trigger set_retention_policies_updated_at
before update on public.data_retention_policies
for each row execute function public.set_updated_at();

create trigger set_user_profiles_updated_at
before update on public.user_profiles
for each row execute function public.set_updated_at();

create trigger set_companies_updated_at
before update on public.companies
for each row execute function public.set_updated_at();

create trigger set_contacts_updated_at
before update on public.contacts
for each row execute function public.set_updated_at();

create trigger set_deals_updated_at
before update on public.deals
for each row execute function public.set_updated_at();

create trigger set_tasks_updated_at
before update on public.tasks
for each row execute function public.set_updated_at();

create trigger set_login_attempts_updated_at
before update on security.login_attempts
for each row execute function public.set_updated_at();

create trigger audit_hash_chain_before_insert
before insert on audit.audit_logs
for each row execute function audit.fill_hash_chain();

create trigger audit_logs_no_update
before update on audit.audit_logs
for each row execute function audit.prevent_audit_log_change();

create trigger audit_logs_no_delete
before delete on audit.audit_logs
for each row execute function audit.prevent_audit_log_change();

create trigger audit_companies_change
after insert or update or delete on public.companies
for each row execute function audit.capture_row_change();

create trigger audit_contacts_change
after insert or update or delete on public.contacts
for each row execute function audit.capture_row_change();

create trigger audit_deals_change
after insert or update or delete on public.deals
for each row execute function audit.capture_row_change();

create trigger audit_tasks_change
after insert or update or delete on public.tasks
for each row execute function audit.capture_row_change();

create trigger audit_activities_change
after insert or update or delete on public.activities
for each row execute function audit.capture_row_change();

create trigger audit_consent_change
after insert or update or delete on public.consent_records
for each row execute function audit.capture_row_change();

create trigger audit_sessions_change
after insert or update or delete on public.user_sessions
for each row execute function audit.capture_row_change();

create trigger audit_dsar_change
after insert or update or delete on public.dsar_requests
for each row execute function audit.capture_row_change();

grant usage on schema public to authenticated;
grant usage on schema audit to authenticated;
grant usage on schema security to service_role;
grant usage on schema public to service_role;
grant usage on schema audit to service_role;

grant select, insert, update, delete on all tables in schema public to authenticated;
grant select on audit.audit_logs to authenticated;
grant select, insert, update, delete on all tables in schema public to service_role;
grant select, insert, update, delete on audit.audit_logs to service_role;
grant select, insert, update, delete on security.login_attempts to service_role;
grant usage, select on all sequences in schema audit to service_role;
