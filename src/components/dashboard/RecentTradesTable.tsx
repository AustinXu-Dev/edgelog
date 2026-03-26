import Link from 'next/link';
import type { Trade } from '@/lib/types';
import { formatCurrency, formatDate, pnlColor } from '@/lib/utils/formatters';

interface Props {
  trades: Trade[];
}

export function RecentTradesTable({ trades }: Props) {
  if (trades.length === 0) {
    return <p className="text-sm text-gray-600 py-4 text-center">No trades yet</p>;
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-gray-800">
            {['Date', 'Instrument', 'Dir', 'Size', 'Entry', 'Exit', 'Net P&L', 'R'].map((h) => (
              <th key={h} className="text-left py-2 px-2 text-xs text-gray-500 font-medium">
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {trades.map((t) => (
            <tr key={t.id} className="border-b border-gray-800/50 hover:bg-gray-800/30 transition-colors">
              <td className="py-2 px-2 text-gray-400">{formatDate(t.entry_datetime)}</td>
              <td className="py-2 px-2 text-gray-100 font-medium">
                <Link href={`/trades/${t.id}`} className="hover:text-indigo-400 transition-colors">
                  {t.instrument}
                </Link>
              </td>
              <td className="py-2 px-2">
                <span className={t.direction === 'long' ? 'text-emerald-400' : 'text-red-400'}>
                  {t.direction === 'long' ? 'L' : 'S'}
                </span>
              </td>
              <td className="py-2 px-2 text-gray-300">{t.position_size}</td>
              <td className="py-2 px-2 text-gray-300">{t.entry_price.toFixed(2)}</td>
              <td className="py-2 px-2 text-gray-300">{t.exit_price?.toFixed(2) ?? '—'}</td>
              <td className={`py-2 px-2 font-medium ${pnlColor(t.net_pnl)}`}>
                {t.net_pnl !== null ? formatCurrency(t.net_pnl) : '—'}
              </td>
              <td className="py-2 px-2 text-gray-400">
                {t.r_multiple !== null ? `${t.r_multiple > 0 ? '+' : ''}${t.r_multiple.toFixed(2)}R` : '—'}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
