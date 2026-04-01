import "server-only";

import { createHmac, randomUUID } from "node:crypto";

import { getRateLimitEnv } from "@/lib/env";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import type { AppRole, UserProfile } from "@/lib/types";

interface AuditEventInput {
  tenantId: string;
  actorUserId: string | null;
  actorRole: AppRole | "system";
  action: string;
  resourceType: string;
  resourceId?: string | null;
  metadata?: Record<string, unknown> | null;
  ipAddress?: string | null;
  userAgent?: string | null;
  sessionIdentifier?: string | null;
}

interface SessionInput {
  profile: UserProfile;
  aal: "aal1" | "aal2";
  ipAddress?: string | null;
  userAgent?: string | null;
}

function hashValue(value: string | null | undefined): string | null {
  if (!value) {
    return null;
  }

  const env = getRateLimitEnv();
  return createHmac("sha256", env.RATE_LIMIT_SALT).update(value).digest("hex");
}

export async function writeAuditEvent(input: AuditEventInput): Promise<void> {
  const supabase = createSupabaseAdminClient();

  await supabase.schema("audit").from("audit_logs").insert({
    tenant_id: input.tenantId,
    actor_user_id: input.actorUserId,
    actor_role: input.actorRole,
    action: input.action,
    resource_type: input.resourceType,
    resource_id: input.resourceId ?? null,
    session_identifier: input.sessionIdentifier ?? null,
    ip_hash: hashValue(input.ipAddress),
    user_agent_hash: hashValue(input.userAgent),
    metadata: input.metadata ?? {}
  });
}

export async function recordUserSession(input: SessionInput): Promise<string> {
  const sessionIdentifier = randomUUID();
  const supabase = createSupabaseAdminClient();

  await supabase.from("user_sessions").upsert(
    {
      tenant_id: input.profile.tenantId,
      user_id: input.profile.id,
      session_identifier: sessionIdentifier,
      aal: input.aal,
      ip_hash: hashValue(input.ipAddress),
      user_agent_hash: hashValue(input.userAgent),
      last_seen_at: new Date().toISOString(),
      expires_at: new Date(Date.now() + 8 * 60 * 60 * 1000).toISOString()
    },
    {
      onConflict: "session_identifier"
    }
  );

  return sessionIdentifier;
}

export async function revokeUserSessions(userId: string): Promise<void> {
  const supabase = createSupabaseAdminClient();
  await supabase
    .from("user_sessions")
    .update({
      revoked_at: new Date().toISOString()
    })
    .eq("user_id", userId)
    .is("revoked_at", null);
}

