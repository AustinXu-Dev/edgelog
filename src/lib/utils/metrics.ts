import type { Trade, DashboardMetrics, EquityPoint, PnLByHourRow } from '../types';

export function calcMetrics(trades: Trade[]): DashboardMetrics {
  const closed = trades.filter((t) => t.status === 'closed' && t.net_pnl !== null);

  if (closed.length === 0) {
    return {
      totalNetPnl: 0,
      winRate: 0,
      profitFactor: 0,
      avgRMultiple: 0,
      tradeCount: 0,
      winCount: 0,
      lossCount: 0,
    };
  }

  const wins = closed.filter((t) => (t.net_pnl ?? 0) > 0);
  const losses = closed.filter((t) => (t.net_pnl ?? 0) < 0);

  const totalNetPnl = closed.reduce((sum, t) => sum + (t.net_pnl ?? 0), 0);
  const grossProfit = wins.reduce((sum, t) => sum + (t.net_pnl ?? 0), 0);
  const grossLoss = Math.abs(losses.reduce((sum, t) => sum + (t.net_pnl ?? 0), 0));

  const profitFactor = grossLoss === 0 ? (grossProfit > 0 ? Infinity : 0) : grossProfit / grossLoss;

  const rValues = closed.filter((t) => t.r_multiple !== null).map((t) => t.r_multiple!);
  const avgRMultiple = rValues.length > 0 ? rValues.reduce((a, b) => a + b, 0) / rValues.length : 0;

  return {
    totalNetPnl,
    winRate: closed.length > 0 ? (wins.length / closed.length) * 100 : 0,
    profitFactor,
    avgRMultiple,
    tradeCount: closed.length,
    winCount: wins.length,
    lossCount: losses.length,
  };
}

export function buildEquityCurve(trades: Trade[]): EquityPoint[] {
  const closed = trades
    .filter((t) => t.status === 'closed' && t.net_pnl !== null && t.exit_datetime)
    .sort((a, b) => new Date(a.exit_datetime!).getTime() - new Date(b.exit_datetime!).getTime());

  let cumPnl = 0;
  return closed.map((t) => {
    cumPnl += t.net_pnl ?? 0;
    return {
      date: t.exit_datetime!.slice(0, 10),
      cumPnl: Math.round(cumPnl * 100) / 100,
      pnl: t.net_pnl ?? 0,
    };
  });
}

export function buildPnlByDow(trades: Trade[]): { dow: number; label: string; total_pnl: number }[] {
  const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  const map: Record<number, number> = {};

  trades
    .filter((t) => t.status === 'closed' && t.net_pnl !== null && t.entry_datetime)
    .forEach((t) => {
      const dow = new Date(t.entry_datetime).getDay();
      map[dow] = (map[dow] ?? 0) + (t.net_pnl ?? 0);
    });

  return [1, 2, 3, 4, 5].map((dow) => ({
    dow,
    label: days[dow],
    total_pnl: Math.round((map[dow] ?? 0) * 100) / 100,
  }));
}

export function buildPnlByHour(trades: Trade[]): PnLByHourRow[] {
  const map: Record<number, number> = {};

  trades
    .filter((t) => t.status === 'closed' && t.net_pnl !== null && t.entry_datetime)
    .forEach((t) => {
      const hour = new Date(t.entry_datetime).getHours();
      map[hour] = (map[hour] ?? 0) + (t.net_pnl ?? 0);
    });

  return Object.entries(map)
    .map(([hour, total_pnl]) => ({ hour: Number(hour), total_pnl: Math.round(total_pnl * 100) / 100 }))
    .sort((a, b) => a.hour - b.hour);
}

export function buildDailyPnl(trades: Trade[]): Record<string, number> {
  const map: Record<string, number> = {};

  trades
    .filter((t) => t.status === 'closed' && t.net_pnl !== null && t.exit_datetime)
    .forEach((t) => {
      const date = t.exit_datetime!.slice(0, 10);
      map[date] = (map[date] ?? 0) + (t.net_pnl ?? 0);
    });

  return map;
}

export function calcPnlByInstrument(trades: Trade[]): { instrument: string; total_pnl: number; trade_count: number }[] {
  const map: Record<string, { total_pnl: number; trade_count: number }> = {};

  trades
    .filter((t) => t.status === 'closed' && t.net_pnl !== null)
    .forEach((t) => {
      if (!map[t.instrument]) map[t.instrument] = { total_pnl: 0, trade_count: 0 };
      map[t.instrument].total_pnl += t.net_pnl ?? 0;
      map[t.instrument].trade_count += 1;
    });

  return Object.entries(map).map(([instrument, data]) => ({
    instrument,
    total_pnl: Math.round(data.total_pnl * 100) / 100,
    trade_count: data.trade_count,
  }));
}
