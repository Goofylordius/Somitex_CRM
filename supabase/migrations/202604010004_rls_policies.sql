alter table public.tenants enable row level security;
alter table public.data_retention_policies enable row level security;
alter table public.user_profiles enable row level security;
alter table public.role_permissions enable row level security;
alter table public.companies enable row level security;
alter table public.contacts enable row level security;
alter table public.deals enable row level security;
alter table public.tasks enable row level security;
alter table public.activities enable row level security;
alter table public.consent_records enable row level security;
alter table public.user_sessions enable row level security;
alter table public.dsar_requests enable row level security;
alter table security.login_attempts enable row level security;
alter table audit.audit_logs enable row level security;

create policy tenants_select_own
on public.tenants
for select
to authenticated
using (id = public.current_tenant_id());

create policy retention_select_same_tenant
on public.data_retention_policies
for select
to authenticated
using (public.same_tenant(tenant_id));

create policy retention_manage_privileged
on public.data_retention_policies
for all
to authenticated
using (public.same_tenant(tenant_id) and public.require_aal2() and public.has_role(array['admin', 'dsb']::public.app_role[]))
with check (public.same_tenant(tenant_id) and public.require_aal2() and public.has_role(array['admin', 'dsb']::public.app_role[]));

create policy profiles_select_same_tenant
on public.user_profiles
for select
to authenticated
using (public.same_tenant(tenant_id));

create policy profiles_update_self_or_privileged
on public.user_profiles
for update
to authenticated
using (public.same_tenant(tenant_id) and (id = auth.uid() or public.has_role(array['admin', 'manager', 'dsb']::public.app_role[])))
with check (public.same_tenant(tenant_id) and (id = auth.uid() or public.has_role(array['admin', 'manager', 'dsb']::public.app_role[])));

create policy role_permissions_read_all
on public.role_permissions
for select
to authenticated
using (true);

create policy companies_select_same_tenant
on public.companies
for select
to authenticated
using (public.same_tenant(tenant_id));

create policy companies_insert_managed
on public.companies
for insert
to authenticated
with check (
  public.same_tenant(tenant_id)
  and public.require_aal2()
  and public.has_role(array['admin', 'manager', 'user']::public.app_role[])
);

create policy companies_update_managed
on public.companies
for update
to authenticated
using (
  public.same_tenant(tenant_id)
  and public.require_aal2()
  and public.can_manage_owner(owner_user_id)
)
with check (
  public.same_tenant(tenant_id)
  and public.require_aal2()
  and public.can_manage_owner(owner_user_id)
);

create policy companies_delete_privileged
on public.companies
for delete
to authenticated
using (
  public.same_tenant(tenant_id)
  and public.require_aal2()
  and public.has_role(array['admin', 'manager', 'dsb']::public.app_role[])
);

create policy contacts_select_limited
on public.contacts
for select
to authenticated
using (
  public.same_tenant(tenant_id)
  and (
    owner_user_id = auth.uid()
    or public.has_role(array['admin', 'manager', 'dsb']::public.app_role[])
  )
);

create policy contacts_insert_managed
on public.contacts
for insert
to authenticated
with check (
  public.same_tenant(tenant_id)
  and public.require_aal2()
  and public.has_role(array['admin', 'manager', 'user']::public.app_role[])
);

create policy contacts_update_managed
on public.contacts
for update
to authenticated
using (
  public.same_tenant(tenant_id)
  and public.require_aal2()
  and public.can_manage_owner(owner_user_id)
)
with check (
  public.same_tenant(tenant_id)
  and public.require_aal2()
  and public.can_manage_owner(owner_user_id)
);

create policy contacts_delete_privileged
on public.contacts
for delete
to authenticated
using (
  public.same_tenant(tenant_id)
  and public.require_aal2()
  and public.has_role(array['admin', 'manager', 'dsb']::public.app_role[])
);

create policy deals_select_limited
on public.deals
for select
to authenticated
using (
  public.same_tenant(tenant_id)
  and (
    owner_user_id = auth.uid()
    or public.has_role(array['admin', 'manager', 'dsb']::public.app_role[])
  )
);

create policy deals_insert_managed
on public.deals
for insert
to authenticated
with check (
  public.same_tenant(tenant_id)
  and public.require_aal2()
  and public.has_role(array['admin', 'manager', 'user']::public.app_role[])
);

create policy deals_update_managed
on public.deals
for update
to authenticated
using (
  public.same_tenant(tenant_id)
  and public.require_aal2()
  and public.can_manage_owner(owner_user_id)
)
with check (
  public.same_tenant(tenant_id)
  and public.require_aal2()
  and public.can_manage_owner(owner_user_id)
);

create policy deals_delete_privileged
on public.deals
for delete
to authenticated
using (
  public.same_tenant(tenant_id)
  and public.require_aal2()
  and public.has_role(array['admin', 'manager', 'dsb']::public.app_role[])
);

create policy tasks_select_relevant
on public.tasks
for select
to authenticated
using (
  public.same_tenant(tenant_id)
  and (
    assigned_to = auth.uid()
    or created_by = auth.uid()
    or public.has_role(array['admin', 'manager', 'dsb']::public.app_role[])
  )
);

create policy tasks_insert_managed
on public.tasks
for insert
to authenticated
with check (
  public.same_tenant(tenant_id)
  and public.require_aal2()
  and public.has_role(array['admin', 'manager', 'user']::public.app_role[])
);

create policy tasks_update_relevant
on public.tasks
for update
to authenticated
using (
  public.same_tenant(tenant_id)
  and public.require_aal2()
  and (
    assigned_to = auth.uid()
    or created_by = auth.uid()
    or public.has_role(array['admin', 'manager', 'dsb']::public.app_role[])
  )
)
with check (
  public.same_tenant(tenant_id)
  and public.require_aal2()
  and (
    assigned_to = auth.uid()
    or created_by = auth.uid()
    or public.has_role(array['admin', 'manager', 'dsb']::public.app_role[])
  )
);

create policy tasks_delete_privileged
on public.tasks
for delete
to authenticated
using (
  public.same_tenant(tenant_id)
  and public.require_aal2()
  and public.has_role(array['admin', 'manager', 'dsb']::public.app_role[])
);

create policy activities_select_same_tenant
on public.activities
for select
to authenticated
using (public.same_tenant(tenant_id));

create policy activities_insert_same_tenant
on public.activities
for insert
to authenticated
with check (
  public.same_tenant(tenant_id)
  and public.require_aal2()
  and public.has_role(array['admin', 'manager', 'user']::public.app_role[])
);

create policy activities_update_privileged
on public.activities
for update
to authenticated
using (
  public.same_tenant(tenant_id)
  and public.require_aal2()
  and public.has_role(array['admin', 'manager', 'dsb']::public.app_role[])
)
with check (
  public.same_tenant(tenant_id)
  and public.require_aal2()
  and public.has_role(array['admin', 'manager', 'dsb']::public.app_role[])
);

create policy activities_delete_privileged
on public.activities
for delete
to authenticated
using (
  public.same_tenant(tenant_id)
  and public.require_aal2()
  and public.has_role(array['admin', 'manager', 'dsb']::public.app_role[])
);

create policy consents_select_limited
on public.consent_records
for select
to authenticated
using (
  public.same_tenant(tenant_id)
  and (
    created_by = auth.uid()
    or public.has_role(array['admin', 'manager', 'dsb']::public.app_role[])
  )
);

create policy consents_insert_same_tenant
on public.consent_records
for insert
to authenticated
with check (
  public.same_tenant(tenant_id)
  and public.require_aal2()
  and public.has_role(array['admin', 'manager', 'user']::public.app_role[])
);

create policy consents_update_privileged
on public.consent_records
for update
to authenticated
using (
  public.same_tenant(tenant_id)
  and public.require_aal2()
  and public.has_role(array['admin', 'manager', 'dsb']::public.app_role[])
)
with check (
  public.same_tenant(tenant_id)
  and public.require_aal2()
  and public.has_role(array['admin', 'manager', 'dsb']::public.app_role[])
);

create policy consents_delete_dsb
on public.consent_records
for delete
to authenticated
using (
  public.same_tenant(tenant_id)
  and public.require_aal2()
  and public.has_role(array['admin', 'dsb']::public.app_role[])
);

create policy sessions_select_self_or_privileged
on public.user_sessions
for select
to authenticated
using (
  public.same_tenant(tenant_id)
  and (
    user_id = auth.uid()
    or public.has_role(array['admin', 'dsb']::public.app_role[])
  )
);

create policy sessions_insert_self_or_admin
on public.user_sessions
for insert
to authenticated
with check (
  public.same_tenant(tenant_id)
  and (
    user_id = auth.uid()
    or public.has_role(array['admin']::public.app_role[])
  )
);

create policy sessions_update_self_or_admin
on public.user_sessions
for update
to authenticated
using (
  public.same_tenant(tenant_id)
  and (
    user_id = auth.uid()
    or public.has_role(array['admin', 'dsb']::public.app_role[])
  )
)
with check (
  public.same_tenant(tenant_id)
  and (
    user_id = auth.uid()
    or public.has_role(array['admin', 'dsb']::public.app_role[])
  )
);

create policy dsar_select_privileged
on public.dsar_requests
for select
to authenticated
using (
  public.same_tenant(tenant_id)
  and public.has_role(array['admin', 'manager', 'dsb']::public.app_role[])
);

create policy dsar_insert_privileged
on public.dsar_requests
for insert
to authenticated
with check (
  public.same_tenant(tenant_id)
  and public.require_aal2()
  and public.has_role(array['admin', 'manager', 'dsb']::public.app_role[])
);

create policy dsar_update_privileged
on public.dsar_requests
for update
to authenticated
using (
  public.same_tenant(tenant_id)
  and public.require_aal2()
  and public.has_role(array['admin', 'dsb']::public.app_role[])
)
with check (
  public.same_tenant(tenant_id)
  and public.require_aal2()
  and public.has_role(array['admin', 'dsb']::public.app_role[])
);

create policy audit_select_privileged
on audit.audit_logs
for select
to authenticated
using (
  public.same_tenant(tenant_id)
  and public.has_role(array['admin', 'manager', 'dsb']::public.app_role[])
);

insert into public.role_permissions (role, permission, description)
values
  ('admin', 'contacts.write', 'Can create and update contacts'),
  ('admin', 'audit.read', 'Can read audit events'),
  ('admin', 'dsar.manage', 'Can manage data subject requests'),
  ('manager', 'contacts.write', 'Can create and update contacts'),
  ('manager', 'deals.write', 'Can create and update deals'),
  ('manager', 'audit.read', 'Can read audit events'),
  ('user', 'contacts.write', 'Can create contacts inside assigned scope'),
  ('user', 'tasks.write', 'Can create or update own tasks'),
  ('dsb', 'audit.read', 'Can read audit events'),
  ('dsb', 'dsar.manage', 'Can manage data subject requests'),
  ('dsb', 'consent.manage', 'Can manage consent records')
on conflict do nothing;
