'use client';

import { useMemo } from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import type { PnLByHourRow } from '@/lib/types';

interface Props {
  data: PnLByHourRow[];
}

function formatHour(h: number) {
  if (h === 0) return '12am';
  if (h < 12) return `${h}am`;
  if (h === 12) return '12pm';
  return `${h - 12}pm`;
}

export function PnLByTimeOfDay({ data }: Props) {
  const formatted = useMemo(() => {
    if (data.length === 0) return [];
    const map = new Map(data.map((d) => [d.hour, d.total_pnl]));
    const minHour = Math.max(0, Math.min(...data.map((d) => d.hour)) - 2);
    const maxHour = Math.min(23, Math.max(...data.map((d) => d.hour)) + 2);
    const result = [];
    for (let h = minHour; h <= maxHour; h++) {
      result.push({ hour: h, total_pnl: map.get(h) ?? 0, label: formatHour(h) });
    }
    return result;
  }, [data]);

  if (formatted.length === 0) {
    return (
      <div className="flex items-center justify-center h-40 text-gray-400 text-sm">
        No data
      </div>
    );
  }

  return (
    <ResponsiveContainer width="100%" height={180}>
      <BarChart data={formatted} margin={{ top: 4, right: 8, bottom: 4, left: 0 }}>
        <XAxis dataKey="label" tick={{ fill: '#9ca3af', fontSize: 11 }} axisLine={false} tickLine={false} />
        <YAxis tick={{ fill: '#9ca3af', fontSize: 11 }} axisLine={false} tickLine={false} width={60}
          tickFormatter={(v) => `$${v}`} />
        <Tooltip
          contentStyle={{ background: '#ffffff', border: '1px solid #e5e7eb', borderRadius: 8, boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}
          labelStyle={{ color: '#6b7280', fontSize: 11 }}
          formatter={(v) => [`$${Number(v).toFixed(2)}`, 'P&L']}
        />
        <Bar dataKey="total_pnl" radius={[4, 4, 0, 0]} maxBarSize={40}>
          {formatted.map((entry, i) => (
            <Cell key={i} fill={entry.total_pnl >= 0 ? '#059669' : '#dc2626'} />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
}
