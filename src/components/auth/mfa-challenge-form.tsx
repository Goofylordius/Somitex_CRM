"use client";

import { useEffect, useMemo, useState } from "react";

import { createSupabaseBrowserClient } from "@/lib/supabase/browser";

export function MfaChallengeForm() {
  const supabase = useMemo(() => createSupabaseBrowserClient(), []);
  const [code, setCode] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [factorId, setFactorId] = useState<string | null>(null);
  const [qrCode, setQrCode] = useState<string | null>(null);
  const [secret, setSecret] = useState<string | null>(null);
  const [enrolling, setEnrolling] = useState(false);
  const [busy, setBusy] = useState(true);

  useEffect(() => {
    async function bootstrap() {
      setBusy(true);
      setError(null);

      const aal = await supabase.auth.mfa.getAuthenticatorAssuranceLevel();
      if (aal.error) {
        setError(aal.error.message);
        setBusy(false);
        return;
      }

      if (aal.data.currentLevel === "aal2") {
        window.location.assign("/index.html");
        return;
      }

      const factors = await supabase.auth.mfa.listFactors();
      if (factors.error) {
        setError(factors.error.message);
        setBusy(false);
        return;
      }

      const activeFactor = factors.data?.totp[0];

      if (activeFactor) {
        setFactorId(activeFactor.id);
        setEnrolling(false);
        setBusy(false);
        return;
      }

      const enrollment = await supabase.auth.mfa.enroll({
        factorType: "totp"
      });

      if (enrollment.error) {
        setError(enrollment.error.message);
        setBusy(false);
        return;
      }

      setFactorId(enrollment.data.id);
      setQrCode(enrollment.data.totp.qr_code);
      setSecret(enrollment.data.totp.secret);
      setEnrolling(true);
      setBusy(false);
    }

    void bootstrap();
  }, [supabase]);

  async function handleVerify() {
    if (!factorId || !code.trim()) {
      return;
    }

    setBusy(true);
    setError(null);

    const challenge = await supabase.auth.mfa.challenge({
      factorId
    });

    if (challenge.error) {
      setError(challenge.error.message);
      setBusy(false);
      return;
    }

    const verify = await supabase.auth.mfa.verify({
      factorId,
      challengeId: challenge.data.id,
      code: code.trim()
    });

    if (verify.error) {
      setError(verify.error.message);
      setBusy(false);
      return;
    }

    const session = await supabase.auth.getSession();

    if (session.error || !session.data.session) {
      setError("Sitzung konnte nach der MFA-Bestaetigung nicht hergestellt werden.");
      setBusy(false);
      return;
    }

    try {
      await fetch("/api/auth/mfa/complete", {
        method: "POST",
        credentials: "include"
      });
    } catch (completionError) {
      console.error("MFA completion sync failed", completionError);
    }

    window.location.assign("/index.html");
  }

  return (
    <div className="panel auth-panel">
      <div className="panel-body">
        <div className="panel-header">
          <div>
            <h3>MFA bestaetigen</h3>
            <p>{enrolling ? "TOTP jetzt einrichten." : "TOTP Code zur Freigabe eingeben."}</p>
          </div>
        </div>

        {busy ? <p className="helper-text">Lade MFA-Status...</p> : null}
        {error ? <p className="error-text">{error}</p> : null}

        {qrCode ? (
          <div className="mfa-box">
            <img src={qrCode} alt="MFA QR Code" className="mfa-qr" />
            <p className="helper-text">Alternativ manueller Secret: {secret}</p>
          </div>
        ) : null}

        <label className="field-group">
          <span>6-stelliger TOTP Code</span>
          <input
            className="input"
            type="text"
            inputMode="numeric"
            maxLength={6}
            value={code}
            onChange={(event) => setCode(event.target.value.replace(/\D/g, ""))}
          />
        </label>

        <button type="button" className="primary-button" onClick={handleVerify} disabled={busy || code.length < 6}>
          {enrolling ? "MFA aktivieren" : "MFA pruefen"}
        </button>
      </div>
    </div>
  );
}
