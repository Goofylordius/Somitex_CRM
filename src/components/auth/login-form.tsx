"use client";

import { useState } from "react";

import { createSupabaseBrowserClient } from "@/lib/supabase/browser";

export function LoginForm() {
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(formData: FormData) {
    const email = String(formData.get("email") ?? "").trim();
    const password = String(formData.get("password") ?? "");

    setPending(true);
    setError(null);

    try {
      const supabase = createSupabaseBrowserClient();
      const { error: signInError } = await supabase.auth.signInWithPassword({
        email,
        password
      });

      if (signInError) {
        setError("Anmeldung fehlgeschlagen. Bitte pruefen Sie Ihre Zugangsdaten.");
        return;
      }

      const { data: userData, error: userError } = await supabase.auth.getUser();

      if (userError || !userData.user) {
        setError("Sitzung konnte nach der Anmeldung nicht hergestellt werden.");
        return;
      }

      const assurance = await supabase.auth.mfa.getAuthenticatorAssuranceLevel();

      if (assurance.error) {
        setError(assurance.error.message);
        return;
      }

      const targetPath = assurance.data.currentLevel === "aal2" ? "/index.html" : "/mfa";
      window.location.assign(targetPath);
    } finally {
      setPending(false);
    }
  }

  return (
    <form
      className="auth-form"
      action={async (formData) => {
        await handleSubmit(formData);
      }}
    >
      <label className="field-group">
        <span>E-Mail</span>
        <input className="input" type="email" name="email" autoComplete="email" required />
      </label>
      <label className="field-group">
        <span>Passwort</span>
        <input className="input" type="password" name="password" autoComplete="current-password" required minLength={12} />
      </label>

      <p className="helper-text">MFA wird nach erfolgreicher Passwortpruefung als Standard erzwungen.</p>
      {error ? <p className="error-text">{error}</p> : null}

      <button type="submit" className="primary-button" disabled={pending}>
        {pending ? "Anmeldung..." : "Sicher anmelden"}
      </button>
    </form>
  );
}

