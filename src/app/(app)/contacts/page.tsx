import { ContactsTable } from "@/components/contacts-table";
import { listContacts } from "@/lib/data/contacts";

export default async function ContactsPage() {
  const contacts = await listContacts();
  return <ContactsTable contacts={contacts} />;
}

