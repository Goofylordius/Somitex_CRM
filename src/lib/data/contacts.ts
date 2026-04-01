import "server-only";

import { createSupabaseServerClient } from "@/lib/supabase/server";
import { mockContacts } from "@/lib/mock";
import type { ContactRecord, UserProfile } from "@/lib/types";

const CAN_VIEW_CLEAR_PII = new Set(["admin", "manager", "dsb"]);

export async function getCurrentUserProfile(): Promise<UserProfile | null> {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user }
  } = await supabase.auth.getUser();

  if (!user) {
    return null;
  }

  const { data } = await supabase
    .from("user_profiles")
    .select("id, tenant_id, full_name, role, job_title, mfa_enrolled_at")
    .eq("id", user.id)
    .maybeSingle();

  if (!data) {
    return null;
  }

  return {
    id: data.id as string,
    tenantId: data.tenant_id as string,
    fullName: data.full_name as string,
    role: data.role as UserProfile["role"],
    jobTitle: (data.job_title as string | null) ?? null,
    mfaEnabled: Boolean(data.mfa_enrolled_at)
  };
}

export async function listContacts(): Promise<ContactRecord[]> {
  try {
    const { decryptPii, maskEmail, maskPhone } = await import("@/lib/security/pii");
    const supabase = await createSupabaseServerClient();
    const profile = await getCurrentUserProfile();
    const mayViewClearPii = profile ? CAN_VIEW_CLEAR_PII.has(profile.role) : false;
    const { data } = await supabase
      .from("contacts")
      .select(
        "id, full_name, job_title, email_ciphertext, phone_ciphertext, city, lawful_basis, purpose_code, last_contacted_at, company:companies(name)"
      )
      .order("created_at", { ascending: false })
      .limit(50);

    return (data ?? []).map((contact) => {
      const email = decryptPii((contact.email_ciphertext as string | null) ?? null);
      const phone = decryptPii((contact.phone_ciphertext as string | null) ?? null);

      return {
        id: contact.id as string,
        companyName: ((contact.company as { name?: string } | null)?.name ?? "Unbekannt"),
        fullName: contact.full_name as string,
        jobTitle: (contact.job_title as string | null) ?? null,
        email: mayViewClearPii ? email : maskEmail(email),
        phone: mayViewClearPii ? phone : maskPhone(phone),
        city: (contact.city as string | null) ?? null,
        lawfulBasis: contact.lawful_basis as string,
        purposeCode: contact.purpose_code as string,
        lastContactedAt: (contact.last_contacted_at as string | null) ?? null
      };
    });
  } catch {
    return mockContacts;
  }
}

