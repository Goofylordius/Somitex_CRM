import "server-only";

import { createSupabaseServerClient } from "@/lib/supabase/server";
import { mockDashboardSnapshot } from "@/lib/mock";
import type { TaskSummary } from "@/lib/types";

export async function listTasks(): Promise<TaskSummary[]> {
  try {
    const supabase = await createSupabaseServerClient();
    const { data } = await supabase
      .from("tasks")
      .select("id, title, priority, due_at, company:companies(name)")
      .in("status", ["open", "in_progress"])
      .order("due_at", { ascending: true })
      .limit(50);

    return (data ?? []).map((task) => ({
      id: task.id as string,
      title: task.title as string,
      priority: task.priority as string,
      dueAt: task.due_at as string,
      companyName: ((task.company as { name?: string } | null)?.name ?? "Unbekannt")
    }));
  } catch {
    return mockDashboardSnapshot.nextTasks;
  }
}
