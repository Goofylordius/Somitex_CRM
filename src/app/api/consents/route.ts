import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function POST(request: Request) {
  const [{ getCurrentUserProfile }, { writeAuditEvent }, { consentSchema }, { createSupabaseServerClient }] =
    await Promise.all([
      import("@/lib/data/contacts"),
      import("@/lib/security/audit"),
      import("@/lib/security/validation"),
      import("@/lib/supabase/server")
    ]);
  const profile = await getCurrentUserProfile();

  if (!profile) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json();
  const parsed = consentSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid consent payload" }, { status: 400 });
  }

  const supabase = await createSupabaseServerClient();
  const now = new Date().toISOString();
  const { data, error } = await supabase
    .from("consent_records")
    .insert({
      tenant_id: profile.tenantId,
      contact_id: parsed.data.contactId,
      purpose_code: parsed.data.purposeCode,
      lawful_basis: parsed.data.lawfulBasis,
      status: parsed.data.status,
      granted_at: parsed.data.status === "granted" ? now : null,
      withdrawn_at: parsed.data.status === "withdrawn" ? now : null,
      source: parsed.data.source,
      proof_reference: parsed.data.proofReference,
      policy_version: parsed.data.policyVersion,
      created_by: profile.id
    })
    .select("id")
    .single();

  if (error) {
    return NextResponse.json({ error: "Consent could not be stored" }, { status: 400 });
  }

  await writeAuditEvent({
    tenantId: profile.tenantId,
    actorUserId: profile.id,
    actorRole: profile.role,
    action: `consent.${parsed.data.status}`,
    resourceType: "consent_record",
    resourceId: data.id as string,
    ipAddress: request.headers.get("x-forwarded-for"),
    userAgent: request.headers.get("user-agent")
  });

  return NextResponse.json({ id: data.id }, { status: 201 });
}

