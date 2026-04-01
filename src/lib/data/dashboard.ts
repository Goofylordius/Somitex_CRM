import "server-only";

import { getCurrentUserProfile } from "@/lib/data/contacts";
import { mockDashboardSnapshot } from "@/lib/mock";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import type { DashboardSnapshot } from "@/lib/types";

function toCurrency(valueInCents: number): string {
  return new Intl.NumberFormat("de-DE", {
    style: "currency",
    currency: "EUR",
    maximumFractionDigits: 0
  }).format(valueInCents / 100);
}

export async function getDashboardSnapshot(): Promise<DashboardSnapshot> {
  try {
    const supabase = await createSupabaseServerClient();
    const profile = await getCurrentUserProfile();
    const [{ count: companies }, { data: deals }, { data: tasks }, { count: consents }, { count: dsars }] = await Promise.all([
      supabase.from("companies").select("*", { count: "exact", head: true }),
      supabase.from("deals").select("amount_cents, stage"),
      supabase
        .from("tasks")
        .select("id, title, priority, due_at, company:companies(name)")
        .in("status", ["open", "in_progress"])
        .order("due_at", { ascending: true })
        .limit(4),
      supabase
        .from("consent_records")
        .select("*", { count: "exact", head: true })
        .eq("status", "granted"),
      supabase
        .from("dsar_requests")
        .select("*", { count: "exact", head: true })
        .in("status", ["submitted", "in_review"])
    ]);

    let audits = 0;

    if (profile && ["admin", "manager", "dsb"].includes(profile.role)) {
      const admin = createSupabaseAdminClient();
      const { count } = await admin
        .schema("audit")
        .from("audit_logs")
        .select("*", { count: "exact", head: true })
        .eq("tenant_id", profile.tenantId)
        .gte("created_at", new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString());

      audits = count ?? 0;
    }

    const pipeline = (deals ?? []).reduce((sum, deal) => {
      const isOpen = deal.stage !== "won" && deal.stage !== "lost";
      return isOpen ? sum + Number(deal.amount_cents ?? 0) : sum;
    }, 0);

    const nextTasks = (tasks ?? []).map((task) => ({
      id: task.id as string,
      title: task.title as string,
      priority: task.priority as string,
      dueAt: task.due_at as string,
      companyName: ((task.company as { name?: string } | null)?.name ?? "Unbekannt")
    }));

    return {
      metrics: [
        {
          label: "Aktive Unternehmen",
          value: String(companies ?? 0),
          hint: "Mandantentrennung per RLS"
        },
        {
          label: "Offene Pipeline",
          value: toCurrency(pipeline),
          hint: "Nur berechtigte Deals"
        },
        {
          label: "Offene DSAR",
          value: String(dsars ?? 0),
          hint: "Art. 15-17 Workflow"
        },
        {
          label: "Audit 24h",
          value: String(audits),
          hint: "Append-only"
        }
      ],
      revenue: mockDashboardSnapshot.revenue,
      nextTasks,
      pipelineCents: pipeline,
      activeConsents: consents ?? 0,
      pendingDsar: dsars ?? 0,
      auditEvents24h: audits
    };
  } catch {
    return mockDashboardSnapshot;
  }
}
