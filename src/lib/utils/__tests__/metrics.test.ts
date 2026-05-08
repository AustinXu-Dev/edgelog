import { describe, it, expect } from 'vitest';
import { calcMetrics, buildEquityCurve, buildPnlByDow, buildPnlByHour, buildDailyPnl, calcPnlByInstrument } from '../metrics';
import type { Trade } from '@/lib/types/index';

function makeTrade(overrides: Partial<Trade> = {}): Trade {
  return {
    id: '1',
    user_id: 'u1',
    account_id: null,
    instrument: 'NQ',
    instrument_type: 'futures',
    direction: 'long',
    entry_price: 100,
    exit_price: 110,
    position_size: 1,
    entry_datetime: '2024-01-15T09:30:00.000Z',
    exit_datetime: '2024-01-15T10:00:00.000Z',
    stop_loss_planned: null,
    take_profit_planned: null,
    commission: 0,
    gross_pnl: 200,
    net_pnl: 200,
    r_multiple: 2,
    status: 'closed',
    created_at: '2024-01-15T09:30:00.000Z',
    ...overrides,
  };
}

describe('calcMetrics', () => {
  it('returns zeros for empty array', () => {
    const m = calcMetrics([]);
    expect(m.tradeCount).toBe(0);
    expect(m.totalNetPnl).toBe(0);
    expect(m.winRate).toBe(0);
  });

  it('filters out open trades', () => {
    const trades = [makeTrade({ status: 'open', net_pnl: 500 })];
    expect(calcMetrics(trades).tradeCount).toBe(0);
  });

  it('filters out trades with null net_pnl', () => {
    const trades = [makeTrade({ net_pnl: null })];
    expect(calcMetrics(trades).tradeCount).toBe(0);
  });

  it('calculates win rate correctly', () => {
    const trades = [
      makeTrade({ id: '1', net_pnl: 200 }),
      makeTrade({ id: '2', net_pnl: -100 }),
      makeTrade({ id: '3', net_pnl: 50 }),
    ];
    const m = calcMetrics(trades);
    expect(m.tradeCount).toBe(3);
    expect(m.winCount).toBe(2);
    expect(m.lossCount).toBe(1);
    expect(m.winRate).toBeCloseTo(66.67, 1);
  });

  it('calculates totalNetPnl correctly', () => {
    const trades = [
      makeTrade({ id: '1', net_pnl: 300 }),
      makeTrade({ id: '2', net_pnl: -100 }),
    ];
    expect(calcMetrics(trades).totalNetPnl).toBe(200);
  });

  it('calculates profit factor correctly', () => {
    const trades = [
      makeTrade({ id: '1', net_pnl: 300 }),
      makeTrade({ id: '2', net_pnl: -100 }),
    ];
    // 300 / 100 = 3
    expect(calcMetrics(trades).profitFactor).toBe(3);
  });

  it('returns Infinity profit factor when no losses', () => {
    const trades = [makeTrade({ net_pnl: 200 })];
    expect(calcMetrics(trades).profitFactor).toBe(Infinity);
  });

  it('calculates avgRMultiple correctly', () => {
    const trades = [
      makeTrade({ id: '1', r_multiple: 2 }),
      makeTrade({ id: '2', r_multiple: -1 }),
    ];
    expect(calcMetrics(trades).avgRMultiple).toBe(0.5);
  });

  it('excludes null r_multiples from average', () => {
    const trades = [
      makeTrade({ id: '1', r_multiple: 4 }),
      makeTrade({ id: '2', r_multiple: null }),
    ];
    expect(calcMetrics(trades).avgRMultiple).toBe(4);
  });
});

describe('buildEquityCurve', () => {
  it('returns empty array for no closed trades', () => {
    expect(buildEquityCurve([])).toEqual([]);
  });

  it('starts from initialBalance', () => {
    const trades = [makeTrade({ net_pnl: 200 })];
    const curve = buildEquityCurve(trades, 10000);
    expect(curve[0].cumPnl).toBe(10200);
  });

  it('accumulates P&L in exit_datetime order', () => {
    const trades = [
      makeTrade({ id: '1', net_pnl: 100, exit_datetime: '2024-01-15T10:00:00.000Z' }),
      makeTrade({ id: '2', net_pnl: 200, exit_datetime: '2024-01-14T10:00:00.000Z' }),
    ];
    const curve = buildEquityCurve(trades);
    expect(curve[0].cumPnl).toBe(200);
    expect(curve[1].cumPnl).toBe(300);
  });

  it('excludes open trades', () => {
    const trades = [
      makeTrade({ id: '1', net_pnl: 200 }),
      makeTrade({ id: '2', status: 'open', net_pnl: 999 }),
    ];
    expect(buildEquityCurve(trades)).toHaveLength(1);
  });

  it('excludes trades with null exit_datetime', () => {
    const trades = [
      makeTrade({ id: '1', net_pnl: 200 }),
      makeTrade({ id: '2', exit_datetime: null }),
    ];
    expect(buildEquityCurve(trades)).toHaveLength(1);
  });
});

describe('buildPnlByDow', () => {
  it('always returns Mon-Fri (5 entries)', () => {
    const result = buildPnlByDow([]);
    expect(result).toHaveLength(5);
    expect(result.map((r) => r.label)).toEqual(['Mon', 'Tue', 'Wed', 'Thu', 'Fri']);
  });

  it('aggregates P&L by day of week', () => {
    // Use local-time strings (no Z) so getDay() is predictable regardless of host timezone
    // 2024-01-15 is a Monday in local time
    const trades = [
      makeTrade({ id: '1', net_pnl: 300, entry_datetime: '2024-01-15T09:30:00' }),
      makeTrade({ id: '2', net_pnl: 200, entry_datetime: '2024-01-15T14:00:00' }),
    ];
    const result = buildPnlByDow(trades);
    const mon = result.find((r) => r.label === 'Mon');
    expect(mon?.total_pnl).toBe(500);
  });

  it('excludes open/null trades', () => {
    const trades = [
      makeTrade({ id: '1', status: 'open', net_pnl: 999 }),
      makeTrade({ id: '2', net_pnl: null }),
    ];
    const result = buildPnlByDow(trades);
    expect(result.every((r) => r.total_pnl === 0)).toBe(true);
  });
});

describe('buildPnlByHour', () => {
  it('groups trades by hour', () => {
    // Use local-time strings (no Z) so getHours() is predictable regardless of host timezone
    const trades = [
      makeTrade({ id: '1', net_pnl: 100, entry_datetime: '2024-01-15T09:30:00' }),
      makeTrade({ id: '2', net_pnl: 150, entry_datetime: '2024-01-15T09:45:00' }),
      makeTrade({ id: '3', net_pnl: 200, entry_datetime: '2024-01-15T14:00:00' }),
    ];
    const result = buildPnlByHour(trades);
    const hour9 = result.find((r) => r.hour === 9);
    const hour14 = result.find((r) => r.hour === 14);
    expect(hour9?.total_pnl).toBe(250);
    expect(hour14?.total_pnl).toBe(200);
  });

  it('returns results sorted by hour', () => {
    const trades = [
      makeTrade({ id: '1', net_pnl: 100, entry_datetime: '2024-01-15T14:00:00' }),
      makeTrade({ id: '2', net_pnl: 100, entry_datetime: '2024-01-15T09:00:00' }),
    ];
    const result = buildPnlByHour(trades);
    expect(result[0].hour).toBeLessThan(result[1].hour);
  });
});

describe('buildDailyPnl', () => {
  it('groups P&L by exit date', () => {
    const trades = [
      makeTrade({ id: '1', net_pnl: 200, exit_datetime: '2024-01-15T10:00:00.000Z' }),
      makeTrade({ id: '2', net_pnl: 150, exit_datetime: '2024-01-15T14:00:00.000Z' }),
      makeTrade({ id: '3', net_pnl: 100, exit_datetime: '2024-01-16T10:00:00.000Z' }),
    ];
    const result = buildDailyPnl(trades);
    expect(result['2024-01-15']).toBe(350);
    expect(result['2024-01-16']).toBe(100);
  });
});

describe('calcPnlByInstrument', () => {
  it('aggregates P&L by instrument', () => {
    const trades = [
      makeTrade({ id: '1', instrument: 'NQ', net_pnl: 400 }),
      makeTrade({ id: '2', instrument: 'NQ', net_pnl: 200 }),
      makeTrade({ id: '3', instrument: 'ES', net_pnl: -100 }),
    ];
    const result = calcPnlByInstrument(trades);
    const nq = result.find((r) => r.instrument === 'NQ');
    const es = result.find((r) => r.instrument === 'ES');
    expect(nq?.total_pnl).toBe(600);
    expect(nq?.trade_count).toBe(2);
    expect(es?.total_pnl).toBe(-100);
  });

  it('excludes open trades', () => {
    const trades = [makeTrade({ status: 'open', net_pnl: 999 })];
    expect(calcPnlByInstrument(trades)).toHaveLength(0);
  });
});
