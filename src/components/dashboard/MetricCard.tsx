interface MetricCardProps {
  label: string;
  value: string;
  sub?: string;
  valueColor?: string;
}

export function MetricCard({ label, value, sub, valueColor = 'text-gray-100' }: MetricCardProps) {
  return (
    <div className="bg-gray-900 border border-gray-800 rounded-xl p-5">
      <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">{label}</p>
      <p className={`text-2xl font-bold mt-1 ${valueColor}`}>{value}</p>
      {sub && <p className="text-xs text-gray-500 mt-1">{sub}</p>}
    </div>
  );
}
