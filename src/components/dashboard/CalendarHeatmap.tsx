'use client';

import { useState, useEffect, useCallback } from 'react';
import { createBrowserClient } from '@/lib/supabase/client';

interface Props {
  initialYear: number;
  initialMonth: number; // 0-indexed
  accountId?: string | null;
}

interface DayData {
  pnl: number;
  tradeCount: number;
  wins: number;
  losses: number;
}

type DailyData = Record<string, DayData>;

function getDaysInMonth(year: number, month: number) {
  return new Date(year, month + 1, 0).getDate();
}

function getFirstDayOfMonth(year: number, month: number) {
  return new Date(year, month, 1).getDay();
}

function pnlBg(pnl: number, wins: number, losses: number): string {
  const isWin = wins > 0 && losses === 0;
  const isLoss = losses > 0 && wins === 0;
  const isMixed = wins > 0 && losses > 0;

  if (isWin || (isMixed && pnl > 0)) {
    if (pnl > 1000) return 'bg-emerald-500';
    if (pnl > 300) return 'bg-emerald-400';
    return 'bg-emerald-200';
  }
  if (isLoss || (isMixed && pnl < 0)) {
    if (pnl < -1000) return 'bg-red-500';
    if (pnl < -300) return 'bg-red-400';
    return 'bg-red-200';
  }
  if (pnl === 0 && wins === 0 && losses === 0) return 'bg-gray-100';
  return 'bg-gray-200';
}

function pnlTextColor(pnl: number): string {
  if (pnl > 0) return 'text-emerald-800';
  if (pnl < 0) return 'text-red-800';
  return 'text-gray-500';
}

function fmtPnl(n: number): string {
  const abs = Math.abs(n);
  const sign = n > 0 ? '+' : n < 0 ? '-' : '';
  if (abs >= 10000) return `${sign}$${(abs / 1000).toFixed(0)}k`;
  if (abs >= 1000) return `${sign}$${(abs / 1000).toFixed(1)}k`;
  return `${sign}$${abs.toFixed(0)}`;
}

function fmtWeek(n: number): string {
  const abs = Math.abs(n);
  const sign = n > 0 ? '+' : n < 0 ? '-' : '';
  if (abs >= 1000) return `${sign}$${(abs / 1000).toFixed(1)}k`;
  return `${sign}$${abs.toFixed(0)}`;
}

const MONTH_NAMES = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
];

const DAY_LABELS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

export function CalendarHeatmap({ initialYear, initialMonth, accountId }: Props) {
  const [year, setYear] = useState(initialYear);
  const [month, setMonth] = useState(initialMonth);
  const [dailyData, setDailyData] = useState<DailyData>({});
  const [loading, setLoading] = useState(true);
  const supabase = createBrowserClient();

  const fetchMonth = useCallback(async (y: number, m: number) => {
    setLoading(true);
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) { setLoading(false); return; }

    const start = `${y}-${String(m + 1).padStart(2, '0')}-01`;
    const endDate = new Date(y, m + 1, 1);
    const end = endDate.toISOString().slice(0, 10);

    let query = supabase
      .from('trades')
      .select('exit_datetime, net_pnl, status')
      .eq('user_id', user.id)
      .eq('status', 'closed')
      .not('exit_datetime', 'is', null)
      .gte('exit_datetime', start)
      .lt('exit_datetime', end);

    if (accountId) query = query.eq('account_id', accountId);

    const { data } = await query;
    const result: DailyData = {};

    for (const t of (data ?? [])) {
      if (!t.exit_datetime || t.net_pnl === null) continue;
      const date = t.exit_datetime.slice(0, 10);
      if (!result[date]) result[date] = { pnl: 0, tradeCount: 0, wins: 0, losses: 0 };
      result[date].pnl += t.net_pnl;
      result[date].tradeCount += 1;
      if (t.net_pnl > 0) result[date].wins += 1;
      else if (t.net_pnl < 0) result[date].losses += 1;
    }

    setDailyData(result);
    setLoading(false);
  }, [supabase, accountId]);

  useEffect(() => {
    fetchMonth(year, month);
  }, [year, month, fetchMonth]);

  function prevMonth() {
    if (month === 0) { setYear(y => y - 1); setMonth(11); }
    else setMonth(m => m - 1);
  }

  function nextMonth() {
    if (month === 11) { setYear(y => y + 1); setMonth(0); }
    else setMonth(m => m + 1);
  }

  const daysInMonth = getDaysInMonth(year, month);
  const firstDay = getFirstDayOfMonth(year, month);

  const cells: (number | null)[] = [
    ...Array(firstDay).fill(null),
    ...Array.from({ length: daysInMonth }, (_, i) => i + 1),
  ];
  while (cells.length % 7 !== 0) cells.push(null);

  const weeks: (number | null)[][] = [];
  for (let i = 0; i < cells.length; i += 7) weeks.push(cells.slice(i, i + 7));

  const weeklyTotals = weeks.map((week) =>
    week.reduce<number | null>((sum, day) => {
      if (day === null) return sum;
      const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
      const d = dailyData[dateStr];
      if (!d) return sum;
      return (sum ?? 0) + d.pnl;
    }, null)
  );

  const monthPrefix = `${year}-${String(month + 1).padStart(2, '0')}`;
  const monthTotal = Object.entries(dailyData)
    .filter(([d]) => d.startsWith(monthPrefix))
    .reduce((s, [, v]) => s + v.pnl, 0);

  const today = new Date();

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <button
          onClick={prevMonth}
          className="w-7 h-7 flex items-center justify-center rounded hover:bg-gray-100 text-gray-500 hover:text-gray-900 transition-colors font-bold"
          aria-label="Previous month"
        >
          ‹
        </button>
        <div className="flex items-center gap-2">
          <span className="text-sm font-semibold text-gray-800">
            {MONTH_NAMES[month]} {year}
          </span>
          {loading ? (
            <span className="text-xs text-gray-400">...</span>
          ) : Object.keys(dailyData).length > 0 && (
            <span className={`text-xs font-mono font-semibold px-1.5 py-0.5 rounded ${monthTotal >= 0 ? 'text-emerald-700 bg-emerald-50' : 'text-red-700 bg-red-50'}`}>
              {fmtPnl(monthTotal)}
            </span>
          )}
        </div>
        <button
          onClick={nextMonth}
          className="w-7 h-7 flex items-center justify-center rounded hover:bg-gray-100 text-gray-500 hover:text-gray-900 transition-colors font-bold"
          aria-label="Next month"
        >
          ›
        </button>
      </div>

      {/* Day labels row */}
      <div className="grid gap-1 mb-1" style={{ gridTemplateColumns: 'repeat(7, 1fr) 52px' }}>
        {DAY_LABELS.map((d) => (
          <div key={d} className="text-center text-[10px] text-gray-400 font-medium py-1">
            {d}
          </div>
        ))}
        <div className="text-center text-[10px] text-gray-400 font-medium py-1">Week</div>
      </div>

      {/* Weeks */}
      {weeks.map((week, wi) => (
        <div key={wi} className="grid gap-1 mb-1" style={{ gridTemplateColumns: 'repeat(7, 1fr) 52px' }}>
          {week.map((day, di) => {
            if (day === null) return <div key={di} className="rounded bg-transparent" style={{ minHeight: 64 }} />;

            const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
            const d = dailyData[dateStr];
            const bg = d ? pnlBg(d.pnl, d.wins, d.losses) : 'bg-gray-50 border border-gray-100';
            const isToday =
              today.getFullYear() === year && today.getMonth() === month && today.getDate() === day;

            return (
              <div
                key={di}
                title={d ? `${dateStr}: ${fmtPnl(d.pnl)} (${d.tradeCount} trade${d.tradeCount !== 1 ? 's' : ''}, ${d.wins}W/${d.losses}L)` : dateStr}
                className={`rounded-lg flex flex-col items-center justify-between px-1 py-1.5 cursor-default ${bg} ${isToday ? 'ring-2 ring-blue-400 ring-offset-1' : ''}`}
                style={{ minHeight: 64 }}
              >
                {/* Day number */}
                <span className={`text-[10px] font-semibold leading-none self-start ml-0.5 ${d ? (d.pnl >= 0 ? 'text-emerald-900' : 'text-red-900') : 'text-gray-400'}`}>
                  {day}
                </span>

                {/* P&L */}
                {d ? (
                  <>
                    <span className={`text-[11px] font-bold font-mono leading-none ${pnlTextColor(d.pnl)}`}>
                      {fmtPnl(d.pnl)}
                    </span>
                    {/* Trade count + W/L */}
                    <span className="text-[9px] leading-none text-center" style={{ color: d.pnl >= 0 ? '#065f46' : '#991b1b', opacity: 0.75 }}>
                      {d.tradeCount}t · {d.wins}W{d.losses > 0 ? `/${d.losses}L` : ''}
                    </span>
                  </>
                ) : (
                  <span />
                )}
              </div>
            );
          })}

          {/* Weekly total */}
          <div
            className={`rounded-lg flex flex-col items-center justify-center gap-0.5 ${
              weeklyTotals[wi] === null
                ? 'bg-gray-50'
                : weeklyTotals[wi]! > 0
                ? 'bg-emerald-50 border border-emerald-200'
                : weeklyTotals[wi]! < 0
                ? 'bg-red-50 border border-red-200'
                : 'bg-gray-50'
            }`}
            style={{ minHeight: 64 }}
            title={weeklyTotals[wi] !== null ? `Week total: ${fmtWeek(weeklyTotals[wi]!)}` : ''}
          >
            {weeklyTotals[wi] !== null && (
              <span className={`text-[10px] font-bold font-mono ${weeklyTotals[wi]! > 0 ? 'text-emerald-700' : weeklyTotals[wi]! < 0 ? 'text-red-700' : 'text-gray-500'}`}>
                {fmtWeek(weeklyTotals[wi]!)}
              </span>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}
