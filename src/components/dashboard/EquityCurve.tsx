'use client';

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
} from 'recharts';
import type { EquityPoint } from '@/lib/types';

interface Props {
  data: EquityPoint[];
}

function formatCurrency(v: number) {
  return v >= 0 ? `$${v.toLocaleString()}` : `-$${Math.abs(v).toLocaleString()}`;
}

export function EquityCurve({ data }: Props) {
  if (data.length === 0) {
    return (
      <div className="flex items-center justify-center h-48 text-gray-400 text-sm">
        No closed trades yet
      </div>
    );
  }

  // With a single point there's no segment to draw — prepend a zero baseline so the line renders
  const chartData = data.length === 1 ? [{ date: '', cumPnl: 0, pnl: 0 }, ...data] : data;

  return (
    <ResponsiveContainer width="100%" height={220}>
      <LineChart data={chartData} margin={{ top: 4, right: 8, bottom: 4, left: 0 }}>
        <XAxis
          dataKey="date"
          tick={{ fill: '#9ca3af', fontSize: 11 }}
          axisLine={false}
          tickLine={false}
          interval="preserveStartEnd"
        />
        <YAxis
          tick={{ fill: '#9ca3af', fontSize: 11 }}
          axisLine={false}
          tickLine={false}
          tickFormatter={formatCurrency}
          width={70}
        />
        <Tooltip
          contentStyle={{ background: '#ffffff', border: '1px solid #e5e7eb', borderRadius: 8, boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}
          labelStyle={{ color: '#6b7280', fontSize: 11 }}
          itemStyle={{ color: '#111827', fontSize: 12 }}
          formatter={(v) => [formatCurrency(Number(v)), 'P&L']}
        />
        <ReferenceLine y={0} stroke="#e5e7eb" strokeDasharray="3 3" />
        <Line
          type="monotone"
          dataKey="cumPnl"
          stroke="#2563eb"
          strokeWidth={2}
          dot={false}
          activeDot={{ r: 4, fill: '#2563eb' }}
        />
      </LineChart>
    </ResponsiveContainer>
  );
}
