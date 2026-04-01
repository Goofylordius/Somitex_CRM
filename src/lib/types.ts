export type AppRole = "admin" | "manager" | "user" | "dsb";

export interface UserProfile {
  id: string;
  tenantId: string;
  fullName: string;
  role: AppRole;
  jobTitle: string | null;
  mfaEnabled: boolean;
}

export interface DashboardMetric {
  label: string;
  value: string;
  hint: string;
}

export interface RevenuePoint {
  label: string;
  value: number;
}

export interface TaskSummary {
  id: string;
  title: string;
  priority: string;
  dueAt: string;
  companyName: string;
}

export interface DashboardSnapshot {
  metrics: DashboardMetric[];
  revenue: RevenuePoint[];
  nextTasks: TaskSummary[];
  pipelineCents: number;
  activeConsents: number;
  pendingDsar: number;
  auditEvents24h: number;
}

export interface ContactRecord {
  id: string;
  companyName: string;
  fullName: string;
  jobTitle: string | null;
  email: string | null;
  phone: string | null;
  city: string | null;
  lawfulBasis: string;
  purposeCode: string;
  lastContactedAt: string | null;
}

export interface DealRecord {
  id: string;
  title: string;
  companyName: string;
  stage: string;
  amountCents: number;
  expectedCloseDate: string | null;
}

export interface AuditLogRecord {
  id: string;
  action: string;
  resourceType: string;
  resourceId: string | null;
  actorRole: string;
  createdAt: string;
  metadata: Record<string, unknown> | null;
}

export interface SecuritySnapshot {
  userProfile: UserProfile | null;
  auditLogs: AuditLogRecord[];
  activeSessions: number;
  pendingDsar: number;
  activeConsents: number;
}

