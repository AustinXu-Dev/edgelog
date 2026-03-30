import Link from 'next/link';
import type { Trade } from '@/lib/types';
import { formatCurrency, formatDate, pnlColor } from '@/lib/utils/formatters';

interface Props {
  trades: Trade[];
}

export function RecentTradesTable({ trades }: Props) {
  if (trades.length === 0) {
    return <p className="text-sm text-gray-400 py-4 text-center">No trades yet</p>;
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-gray-200 bg-gray-50">
            {['Date', 'Instrument', 'Dir', 'Size', 'Entry', 'Exit', 'Net P&L', 'R'].map((h) => (
              <th key={h} className="text-left py-2 px-2 text-[11px] text-gray-500 font-semibold uppercase tracking-wide">
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-100">
          {trades.map((t) => (
            <tr key={t.id} className="hover:bg-gray-50 transition-colors">
              <td className="py-2 px-2 text-gray-500 text-xs">{formatDate(t.entry_datetime)}</td>
              <td className="py-2 px-2 text-gray-900 font-medium">
                <Link href={`/trades/${t.id}`} className="hover:text-blue-600 transition-colors">
                  {t.instrument}
                </Link>
              </td>
              <td className="py-2 px-2">
                <span className={t.direction === 'long' ? 'text-emerald-600' : 'text-red-600'}>
                  <i className={`lni ${t.direction === 'long' ? 'lni-arrow-upward' : 'lni-arrow-downward'} text-xs`} />
                </span>
              </td>
              <td className="py-2 px-2 text-gray-700 font-mono">{t.position_size}</td>
              <td className="py-2 px-2 text-gray-700 font-mono">{t.entry_price.toFixed(2)}</td>
              <td className="py-2 px-2 text-gray-700 font-mono">{t.exit_price?.toFixed(2) ?? '—'}</td>
              <td className={`py-2 px-2 font-medium font-mono ${pnlColor(t.net_pnl)}`}>
                {t.net_pnl !== null ? formatCurrency(t.net_pnl) : '—'}
              </td>
              <td className="py-2 px-2 text-gray-500 font-mono">
                {t.r_multiple !== null ? `${t.r_multiple > 0 ? '+' : ''}${t.r_multiple.toFixed(2)}R` : '—'}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
