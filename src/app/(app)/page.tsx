import { DashboardOverview } from "@/components/dashboard-overview";
import { getDashboardSnapshot } from "@/lib/data/dashboard";

export default async function DashboardPage() {
  const snapshot = await getDashboardSnapshot();
  return <DashboardOverview snapshot={snapshot} />;
}

