import type { SecuritySnapshot } from "@/lib/types";

interface SecurityCenterProps {
  snapshot: SecuritySnapshot;
}

export function SecurityCenter({ snapshot }: SecurityCenterProps) {
  return (
    <div className="page-grid">
      <section className="span-12 kpi-grid">
        <article className="kpi-card">
          <span>Rolle</span>
          <strong>{snapshot.userProfile?.role.toUpperCase() ?? "GUEST"}</strong>
          <p>RBAC durch Profil + RLS</p>
        </article>
        <article className="kpi-card">
          <span>Aktive Sessions</span>
          <strong>{snapshot.activeSessions}</strong>
          <p>Verdachtsfaelle schnell sperrbar</p>
        </article>
        <article className="kpi-card">
          <span>Offene DSAR</span>
          <strong>{snapshot.pendingDsar}</strong>
          <p>Fristen nach Art. 12-23 DSGVO</p>
        </article>
        <article className="kpi-card">
          <span>Consent aktiv</span>
          <strong>{snapshot.activeConsents}</strong>
          <p>Widerrufe protokollierbar</p>
        </article>
      </section>

      <section className="panel span-4">
        <div className="panel-body">
          <div className="panel-header">
            <div>
              <h3>Governance</h3>
              <p>BSI- und DSGVO-orientierte Defaults</p>
            </div>
          </div>
          <div className="stat-list">
            <div className="stat-row">
              <span>MFA Status</span>
              <strong>{snapshot.userProfile?.mfaEnabled ? "AAL2" : "AAL1"}</strong>
            </div>
            <div className="stat-row">
              <span>Audit Zugriff</span>
              <strong>{snapshot.auditLogs.length ? "Freigegeben" : "Begrenzt"}</strong>
            </div>
            <div className="stat-row">
              <span>Retention</span>
              <strong>Automatisiert</strong>
            </div>
          </div>
        </div>
      </section>

      <section className="panel span-8">
        <div className="panel-body">
          <div className="panel-header">
            <div>
              <h3>Audit Log</h3>
              <p>Wer, wann, was, worauf.</p>
            </div>
          </div>
          <div className="audit-list">
            {snapshot.auditLogs.map((log) => (
              <article key={log.id} className="audit-item">
                <div>
                  <strong>{log.action}</strong>
                  <p>
                    {log.resourceType}
                    {log.resourceId ? ` · ${log.resourceId}` : ""}
                  </p>
                </div>
                <div>
                  <strong>{log.actorRole}</strong>
                  <p>{new Date(log.createdAt).toLocaleString("de-DE")}</p>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}

