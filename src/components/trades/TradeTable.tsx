import Link from 'next/link';
import type { Trade } from '@/lib/types';
import { formatCurrency, formatDate, pnlColor } from '@/lib/utils/formatters';

interface Props {
  trades: Trade[];
}

export function TradeTable({ trades }: Props) {
  if (trades.length === 0) {
    return (
      <div className="text-center py-16 text-gray-600">
        <p className="text-lg">No trades yet</p>
        <p className="text-sm mt-1">
          <Link href="/trades/new" className="text-indigo-400 hover:underline">
            Log your first trade
          </Link>
        </p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-gray-800">
            {['Date', 'Instrument', 'Type', 'Dir', 'Size', 'Entry', 'Exit', 'Commission', 'Gross P&L', 'Net P&L', 'R', 'Status'].map(
              (h) => (
                <th key={h} className="text-left py-3 px-3 text-xs text-gray-500 font-medium whitespace-nowrap">
                  {h}
                </th>
              )
            )}
          </tr>
        </thead>
        <tbody>
          {trades.map((t) => (
            <tr key={t.id} className="border-b border-gray-800/50 hover:bg-gray-800/30 transition-colors">
              <td className="py-3 px-3 text-gray-400 whitespace-nowrap">{formatDate(t.entry_datetime)}</td>
              <td className="py-3 px-3">
                <Link
                  href={`/trades/${t.id}`}
                  className="text-gray-100 font-medium hover:text-indigo-400 transition-colors"
                >
                  {t.instrument}
                </Link>
              </td>
              <td className="py-3 px-3 text-gray-500 capitalize">{t.instrument_type}</td>
              <td className="py-3 px-3">
                <span className={t.direction === 'long' ? 'text-emerald-400' : 'text-red-400'}>
                  {t.direction === 'long' ? 'Long' : 'Short'}
                </span>
              </td>
              <td className="py-3 px-3 text-gray-300">{t.position_size}</td>
              <td className="py-3 px-3 text-gray-300">{t.entry_price.toFixed(2)}</td>
              <td className="py-3 px-3 text-gray-300">{t.exit_price?.toFixed(2) ?? '—'}</td>
              <td className="py-3 px-3 text-gray-400">{t.commission > 0 ? formatCurrency(t.commission) : '—'}</td>
              <td className={`py-3 px-3 font-medium ${pnlColor(t.gross_pnl)}`}>
                {t.gross_pnl !== null ? formatCurrency(t.gross_pnl) : '—'}
              </td>
              <td className={`py-3 px-3 font-medium ${pnlColor(t.net_pnl)}`}>
                {t.net_pnl !== null ? formatCurrency(t.net_pnl) : '—'}
              </td>
              <td className="py-3 px-3 text-gray-400">
                {t.r_multiple !== null ? `${t.r_multiple > 0 ? '+' : ''}${t.r_multiple.toFixed(2)}R` : '—'}
              </td>
              <td className="py-3 px-3">
                <span
                  className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                    t.status === 'closed' ? 'bg-gray-700 text-gray-300' : 'bg-emerald-900 text-emerald-300'
                  }`}
                >
                  {t.status}
                </span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
