import "server-only";

import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { getCurrentUserProfile } from "@/lib/data/contacts";
import { mockSecuritySnapshot } from "@/lib/mock";
import type { AuditLogRecord, SecuritySnapshot } from "@/lib/types";

const AUDIT_VIEW_ROLES = new Set(["admin", "manager", "dsb"]);

export async function getSecuritySnapshot(): Promise<SecuritySnapshot> {
  try {
    const profile = await getCurrentUserProfile();

    if (!profile) {
      return { ...mockSecuritySnapshot, userProfile: null };
    }

    let auditLogs: AuditLogRecord[] = [];

    if (AUDIT_VIEW_ROLES.has(profile.role)) {
      const supabaseAdmin = createSupabaseAdminClient();
      const { data } = await supabaseAdmin
        .schema("audit")
        .from("audit_logs")
        .select("id, action, resource_type, resource_id, actor_role, created_at, metadata")
        .eq("tenant_id", profile.tenantId)
        .order("created_at", { ascending: false })
        .limit(20);

      auditLogs = (data ?? []).map((entry) => ({
        id: String(entry.id),
        action: entry.action as string,
        resourceType: entry.resource_type as string,
        resourceId: (entry.resource_id as string | null) ?? null,
        actorRole: entry.actor_role as string,
        createdAt: entry.created_at as string,
        metadata: (entry.metadata as Record<string, unknown> | null) ?? null
      }));
    }

    const supabaseAdmin = createSupabaseAdminClient();
    const [{ count: activeSessions }, { count: pendingDsar }, { count: activeConsents }] = await Promise.all([
      supabaseAdmin
        .from("user_sessions")
        .select("*", { count: "exact", head: true })
        .eq("tenant_id", profile.tenantId)
        .is("revoked_at", null),
      supabaseAdmin
        .from("dsar_requests")
        .select("*", { count: "exact", head: true })
        .eq("tenant_id", profile.tenantId)
        .in("status", ["submitted", "in_review"]),
      supabaseAdmin
        .from("consent_records")
        .select("*", { count: "exact", head: true })
        .eq("tenant_id", profile.tenantId)
        .eq("status", "granted")
    ]);

    return {
      userProfile: profile,
      auditLogs,
      activeSessions: activeSessions ?? 0,
      pendingDsar: pendingDsar ?? 0,
      activeConsents: activeConsents ?? 0
    };
  } catch {
    return mockSecuritySnapshot;
  }
}
