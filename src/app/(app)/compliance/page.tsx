import { getSecuritySnapshot } from "@/lib/data/security";

export default async function CompliancePage() {
  const snapshot = await getSecuritySnapshot();

  return (
    <div className="page-grid">
      <section className="panel span-12">
        <div className="panel-body">
          <div className="panel-header">
            <div>
              <h3>Datenschutz-Compliance</h3>
              <p>DSAR, Consent und Retention sind als operative Prozesse mit Datenmodell hinterlegt.</p>
            </div>
          </div>

          <div className="compliance-grid">
            <article className="compliance-card">
              <h3>DSAR Workflow</h3>
              <p>
                Offene Anfragen: {snapshot.pendingDsar}. Export und Loeschung werden ueber serverseitige Endpunkte,
                Audit-Events und dokumentierte Fristen gesteuert.
              </p>
            </article>
            <article className="compliance-card">
              <h3>Consent Register</h3>
              <p>
                Aktive Einwilligungen: {snapshot.activeConsents}. Version, Quelle, Nachweis und Widerruf werden im
                Consent-Record gespeichert.
              </p>
            </article>
            <article className="compliance-card">
              <h3>Privacy by Default</h3>
              <p>
                PII wird verschluesselt gespeichert, nur serverseitig entschluesselt und auf Basis von Rolle und Zweck
                angezeigt.
              </p>
            </article>
            <article className="compliance-card">
              <h3>Dokumentation</h3>
              <p>Die Ordner `docs/compliance` und `supabase/migrations` enthalten die betriebsrelevanten Vorgaben.</p>
            </article>
          </div>
        </div>
      </section>
    </div>
  );
}

