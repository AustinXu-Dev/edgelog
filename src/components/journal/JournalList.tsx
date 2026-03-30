'use client';

import Link from 'next/link';
import { useState, useEffect } from 'react';
import { formatCurrency, pnlColor } from '@/lib/utils/formatters';
import type { DailyJournalWithTrades } from '@/lib/types';

type ViewMode = 'card' | 'list';

const MOOD_LABELS: Record<string, string> = {
  focused: '🎯 Focused',
  neutral: '😐 Neutral',
  anxious: '😰 Anxious',
  impulsive: '⚡ Impulsive',
};

const MOOD_COLORS: Record<string, string> = {
  focused: 'bg-blue-50 text-blue-700 border-blue-200',
  neutral: 'bg-gray-50 text-gray-600 border-gray-200',
  anxious: 'bg-amber-50 text-amber-700 border-amber-200',
  impulsive: 'bg-red-50 text-red-700 border-red-200',
};

interface Item {
  date: string;
  daily?: DailyJournalWithTrades;
  tradeCount?: number;
}

interface Props {
  items: Item[];
}

function LinkedTrades({ trades }: { trades: DailyJournalWithTrades['linkedTrades'] }) {
  if (!trades.length) return null;
  return (
    <div className="flex flex-wrap gap-1.5 mt-2">
      {trades.map((trade) => (
        <span
          key={trade.id}
          className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-gray-50 border border-gray-200 text-xs"
        >
          <span className={trade.direction === 'long' ? 'text-emerald-600' : 'text-red-600'}>
            <i className={`lni ${trade.direction === 'long' ? 'lni-arrow-upward' : 'lni-arrow-downward'} text-[10px]`} />
          </span>
          <span className="text-gray-600">{trade.instrument}</span>
          {trade.net_pnl !== null && (
            <span className={`font-mono font-medium ${pnlColor(trade.net_pnl)}`}>
              {trade.net_pnl > 0 ? '+' : ''}{formatCurrency(trade.net_pnl, 0)}
            </span>
          )}
        </span>
      ))}
    </div>
  );
}

export function JournalList({ items }: Props) {
  const [view, setView] = useState<ViewMode>('card');

  useEffect(() => {
    try {
      const saved = localStorage.getItem('journal_view');
      if (saved === 'list' || saved === 'card') setView(saved as ViewMode);
    } catch { /* ignore */ }
  }, []);

  function switchView(v: ViewMode) {
    setView(v);
    try { localStorage.setItem('journal_view', v); } catch { /* ignore */ }
  }

  return (
    <div>
      {/* Toolbar */}
      <div className="flex items-center justify-between mb-4">
        <p className="text-sm text-gray-400">{items.length} {items.length === 1 ? 'entry' : 'entries'}</p>
        <div className="flex items-center gap-0.5 bg-gray-100 rounded-lg p-0.5">
          <button
            onClick={() => switchView('card')}
            title="Card view"
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${
              view === 'card' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            <i className="lni lni-grid-alt" />
            <span className="hidden sm:inline">Card</span>
          </button>
          <button
            onClick={() => switchView('list')}
            title="List view"
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${
              view === 'list' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            <i className="lni lni-list" />
            <span className="hidden sm:inline">List</span>
          </button>
        </div>
      </div>

      {/* Card view */}
      {view === 'card' && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {items.map(({ date, daily, tradeCount }) => (
            <Link
              key={date}
              href={`/journal/${date}`}
              className="block bg-white border border-gray-200 rounded-xl p-5 hover:border-gray-300 hover:shadow-md transition-all"
            >
              {/* Date + mood row */}
              <div className="flex items-start justify-between gap-2 mb-3">
                <div>
                  <p className="text-xs text-gray-400 font-medium mb-0.5">
                    {new Date(date + 'T00:00:00').toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' })}
                  </p>
                </div>
                <div className="flex items-center gap-1.5 shrink-0">
                  {daily?.mood && (
                    <span className={`text-[11px] font-medium px-2 py-0.5 rounded-full border ${MOOD_COLORS[daily.mood] ?? 'bg-gray-50 text-gray-600 border-gray-200'}`}>
                      {MOOD_LABELS[daily.mood] ?? daily.mood}
                    </span>
                  )}
                  {tradeCount && (
                    <span className="text-[11px] text-blue-600 bg-blue-50 border border-blue-200 px-2 py-0.5 rounded-full font-medium">
                      {tradeCount}T
                    </span>
                  )}
                </div>
              </div>

              {/* Content */}
              {daily?.content ? (
                <p className="text-sm text-gray-600 line-clamp-3 leading-relaxed">{daily.content}</p>
              ) : (
                <p className="text-sm text-gray-300 italic">No daily note</p>
              )}

              {/* Linked trades */}
              {daily?.linkedTrades && <LinkedTrades trades={daily.linkedTrades} />}
            </Link>
          ))}
        </div>
      )}

      {/* List view */}
      {view === 'list' && (
        <div className="space-y-2">
          {items.map(({ date, daily, tradeCount }) => (
            <Link
              key={date}
              href={`/journal/${date}`}
              className="flex items-center gap-3 bg-white border border-gray-200 rounded-xl px-4 py-3 hover:border-gray-300 hover:shadow-sm transition-all"
            >
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-0.5">
                  <span className="text-sm font-semibold text-gray-900">{date}</span>
                  {daily?.mood && (
                    <span className="text-xs text-gray-500">{MOOD_LABELS[daily.mood] ?? daily.mood}</span>
                  )}
                  {tradeCount && (
                    <span className="text-xs text-blue-600 bg-blue-50 border border-blue-200 px-2 py-0.5 rounded-full">
                      {tradeCount} note{tradeCount !== 1 ? 's' : ''}
                    </span>
                  )}
                </div>
                {daily?.content && (
                  <p className="text-xs text-gray-400 truncate">{daily.content}</p>
                )}
              </div>
              <i className="lni lni-chevron-right text-gray-300 shrink-0" />
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
