create extension if not exists pgcrypto;
create extension if not exists pg_cron;

create schema if not exists audit;
create schema if not exists security;

do $$
begin
  if not exists (select 1 from pg_type where typname = 'app_role') then
    create type public.app_role as enum ('admin', 'manager', 'user', 'dsb');
  end if;
end
$$;
