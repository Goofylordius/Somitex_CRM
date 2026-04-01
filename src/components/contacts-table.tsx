import type { ContactRecord } from "@/lib/types";

interface ContactsTableProps {
  contacts: ContactRecord[];
}

export function ContactsTable({ contacts }: ContactsTableProps) {
  return (
    <section className="panel">
      <div className="panel-body">
        <div className="panel-header">
          <div>
            <h3>Kontaktmanagement</h3>
            <p>PII wird serverseitig entschluesselt und rollenabhaengig angezeigt.</p>
          </div>
          <span className="status-chip">{contacts.length} Eintraege</span>
        </div>

        <div className="table-wrap">
          <table className="data-table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Unternehmen</th>
                <th>E-Mail</th>
                <th>Telefon</th>
                <th>Rechtsgrundlage</th>
                <th>Zweck</th>
                <th>Letzter Kontakt</th>
              </tr>
            </thead>
            <tbody>
              {contacts.map((contact) => (
                <tr key={contact.id}>
                  <td>
                    <strong>{contact.fullName}</strong>
                    <small>{contact.jobTitle ?? "Keine Rolle hinterlegt"}</small>
                  </td>
                  <td>{contact.companyName}</td>
                  <td>{contact.email ?? "Nicht hinterlegt"}</td>
                  <td>{contact.phone ?? "Nicht hinterlegt"}</td>
                  <td>{contact.lawfulBasis}</td>
                  <td>{contact.purposeCode}</td>
                  <td>{contact.lastContactedAt ? new Date(contact.lastContactedAt).toLocaleDateString("de-DE") : "-"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </section>
  );
}

