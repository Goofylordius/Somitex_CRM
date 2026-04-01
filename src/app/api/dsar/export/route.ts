import { NextResponse } from "next/server";

import { getCurrentUserProfile } from "@/lib/data/contacts";
import { decryptPii } from "@/lib/security/pii";
import { writeAuditEvent } from "@/lib/security/audit";
import { dsarExportQuerySchema } from "@/lib/security/validation";
import { createSupabaseServerClient } from "@/lib/supabase/server";

const ALLOWED_EXPORT_ROLES = new Set(["admin", "manager", "dsb"]);

function escapeCsv(value: unknown): string {
  const stringValue = String(value ?? "");
  return `"${stringValue.replaceAll('"', '""')}"`;
}

export async function GET(request: Request) {
  const profile = await getCurrentUserProfile();

  if (!profile) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  if (!ALLOWED_EXPORT_ROLES.has(profile.role)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const url = new URL(request.url);
  const query = dsarExportQuerySchema.safeParse({
    contactId: url.searchParams.get("contactId")
  });

  if (!query.success) {
    return NextResponse.json({ error: "Invalid export request" }, { status: 400 });
  }

  const format = url.searchParams.get("format") === "csv" ? "csv" : "json";
  const supabase = await createSupabaseServerClient();
  const contactId = query.data.contactId;

  const [{ data: contact }, { data: consents }, { data: activities }, { data: tasks }, { data: deals }] = await Promise.all([
    supabase
      .from("contacts")
      .select(
        "id, full_name, email_ciphertext, phone_ciphertext, city, lawful_basis, purpose_code, company:companies(name)"
      )
      .eq("id", contactId)
      .single(),
    supabase
      .from("consent_records")
      .select("id, purpose_code, status, granted_at, withdrawn_at, source, policy_version")
      .eq("contact_id", contactId),
    supabase.from("activities").select("id, activity_type, details, happened_at").eq("contact_id", contactId),
    supabase.from("tasks").select("id, title, status, due_at").eq("contact_id", contactId),
    supabase.from("deals").select("id, title, stage, amount_cents").eq("primary_contact_id", contactId)
  ]);

  if (!contact) {
    return NextResponse.json({ error: "Contact not found" }, { status: 404 });
  }

  const payload = {
    exportedAt: new Date().toISOString(),
    contact: {
      id: contact.id,
      fullName: contact.full_name,
      email: decryptPii((contact.email_ciphertext as string | null) ?? null),
      phone: decryptPii((contact.phone_ciphertext as string | null) ?? null),
      city: contact.city,
      lawfulBasis: contact.lawful_basis,
      purposeCode: contact.purpose_code,
      companyName: ((contact.company as { name?: string } | null)?.name ?? "Unbekannt")
    },
    consents: consents ?? [],
    activities: activities ?? [],
    tasks: tasks ?? [],
    deals: deals ?? []
  };

  await writeAuditEvent({
    tenantId: profile.tenantId,
    actorUserId: profile.id,
    actorRole: profile.role,
    action: "dsar.exported",
    resourceType: "contact",
    resourceId: contactId,
    ipAddress: request.headers.get("x-forwarded-for"),
    userAgent: request.headers.get("user-agent"),
    metadata: {
      format
    }
  });

  if (format === "csv") {
    const rows = [
      ["section", "field", "value"],
      ["contact", "fullName", payload.contact.fullName],
      ["contact", "email", payload.contact.email],
      ["contact", "phone", payload.contact.phone],
      ["contact", "city", payload.contact.city],
      ...payload.consents.flatMap((consent) => [
        ["consent", `${consent.id}.purpose_code`, consent.purpose_code],
        ["consent", `${consent.id}.status`, consent.status]
      ]),
      ...payload.tasks.flatMap((task) => [
        ["task", `${task.id}.title`, task.title],
        ["task", `${task.id}.status`, task.status]
      ]),
      ...payload.deals.flatMap((deal) => [
        ["deal", `${deal.id}.title`, deal.title],
        ["deal", `${deal.id}.stage`, deal.stage]
      ])
    ];

    const csv = rows.map((row) => row.map(escapeCsv).join(",")).join("\n");

    return new NextResponse(csv, {
      headers: {
        "Content-Type": "text/csv; charset=utf-8",
        "Content-Disposition": `attachment; filename="dsar-${contactId}.csv"`
      }
    });
  }

  return NextResponse.json(payload);
}
