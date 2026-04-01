"use server";

import { headers } from "next/headers";
import { redirect } from "next/navigation";

import { getCurrentUserProfile } from "@/lib/data/contacts";
import { assertLoginAllowed, clearLoginFailures, registerLoginFailure } from "@/lib/security/rate-limit";
import { loginSchema } from "@/lib/security/validation";
import { recordUserSession, writeAuditEvent } from "@/lib/security/audit";
import { createSupabaseMutableServerClient } from "@/lib/supabase/server";

export interface LoginActionState {
  success: boolean;
  error: string | null;
}

export async function loginAction(_: LoginActionState, formData: FormData): Promise<LoginActionState> {
  const parsed = loginSchema.safeParse({
    email: formData.get("email"),
    password: formData.get("password")
  });

  if (!parsed.success) {
    return {
      success: false,
      error: "Bitte pruefen Sie E-Mail und Passwortformat."
    };
  }

  const headerStore = await headers();
  const ipAddress = headerStore.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "unknown";
  const userAgent = headerStore.get("user-agent") ?? "unknown";

  try {
    await assertLoginAllowed(parsed.data.email, ipAddress);
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Anmeldung temporaer blockiert."
    };
  }

  const supabase = await createSupabaseMutableServerClient();
  const { error } = await supabase.auth.signInWithPassword(parsed.data);

  if (error) {
    await registerLoginFailure(parsed.data.email, ipAddress);

    return {
      success: false,
      error: "Anmeldung fehlgeschlagen. Bitte pruefen Sie Ihre Zugangsdaten."
    };
  }

  await clearLoginFailures(parsed.data.email, ipAddress);

  const profile = await getCurrentUserProfile();

  if (!profile) {
    return {
      success: false,
      error: "Benutzerprofil ist nicht freigeschaltet."
    };
  }

  const aal = await supabase.auth.mfa.getAuthenticatorAssuranceLevel();
  const currentLevel = aal.data?.currentLevel === "aal2" ? "aal2" : "aal1";

  const sessionIdentifier = await recordUserSession({
    profile,
    aal: currentLevel,
    ipAddress,
    userAgent
  });

  await writeAuditEvent({
    tenantId: profile.tenantId,
    actorUserId: profile.id,
    actorRole: profile.role,
    action: "auth.login",
    resourceType: "session",
    resourceId: sessionIdentifier,
    metadata: {
      aal: currentLevel
    },
    ipAddress,
    userAgent,
    sessionIdentifier
  });

  if (!profile.mfaEnabled || currentLevel !== "aal2") {
    redirect("/mfa");
  }

  redirect("/");
}

