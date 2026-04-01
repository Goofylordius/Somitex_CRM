import { redirect } from "next/navigation";

import { MfaChallengeForm } from "@/components/auth/mfa-challenge-form";
import { getCurrentUserProfile } from "@/lib/data/contacts";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export default async function MfaPage() {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user }
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const profile = await getCurrentUserProfile();
  const aal = await supabase.auth.mfa.getAuthenticatorAssuranceLevel();

  if (profile?.mfaEnabled && aal.data?.currentLevel === "aal2") {
    redirect("/");
  }

  return (
    <div className="auth-layout">
      <MfaChallengeForm />
    </div>
  );
}

