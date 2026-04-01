create or replace function public.get_login_attempt_state(
  input_email_hash text,
  input_ip_hash text
)
returns table (
  attempts integer,
  locked_until timestamptz
)
language sql
security definer
set search_path = public, security
as $$
  select login_attempts.attempts, login_attempts.locked_until
  from security.login_attempts as login_attempts
  where login_attempts.email_hash = input_email_hash
    and login_attempts.ip_hash = input_ip_hash
  limit 1;
$$;

create or replace function public.upsert_login_attempt_state(
  input_email_hash text,
  input_ip_hash text,
  input_attempts integer,
  input_locked_until timestamptz,
  input_last_attempt_at timestamptz
)
returns void
language plpgsql
security definer
set search_path = public, security
as $$
begin
  insert into security.login_attempts (
    email_hash,
    ip_hash,
    attempts,
    locked_until,
    last_attempt_at
  )
  values (
    input_email_hash,
    input_ip_hash,
    input_attempts,
    input_locked_until,
    input_last_attempt_at
  )
  on conflict (email_hash, ip_hash) do update
  set attempts = excluded.attempts,
      locked_until = excluded.locked_until,
      last_attempt_at = excluded.last_attempt_at;
end;
$$;

create or replace function public.clear_login_attempt_state(
  input_email_hash text,
  input_ip_hash text
)
returns void
language plpgsql
security definer
set search_path = public, security
as $$
begin
  delete from security.login_attempts
  where email_hash = input_email_hash
    and ip_hash = input_ip_hash;
end;
$$;

create or replace function public.insert_audit_log(
  input_tenant_id uuid,
  input_actor_user_id uuid,
  input_actor_role text,
  input_action text,
  input_resource_type text,
  input_resource_id text,
  input_session_identifier text,
  input_ip_hash text,
  input_user_agent_hash text,
  input_metadata jsonb
)
returns void
language plpgsql
security definer
set search_path = public, audit
as $$
begin
  insert into audit.audit_logs (
    tenant_id,
    actor_user_id,
    actor_role,
    action,
    resource_type,
    resource_id,
    session_identifier,
    ip_hash,
    user_agent_hash,
    metadata
  )
  values (
    input_tenant_id,
    input_actor_user_id,
    input_actor_role,
    input_action,
    input_resource_type,
    input_resource_id,
    input_session_identifier,
    input_ip_hash,
    input_user_agent_hash,
    coalesce(input_metadata, '{}'::jsonb)
  );
end;
$$;

create or replace function public.count_tenant_audit_logs(
  input_tenant_id uuid,
  input_since timestamptz default null
)
returns bigint
language sql
security definer
set search_path = public, audit
as $$
  select count(*)
  from audit.audit_logs as audit_logs
  where audit_logs.tenant_id = input_tenant_id
    and (input_since is null or audit_logs.created_at >= input_since);
$$;

create or replace function public.list_tenant_audit_logs(
  input_tenant_id uuid,
  input_limit integer default 20
)
returns table (
  id bigint,
  action text,
  resource_type text,
  resource_id text,
  actor_role text,
  created_at timestamptz,
  metadata jsonb
)
language sql
security definer
set search_path = public, audit
as $$
  select
    audit_logs.id,
    audit_logs.action,
    audit_logs.resource_type,
    audit_logs.resource_id,
    audit_logs.actor_role,
    audit_logs.created_at,
    audit_logs.metadata
  from audit.audit_logs as audit_logs
  where audit_logs.tenant_id = input_tenant_id
  order by audit_logs.created_at desc
  limit greatest(coalesce(input_limit, 20), 1);
$$;

grant execute on function public.get_login_attempt_state(text, text) to service_role;
grant execute on function public.upsert_login_attempt_state(text, text, integer, timestamptz, timestamptz) to service_role;
grant execute on function public.clear_login_attempt_state(text, text) to service_role;
grant execute on function public.insert_audit_log(uuid, uuid, text, text, text, text, text, text, text, jsonb) to service_role;
grant execute on function public.count_tenant_audit_logs(uuid, timestamptz) to service_role;
grant execute on function public.list_tenant_audit_logs(uuid, integer) to service_role;
