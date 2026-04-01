import { MfaChallengeForm } from "@/components/auth/mfa-challenge-form";

export default async function MfaPage() {
  return (
    <div className="auth-layout">
      <MfaChallengeForm />
    </div>
  );
}

