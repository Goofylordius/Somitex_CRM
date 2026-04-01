# Somitex CRM Secure

Full-stack CRM scaffold on Next.js App Router, TypeScript, and Supabase with security-first defaults for:

- DSGVO/BDSG aligned data handling
- MFA-first authentication
- RLS and RBAC on all application tables
- append-only audit logging
- encrypted PII fields
- DSAR export and consent workflows

## Current Status

This repository now contains:

- a secure Next.js application skeleton
- Supabase SQL migrations for schema, roles, RLS, audit logging, storage policies, and retention jobs
- compliance documentation for privacy notice, consent text, DSFA preparation, deployment, and security checks

## Prerequisites

- Node.js 20+
- npm 10+
- Supabase project hosted in an EU region
- Supabase CLI for migrations and tests

## Setup

1. Copy `.env.example` to `.env.local`.
2. Fill in all Supabase and encryption secrets.
3. Install dependencies with `npm install`.
4. Apply the SQL migrations with the Supabase CLI or SQL editor.
5. Create a Vault secret or secure secret-management entry for the long-term PII key lifecycle.
6. Configure Supabase Auth:
   - disable open signup unless explicitly required
   - enable MFA enrollment
   - require email verification
   - enable leaked-password protection if available in your plan
   - restrict redirect URLs to trusted production and preview domains
7. Start the app with `npm run dev`.

## Project Structure

- `src/app`: App Router pages, layouts, route handlers, and styles
- `src/components`: React UI components based on the original HTML template language
- `src/lib`: Supabase helpers, validation, encryption, rate limiting, and data access
- `supabase/migrations`: SQL schema, RLS, audit, and retention logic
- `supabase/tests`: RLS assertions
- `docs/compliance`: privacy, consent, DSFA, deployment, and checklists

## Security Notes

- PII is encrypted in the application layer before persistence.
- All writes are intended to flow through validated server routes or server actions.
- RLS still protects the data store even if an API route is misused.
- Append-only audit logging is implemented in Postgres; for strict WORM retention you should additionally export audit archives to an immutable external store.

## Important

This scaffold is designed to support compliance work, not to replace legal review. Before production go-live, validate the implementation with your Datenschutzbeauftragte:r, legal counsel, and security team.

