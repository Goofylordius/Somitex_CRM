import { ConsentBanner } from "@/components/consent-banner";

export default function PrivacyPage() {
  return (
    <div className="public-layout">
      <section className="panel" style={{ maxWidth: 860 }}>
        <div className="panel-body">
          <div className="eyebrow">Datenschutz</div>
          <h1 style={{ marginTop: 8 }}>Transparenz und Einwilligung</h1>
          <p className="helper-text">
            Diese Beispielseite zeigt die oeffentliche Datenschutzhinweis-Struktur und einen dokumentierbaren
            Consent-Hinweis fuer optionale Verarbeitungen.
          </p>

          <div className="link-list">
            <div className="link-item">
              <strong>Zwecke und Rechtsgrundlagen</strong>
              <p>Art. 6 DSGVO, Datenminimierung und definierte Aufbewahrungsfristen.</p>
            </div>
            <div className="link-item">
              <strong>Betroffenenrechte</strong>
              <p>Auskunft, Berichtigung, Loeschung, Datenuebertragbarkeit und Widerspruch.</p>
            </div>
            <div className="link-item">
              <strong>Hosting</strong>
              <p>EU-Region, AVV/DPA, technische und organisatorische Massnahmen.</p>
            </div>
          </div>
        </div>
      </section>
      <ConsentBanner />
    </div>
  );
}
