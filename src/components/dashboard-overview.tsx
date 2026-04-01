import { KpiCard } from "@/components/kpi-card";
import type { DashboardSnapshot } from "@/lib/types";

interface DashboardOverviewProps {
  snapshot: DashboardSnapshot;
}

function currencyFromCents(value: number): string {
  return new Intl.NumberFormat("de-DE", {
    style: "currency",
    currency: "EUR",
    maximumFractionDigits: 0
  }).format(value / 100);
}

export function DashboardOverview({ snapshot }: DashboardOverviewProps) {
  const maxRevenue = Math.max(...snapshot.revenue.map((point) => point.value), 1);

  return (
    <div className="page-grid">
      <section className="panel hero-panel span-8">
        <div className="panel-body">
          <div className="hero-eyebrow">Somitex CRM · Secure Workspace</div>
          <h2>Volle Kontrolle. Klarer Fokus. Maximale Sicherheit.</h2>
          <p>
            Die UI uebernimmt die visuelle Sprache des bestehenden Templates, arbeitet jetzt aber mit einem RLS-gesicherten
            Supabase-Backend, MFA-Pflicht und revisionsfaehigem Audit-Trail.
          </p>
          <div className="hero-metrics">
            <div>
              <span>Pipeline</span>
              <strong>{currencyFromCents(snapshot.pipelineCents)}</strong>
            </div>
            <div>
              <span>Aktive Consents</span>
              <strong>{snapshot.activeConsents}</strong>
            </div>
            <div>
              <span>DSAR offen</span>
              <strong>{snapshot.pendingDsar}</strong>
            </div>
            <div>
              <span>Audit 24h</span>
              <strong>{snapshot.auditEvents24h}</strong>
            </div>
          </div>
        </div>
      </section>

      <section className="panel span-4">
        <div className="panel-body">
          <div className="panel-header">
            <div>
              <h3>Security Status</h3>
              <p>Echtzeit-Schutzstatus</p>
            </div>
            <span className="status-chip status-ok">Aktiv</span>
          </div>
          <div className="stat-list">
            <div className="stat-row">
              <span>Authentifizierung</span>
              <strong>MFA Pflicht</strong>
            </div>
            <div className="stat-row">
              <span>Datenspeicherung</span>
              <strong>PII verschluesselt</strong>
            </div>
            <div className="stat-row">
              <span>Transport</span>
              <strong>TLS only</strong>
            </div>
            <div className="stat-row">
              <span>Audit</span>
              <strong>Append-only</strong>
            </div>
          </div>
        </div>
      </section>

      <section className="span-12 kpi-grid">
        {snapshot.metrics.map((metric) => (
          <KpiCard key={metric.label} {...metric} />
        ))}
      </section>

      <section className="panel span-7">
        <div className="panel-body">
          <div className="panel-header">
            <div>
              <h3>Revenue Pulse</h3>
              <p>Visualisierung nach Vorbild des HTML-Prototyps</p>
            </div>
          </div>
          <div className="chart-bars" aria-label="Umsatztrend">
            {snapshot.revenue.map((point) => (
              <div key={point.label} className="chart-bar-item">
                <div className="chart-bar">
                  <div style={{ height: `${Math.round((point.value / maxRevenue) * 100)}%` }} />
                </div>
                <strong>{point.label}</strong>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="panel span-5">
        <div className="panel-body">
          <div className="panel-header">
            <div>
              <h3>Naechste Aufgaben</h3>
              <p>Faelligkeiten mit Need-to-know Zugriff</p>
            </div>
          </div>
          <div className="list-stack">
            {snapshot.nextTasks.map((task) => (
              <div key={task.id} className="mini-card">
                <div>
                  <strong>{task.title}</strong>
                  <p>{task.companyName}</p>
                </div>
                <span>{new Date(task.dueAt).toLocaleDateString("de-DE")}</span>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}

