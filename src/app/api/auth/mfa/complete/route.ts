import { NextResponse } from "next/server";

import { getCurrentUserProfile } from "@/lib/data/contacts";
import { writeAuditEvent } from "@/lib/security/audit";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export async function POST(request: Request) {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user }
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const profile = await getCurrentUserProfile();

  if (!profile) {
    return NextResponse.json({ error: "Profile missing" }, { status: 403 });
  }

  await supabase
    .from("user_profiles")
    .update({
      mfa_enrolled_at: new Date().toISOString()
    })
    .eq("id", profile.id);

  const admin = createSupabaseAdminClient();
  await admin
    .from("user_sessions")
    .update({
      aal: "aal2",
      last_seen_at: new Date().toISOString()
    })
    .eq("user_id", profile.id)
    .is("revoked_at", null);

  await writeAuditEvent({
    tenantId: profile.tenantId,
    actorUserId: profile.id,
    actorRole: profile.role,
    action: "auth.mfa_verified",
    resourceType: "user_profile",
    resourceId: profile.id,
    ipAddress: request.headers.get("x-forwarded-for"),
    userAgent: request.headers.get("user-agent")
  });

  return NextResponse.json({ success: true });
}

