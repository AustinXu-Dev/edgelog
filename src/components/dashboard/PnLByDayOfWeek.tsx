'use client';

import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';

interface Props {
  data: { dow: number; label: string; total_pnl: number }[];
}

export function PnLByDayOfWeek({ data }: Props) {
  return (
    <ResponsiveContainer width="100%" height={180}>
      <BarChart data={data} margin={{ top: 4, right: 8, bottom: 4, left: 0 }}>
        <XAxis dataKey="label" tick={{ fill: '#9ca3af', fontSize: 11 }} axisLine={false} tickLine={false} />
        <YAxis tick={{ fill: '#9ca3af', fontSize: 11 }} axisLine={false} tickLine={false} width={60}
          tickFormatter={(v) => `$${v}`} />
        <Tooltip
          contentStyle={{ background: '#ffffff', border: '1px solid #e5e7eb', borderRadius: 8, boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}
          labelStyle={{ color: '#6b7280', fontSize: 11 }}
          formatter={(v) => [`$${Number(v).toFixed(2)}`, 'P&L']}
        />
        <Bar dataKey="total_pnl" radius={[4, 4, 0, 0]}>
          {data.map((entry, i) => (
            <Cell key={i} fill={entry.total_pnl >= 0 ? '#059669' : '#dc2626'} />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
}
