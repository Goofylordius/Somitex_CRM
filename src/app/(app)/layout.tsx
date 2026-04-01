import { redirect } from "next/navigation";

import { AppShell } from "@/components/app-shell";
import { getCurrentUserProfile } from "@/lib/data/contacts";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export default async function ProtectedLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user }
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const profile = await getCurrentUserProfile();
  const aal = await supabase.auth.mfa.getAuthenticatorAssuranceLevel();

  if (!profile) {
    redirect("/login");
  }

  if (!profile.mfaEnabled || aal.data?.currentLevel !== "aal2") {
    redirect("/mfa");
  }

  return <AppShell userProfile={profile}>{children}</AppShell>;
}

