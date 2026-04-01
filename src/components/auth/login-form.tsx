"use client";

import { useActionState } from "react";

import { loginAction, type LoginActionState } from "@/app/(auth)/actions";

const initialState: LoginActionState = {
  success: false,
  error: null
};

export function LoginForm() {
  const [state, formAction, pending] = useActionState(loginAction, initialState);

  return (
    <form className="auth-form" action={formAction}>
      <label className="field-group">
        <span>E-Mail</span>
        <input className="input" type="email" name="email" autoComplete="email" required />
      </label>
      <label className="field-group">
        <span>Passwort</span>
        <input className="input" type="password" name="password" autoComplete="current-password" required minLength={12} />
      </label>

      <p className="helper-text">MFA wird nach erfolgreicher Passwortpruefung als Standard erzwungen.</p>
      {state.error ? <p className="error-text">{state.error}</p> : null}

      <button type="submit" className="primary-button" disabled={pending}>
        {pending ? "Anmeldung..." : "Sicher anmelden"}
      </button>
    </form>
  );
}

