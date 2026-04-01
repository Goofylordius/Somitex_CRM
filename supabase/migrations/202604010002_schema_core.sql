create table if not exists public.tenants (
  id uuid primary key default gen_random_uuid(),
  legal_name text not null,
  slug text not null unique check (slug ~ '^[a-z0-9-]+$'),
  country_code char(2) not null default 'DE' check (country_code ~ '^[A-Z]{2}$'),
  created_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.data_retention_policies (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references public.tenants(id) on delete cascade,
  entity_name text not null,
  retention_days integer not null check (retention_days >= 30),
  deletion_strategy text not null check (deletion_strategy in ('delete', 'anonymize', 'archive')),
  legal_basis text not null,
  is_active boolean not null default true,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now()),
  unique (tenant_id, entity_name)
);

create table if not exists public.user_profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  tenant_id uuid not null references public.tenants(id) on delete cascade,
  role public.app_role not null default 'user',
  full_name text not null,
  job_title text,
  is_active boolean not null default true,
  mfa_enrolled_at timestamptz,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.role_permissions (
  role public.app_role not null,
  permission text not null,
  description text not null,
  primary key (role, permission)
);

create table if not exists public.companies (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references public.tenants(id) on delete cascade,
  owner_user_id uuid references public.user_profiles(id) on delete set null,
  retention_policy_id uuid references public.data_retention_policies(id) on delete set null,
  name text not null,
  industry text,
  website text,
  city text,
  country_code char(2) not null default 'DE' check (country_code ~ '^[A-Z]{2}$'),
  data_classification text not null default 'internal',
  lawful_basis text not null default 'contract_preparation',
  created_by uuid not null references public.user_profiles(id),
  updated_by uuid not null references public.user_profiles(id),
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.contacts (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references public.tenants(id) on delete cascade,
  company_id uuid not null references public.companies(id) on delete cascade,
  owner_user_id uuid references public.user_profiles(id) on delete set null,
  retention_policy_id uuid not null references public.data_retention_policies(id) on delete restrict,
  full_name text not null,
  job_title text,
  email_ciphertext text,
  email_hash text,
  phone_ciphertext text,
  phone_hash text,
  city text,
  country_code char(2) not null default 'DE' check (country_code ~ '^[A-Z]{2}$'),
  lawful_basis text not null,
  purpose_code text not null,
  is_data_subject boolean not null default true,
  last_contacted_at timestamptz,
  anonymized_at timestamptz,
  deleted_at timestamptz,
  created_by uuid not null references public.user_profiles(id),
  updated_by uuid not null references public.user_profiles(id),
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now()),
  check (email_ciphertext is not null or phone_ciphertext is not null)
);

create table if not exists public.deals (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references public.tenants(id) on delete cascade,
  company_id uuid not null references public.companies(id) on delete cascade,
  primary_contact_id uuid references public.contacts(id) on delete set null,
  owner_user_id uuid references public.user_profiles(id) on delete set null,
  title text not null,
  stage text not null check (stage in ('lead', 'qualified', 'proposal', 'negotiation', 'won', 'lost')),
  amount_cents bigint not null default 0 check (amount_cents >= 0),
  currency char(3) not null default 'EUR' check (currency ~ '^[A-Z]{3}$'),
  expected_close_date date,
  source text,
  created_by uuid not null references public.user_profiles(id),
  updated_by uuid not null references public.user_profiles(id),
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.tasks (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references public.tenants(id) on delete cascade,
  company_id uuid not null references public.companies(id) on delete cascade,
  contact_id uuid references public.contacts(id) on delete set null,
  deal_id uuid references public.deals(id) on delete set null,
  assigned_to uuid references public.user_profiles(id) on delete set null,
  title text not null,
  description text,
  priority text not null default 'medium' check (priority in ('low', 'medium', 'high', 'critical')),
  status text not null default 'open' check (status in ('open', 'in_progress', 'done', 'cancelled')),
  due_at timestamptz,
  completed_at timestamptz,
  created_by uuid not null references public.user_profiles(id),
  updated_by uuid not null references public.user_profiles(id),
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.activities (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references public.tenants(id) on delete cascade,
  company_id uuid references public.companies(id) on delete set null,
  contact_id uuid references public.contacts(id) on delete set null,
  deal_id uuid references public.deals(id) on delete set null,
  task_id uuid references public.tasks(id) on delete set null,
  actor_user_id uuid references public.user_profiles(id) on delete set null,
  activity_type text not null,
  details jsonb not null default '{}'::jsonb,
  happened_at timestamptz not null default timezone('utc', now()),
  created_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.consent_records (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references public.tenants(id) on delete cascade,
  contact_id uuid not null references public.contacts(id) on delete cascade,
  purpose_code text not null,
  lawful_basis text not null,
  status text not null check (status in ('granted', 'withdrawn', 'expired')),
  granted_at timestamptz,
  withdrawn_at timestamptz,
  source text not null,
  proof_reference text not null,
  policy_version text not null,
  metadata jsonb not null default '{}'::jsonb,
  created_by uuid not null references public.user_profiles(id),
  created_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.user_sessions (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references public.tenants(id) on delete cascade,
  user_id uuid not null references public.user_profiles(id) on delete cascade,
  session_identifier text not null unique,
  aal text not null check (aal in ('aal1', 'aal2')),
  ip_hash text,
  user_agent_hash text,
  last_seen_at timestamptz not null default timezone('utc', now()),
  expires_at timestamptz not null,
  revoked_at timestamptz,
  created_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.dsar_requests (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references public.tenants(id) on delete cascade,
  contact_id uuid references public.contacts(id) on delete set null,
  request_type text not null check (request_type in ('access', 'erasure', 'rectification', 'restriction', 'portability', 'objection')),
  status text not null check (status in ('submitted', 'in_review', 'completed', 'rejected')),
  submitted_at timestamptz not null default timezone('utc', now()),
  due_at timestamptz not null,
  completed_at timestamptz,
  requested_by uuid references public.user_profiles(id) on delete set null,
  assigned_to uuid references public.user_profiles(id) on delete set null,
  notes text
);

create table if not exists security.login_attempts (
  email_hash text not null,
  ip_hash text not null,
  attempts integer not null default 0 check (attempts >= 0),
  locked_until timestamptz,
  last_attempt_at timestamptz not null default timezone('utc', now()),
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now()),
  primary key (email_hash, ip_hash)
);

create table if not exists audit.audit_logs (
  id bigint generated always as identity primary key,
  tenant_id uuid not null references public.tenants(id) on delete cascade,
  actor_user_id uuid references public.user_profiles(id) on delete set null,
  actor_role text not null,
  request_id uuid not null default gen_random_uuid(),
  action text not null,
  resource_type text not null,
  resource_id text,
  session_identifier text,
  ip_hash text,
  user_agent_hash text,
  before_state jsonb,
  after_state jsonb,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default timezone('utc', now()),
  previous_hash text,
  entry_hash text
);

create index if not exists idx_retention_tenant_entity on public.data_retention_policies (tenant_id, entity_name);
create index if not exists idx_user_profiles_tenant_role on public.user_profiles (tenant_id, role);
create index if not exists idx_companies_tenant_owner on public.companies (tenant_id, owner_user_id);
create index if not exists idx_contacts_tenant_owner on public.contacts (tenant_id, owner_user_id);
create index if not exists idx_contacts_company on public.contacts (company_id);
create index if not exists idx_contacts_email_hash on public.contacts (tenant_id, email_hash);
create index if not exists idx_contacts_phone_hash on public.contacts (tenant_id, phone_hash);
create index if not exists idx_deals_tenant_stage on public.deals (tenant_id, stage);
create index if not exists idx_tasks_tenant_due on public.tasks (tenant_id, due_at);
create index if not exists idx_tasks_assigned_to on public.tasks (assigned_to);
create index if not exists idx_activities_tenant_happened on public.activities (tenant_id, happened_at desc);
create index if not exists idx_consents_tenant_contact on public.consent_records (tenant_id, contact_id);
create index if not exists idx_user_sessions_tenant_user on public.user_sessions (tenant_id, user_id);
create index if not exists idx_dsar_tenant_status on public.dsar_requests (tenant_id, status);
create index if not exists idx_login_attempts_locked_until on security.login_attempts (locked_until);
create index if not exists idx_audit_logs_tenant_created on audit.audit_logs (tenant_id, created_at desc);
create index if not exists idx_audit_logs_resource on audit.audit_logs (resource_type, resource_id);
