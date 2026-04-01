import "server-only";

import { createSupabaseServerClient } from "@/lib/supabase/server";
import { mockDeals } from "@/lib/mock";
import type { DealRecord } from "@/lib/types";

export async function listDeals(): Promise<DealRecord[]> {
  try {
    const supabase = await createSupabaseServerClient();
    const { data } = await supabase
      .from("deals")
      .select("id, title, stage, amount_cents, expected_close_date, company:companies(name)")
      .order("created_at", { ascending: false })
      .limit(50);

    return (data ?? []).map((deal) => ({
      id: deal.id as string,
      title: deal.title as string,
      companyName: ((deal.company as { name?: string } | null)?.name ?? "Unbekannt"),
      stage: deal.stage as string,
      amountCents: Number(deal.amount_cents ?? 0),
      expectedCloseDate: (deal.expected_close_date as string | null) ?? null
    }));
  } catch {
    return mockDeals;
  }
}

