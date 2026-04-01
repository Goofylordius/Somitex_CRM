import { ShieldCheck } from "lucide-react";

import { LoginForm } from "@/components/auth/login-form";

export default function LoginPage() {
  return (
    <div className="auth-layout">
      <section className="auth-card">
        <div className="panel-body">
          <div className="eyebrow">Secure Access</div>
          <h1>Somitex CRM</h1>
          <p className="helper-text">
            Passwort, Rate-Limit, Lockout und verpflichtende MFA sind bereits in den Server-Flow integriert.
          </p>

          <div className="status-chip status-ok" style={{ margin: "18px 0" }}>
            <ShieldCheck size={14} />
            Privacy by Default
          </div>

          <LoginForm />
        </div>
      </section>
    </div>
  );
}

