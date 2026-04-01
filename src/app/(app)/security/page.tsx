import { SecurityCenter } from "@/components/security-center";
import { getSecuritySnapshot } from "@/lib/data/security";

export default async function SecurityPage() {
  const snapshot = await getSecuritySnapshot();
  return <SecurityCenter snapshot={snapshot} />;
}

