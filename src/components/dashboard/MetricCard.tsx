interface MetricCardProps {
  label: string;
  value: string;
  sub?: string;
  valueColor?: string;
}

export function MetricCard({ label, value, sub, valueColor = 'text-gray-900' }: MetricCardProps) {
  return (
    <div className="bg-white border border-gray-200 rounded-xl shadow-sm p-5">
      <p className="text-[11px] font-semibold text-gray-500 uppercase tracking-wide">{label}</p>
      <p className={`text-2xl font-bold mt-1 font-mono ${valueColor}`}>{value}</p>
      {sub && <p className="text-xs text-gray-500 mt-1">{sub}</p>}
    </div>
  );
}
