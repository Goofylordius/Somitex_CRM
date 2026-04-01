import { NextResponse } from "next/server";

import { getCurrentUserProfile } from "@/lib/data/contacts";
import { revokeUserSessions, writeAuditEvent } from "@/lib/security/audit";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export async function POST(request: Request) {
  const supabase = await createSupabaseServerClient();
  const profile = await getCurrentUserProfile();
  const {
    data: { user }
  } = await supabase.auth.getUser();

  await supabase.auth.signOut();

  if (user) {
    await revokeUserSessions(user.id);
  }

  if (profile) {
    await writeAuditEvent({
      tenantId: profile.tenantId,
      actorUserId: profile.id,
      actorRole: profile.role,
      action: "auth.logout",
      resourceType: "session",
      ipAddress: request.headers.get("x-forwarded-for"),
      userAgent: request.headers.get("user-agent")
    });
  }

  return NextResponse.json({ success: true });
}

