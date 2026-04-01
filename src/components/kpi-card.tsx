interface KpiCardProps {
  label: string;
  value: string;
  hint: string;
}

export function KpiCard({ hint, label, value }: KpiCardProps) {
  return (
    <article className="kpi-card">
      <span>{label}</span>
      <strong>{value}</strong>
      <p>{hint}</p>
    </article>
  );
}

