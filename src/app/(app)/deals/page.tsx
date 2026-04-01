import { listDeals } from "@/lib/data/deals";

function currencyFromCents(value: number): string {
  return new Intl.NumberFormat("de-DE", {
    style: "currency",
    currency: "EUR",
    maximumFractionDigits: 0
  }).format(value / 100);
}

export default async function DealsPage() {
  const deals = await listDeals();

  return (
    <section className="panel">
      <div className="panel-body">
        <div className="panel-header">
          <div>
            <h3>Lead- und Pipeline-Tracking</h3>
            <p>Zugriff wird ueber Rolle, Tenant und Dateneigentuemer gesteuert.</p>
          </div>
          <span className="status-chip">{deals.length} Deals</span>
        </div>

        <div className="table-wrap">
          <table className="data-table">
            <thead>
              <tr>
                <th>Deal</th>
                <th>Unternehmen</th>
                <th>Stufe</th>
                <th>Betrag</th>
                <th>Expected Close</th>
              </tr>
            </thead>
            <tbody>
              {deals.map((deal) => (
                <tr key={deal.id}>
                  <td>{deal.title}</td>
                  <td>{deal.companyName}</td>
                  <td>{deal.stage}</td>
                  <td>{currencyFromCents(deal.amountCents)}</td>
                  <td>{deal.expectedCloseDate ?? "-"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </section>
  );
}

