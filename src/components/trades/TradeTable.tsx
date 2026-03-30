'use client';

import { useRouter } from 'next/navigation';
import type { Trade } from '@/lib/types';
import { formatCurrency, formatDate, pnlColor } from '@/lib/utils/formatters';

interface Props {
  trades: Trade[];
}

export function TradeTable({ trades }: Props) {
  const router = useRouter();

  if (trades.length === 0) {
    return (
      <div className="text-center py-16 text-gray-400">
        <p className="text-lg">No trades yet</p>
        <p className="text-sm mt-1">
          <span
            className="text-blue-600 hover:underline cursor-pointer"
            onClick={() => router.push('/trades/new')}
          >
            Log your first trade
          </span>
        </p>
      </div>
    );
  }

  return (
    <>
      {/* Mobile: card layout */}
      <div className="md:hidden space-y-2">
        {trades.map((t) => (
          <div
            key={t.id}
            onClick={() => router.push(`/trades/${t.id}`)}
            className="bg-white border border-gray-200 rounded-xl p-4 cursor-pointer hover:border-gray-300 hover:shadow-sm transition-all active:bg-gray-50"
          >
            <div className="flex items-start justify-between gap-2 mb-2">
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-semibold text-gray-900">{t.instrument}</span>
                  <span className={`flex items-center gap-0.5 text-sm font-medium ${t.direction === 'long' ? 'text-emerald-600' : 'text-red-600'}`}>
                    <i className={`lni ${t.direction === 'long' ? 'lni-arrow-upward' : 'lni-arrow-downward'} text-xs`} />
                    {t.direction === 'long' ? 'Long' : 'Short'}
                  </span>
                  <span
                    className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                      t.status === 'closed' ? 'bg-gray-100 text-gray-600' : 'bg-emerald-50 text-emerald-700'
                    }`}
                  >
                    {t.status}
                  </span>
                </div>
                <p className="text-xs text-gray-400 mt-0.5">{formatDate(t.entry_datetime)}</p>
              </div>
              <div className="text-right shrink-0">
                <p className={`text-base font-bold font-mono ${pnlColor(t.net_pnl)}`}>
                  {t.net_pnl !== null ? formatCurrency(t.net_pnl) : '—'}
                </p>
                {t.r_multiple !== null && (
                  <p className="text-xs text-gray-400 font-mono">
                    {t.r_multiple > 0 ? '+' : ''}{t.r_multiple.toFixed(2)}R
                  </p>
                )}
              </div>
            </div>
            <div className="flex items-center gap-3 text-xs text-gray-500 font-mono">
              <span>In: {t.entry_price.toFixed(2)}</span>
              {t.exit_price && <span>Out: {t.exit_price.toFixed(2)}</span>}
              <span>Qty: {t.position_size}</span>
            </div>
          </div>
        ))}
      </div>

      {/* Desktop: table layout */}
      <div className="hidden md:block overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gray-200 bg-gray-50">
              {['Date', 'Instrument', 'Type', 'Dir', 'Size', 'Entry', 'Exit', 'Commission', 'Gross P&L', 'Net P&L', 'R', 'Status'].map(
                (h) => (
                  <th key={h} className="text-left py-3 px-3 text-[11px] text-gray-500 font-semibold uppercase tracking-wide whitespace-nowrap">
                    {h}
                  </th>
                )
              )}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {trades.map((t) => (
              <tr
                key={t.id}
                onClick={() => router.push(`/trades/${t.id}`)}
                className="hover:bg-gray-50 transition-colors cursor-pointer"
              >
                <td className="py-3 px-3 text-gray-500 whitespace-nowrap text-xs">{formatDate(t.entry_datetime)}</td>
                <td className="py-3 px-3 text-gray-900 font-medium">{t.instrument}</td>
                <td className="py-3 px-3 text-gray-500 capitalize">{t.instrument_type}</td>
                <td className="py-3 px-3">
                  <span className={`flex items-center gap-1 ${t.direction === 'long' ? 'text-emerald-600' : 'text-red-600'}`}>
                    <i className={`lni ${t.direction === 'long' ? 'lni-arrow-upward' : 'lni-arrow-downward'} text-xs`} />
                    {t.direction === 'long' ? 'Long' : 'Short'}
                  </span>
                </td>
                <td className="py-3 px-3 text-gray-700 font-mono">{t.position_size}</td>
                <td className="py-3 px-3 text-gray-700 font-mono">{t.entry_price.toFixed(2)}</td>
                <td className="py-3 px-3 text-gray-700 font-mono">{t.exit_price?.toFixed(2) ?? '—'}</td>
                <td className="py-3 px-3 text-gray-500 font-mono">{t.commission > 0 ? formatCurrency(t.commission) : '—'}</td>
                <td className={`py-3 px-3 font-medium font-mono ${pnlColor(t.gross_pnl)}`}>
                  {t.gross_pnl !== null ? formatCurrency(t.gross_pnl) : '—'}
                </td>
                <td className={`py-3 px-3 font-medium font-mono ${pnlColor(t.net_pnl)}`}>
                  {t.net_pnl !== null ? formatCurrency(t.net_pnl) : '—'}
                </td>
                <td className="py-3 px-3 text-gray-500 font-mono">
                  {t.r_multiple !== null ? `${t.r_multiple > 0 ? '+' : ''}${t.r_multiple.toFixed(2)}R` : '—'}
                </td>
                <td className="py-3 px-3">
                  <span
                    className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                      t.status === 'closed' ? 'bg-gray-100 text-gray-600' : 'bg-emerald-50 text-emerald-700'
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
    </>
  );
}
