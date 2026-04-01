import type { AuditLogRecord, ContactRecord, DashboardSnapshot, DealRecord, SecuritySnapshot, UserProfile } from "@/lib/types";

export const mockUserProfile: UserProfile = {
  id: "00000000-0000-0000-0000-000000000001",
  tenantId: "11111111-1111-1111-1111-111111111111",
  fullName: "Elena Graf",
  role: "admin",
  jobTitle: "Revenue Lead",
  mfaEnabled: true
};

export const mockDashboardSnapshot: DashboardSnapshot = {
  metrics: [
    { label: "Aktive Unternehmen", value: "48", hint: "Nur berechtigte Mandatsdaten" },
    { label: "Pipeline", value: "184.100 EUR", hint: "RLS abgesichert" },
    { label: "Offene DSAR", value: "2", hint: "Fristgesteuert" },
    { label: "Audit 24h", value: "127", hint: "Append-only" }
  ],
  revenue: [
    { label: "Jan", value: 48000 },
    { label: "Feb", value: 53000 },
    { label: "Mrz", value: 61000 },
    { label: "Apr", value: 59000 },
    { label: "Mai", value: 68000 },
    { label: "Jun", value: 72000 }
  ],
  nextTasks: [
    {
      id: "tsk-1",
      title: "Budgetfreigabe anfragen",
      priority: "high",
      dueAt: "2026-04-03T09:00:00.000Z",
      companyName: "Weber Logistics"
    },
    {
      id: "tsk-2",
      title: "SLA-Anhang freigeben",
      priority: "medium",
      dueAt: "2026-04-05T10:30:00.000Z",
      companyName: "Schenk Mobility"
    }
  ],
  pipelineCents: 18410000,
  activeConsents: 41,
  pendingDsar: 2,
  auditEvents24h: 127
};

export const mockContacts: ContactRecord[] = [
  {
    id: "c1",
    companyName: "Nord Atelier",
    fullName: "Mara Koehler",
    jobTitle: "Founder",
    email: "mara@nordatelier.de",
    phone: "+49 30 5551 228",
    city: "Berlin",
    lawfulBasis: "contract_preparation",
    purposeCode: "sales.crm",
    lastContactedAt: "2026-03-29T10:30:00.000Z"
  },
  {
    id: "c2",
    companyName: "Studio Form West",
    fullName: "Aylin Demir",
    jobTitle: "Managing Director",
    email: "aylin@studioformwest.de",
    phone: "+49 221 6029 410",
    city: "Koeln",
    lawfulBasis: "consent",
    purposeCode: "newsletter.b2b",
    lastContactedAt: "2026-03-30T09:10:00.000Z"
  }
];

export const mockDeals: DealRecord[] = [
  {
    id: "p1",
    title: "Relaunch Retainer",
    companyName: "Nord Atelier",
    stage: "proposal",
    amountCents: 1880000,
    expectedCloseDate: "2026-04-21"
  },
  {
    id: "p2",
    title: "Migration Sprint",
    companyName: "Hartmann Studio",
    stage: "negotiation",
    amountCents: 2640000,
    expectedCloseDate: "2026-04-25"
  }
];

export const mockAuditLogs: AuditLogRecord[] = [
  {
    id: "1",
    action: "contact.created",
    resourceType: "contact",
    resourceId: "c1",
    actorRole: "admin",
    createdAt: "2026-04-01T07:35:00.000Z",
    metadata: { source: "api.contacts" }
  },
  {
    id: "2",
    action: "consent.withdrawn",
    resourceType: "consent_record",
    resourceId: "cr1",
    actorRole: "dsb",
    createdAt: "2026-04-01T06:20:00.000Z",
    metadata: { source: "api.consents" }
  }
];

export const mockSecuritySnapshot: SecuritySnapshot = {
  userProfile: mockUserProfile,
  auditLogs: mockAuditLogs,
  activeSessions: 5,
  pendingDsar: 2,
  activeConsents: 41
};

