import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function GET() {
  const [{ getCurrentUserProfile, listContacts }] = await Promise.all([import("@/lib/data/contacts")]);
  const profile = await getCurrentUserProfile();

  if (!profile) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const contacts = await listContacts();
  return NextResponse.json({ data: contacts });
}

export async function POST(request: Request) {
  const [{ getCurrentUserProfile }, { encryptPii, piiLookupHash }, { writeAuditEvent }, { contactSchema }, { createSupabaseServerClient }] =
    await Promise.all([
      import("@/lib/data/contacts"),
      import("@/lib/security/pii"),
      import("@/lib/security/audit"),
      import("@/lib/security/validation"),
      import("@/lib/supabase/server")
    ]);
  const profile = await getCurrentUserProfile();

  if (!profile) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json();
  const parsed = contactSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid contact payload" }, { status: 400 });
  }

  const supabase = await createSupabaseServerClient();
  const insertPayload = {
    tenant_id: profile.tenantId,
    company_id: parsed.data.companyId,
    owner_user_id: profile.id,
    full_name: parsed.data.fullName,
    job_title: parsed.data.jobTitle ?? null,
    email_ciphertext: parsed.data.email ? encryptPii(parsed.data.email) : null,
    email_hash: piiLookupHash(parsed.data.email),
    phone_ciphertext: parsed.data.phone ? encryptPii(parsed.data.phone) : null,
    phone_hash: piiLookupHash(parsed.data.phone),
    city: parsed.data.city ?? null,
    country_code: parsed.data.countryCode,
    lawful_basis: parsed.data.lawfulBasis,
    purpose_code: parsed.data.purposeCode,
    retention_policy_id: parsed.data.retentionPolicyId,
    created_by: profile.id,
    updated_by: profile.id
  };

  const { data, error } = await supabase.from("contacts").insert(insertPayload).select("id").single();

  if (error) {
    return NextResponse.json({ error: "Contact could not be stored" }, { status: 400 });
  }

  await writeAuditEvent({
    tenantId: profile.tenantId,
    actorUserId: profile.id,
    actorRole: profile.role,
    action: "contact.created",
    resourceType: "contact",
    resourceId: data.id as string,
    ipAddress: request.headers.get("x-forwarded-for"),
    userAgent: request.headers.get("user-agent")
  });

  return NextResponse.json({ id: data.id }, { status: 201 });
}

