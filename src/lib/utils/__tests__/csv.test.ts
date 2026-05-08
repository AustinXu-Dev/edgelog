import { describe, it, expect, vi } from 'vitest';

// Mock @sentry/nextjs before importing csv.ts (calcPnl calls captureMessage on unknown instruments)
vi.mock('@sentry/nextjs', () => ({
  captureMessage: vi.fn(),
}));

import { calcPnl, calcRMultiple, getInstrumentType, validateAndParseCsvRows } from '../csv';

describe('getInstrumentType', () => {
  it('classifies futures', () => {
    expect(getInstrumentType('NQ')).toBe('futures');
    expect(getInstrumentType('ES')).toBe('futures');
    expect(getInstrumentType('MNQ')).toBe('futures');
    expect(getInstrumentType('GC')).toBe('futures');
    expect(getInstrumentType('CL')).toBe('futures');
  });

  it('classifies forex', () => {
    expect(getInstrumentType('EURUSD')).toBe('forex');
    expect(getInstrumentType('USDJPY')).toBe('forex');
  });

  it('classifies crypto', () => {
    expect(getInstrumentType('BTCUSD')).toBe('crypto');
    expect(getInstrumentType('ETHUSD')).toBe('crypto');
  });

  it('classifies index CFDs as index', () => {
    expect(getInstrumentType('NDX100')).toBe('index');
    expect(getInstrumentType('SPX500')).toBe('index');
    expect(getInstrumentType('XAUUSD')).toBe('index');
  });

  it('falls back to index for unknown instruments', () => {
    expect(getInstrumentType('UNKNOWN')).toBe('index');
  });
});

describe('calcPnl', () => {
  it('calculates long NQ profit correctly', () => {
    // NQ: $20/point. Long, entry 15000, exit 15005, size 1 = 5 pts * $20 = $100 gross
    const { gross_pnl, net_pnl } = calcPnl('long', 15000, 15005, 1, 0, 'NQ');
    expect(gross_pnl).toBe(100);
    expect(net_pnl).toBe(100);
  });

  it('calculates short NQ profit correctly', () => {
    // Short, entry 15000, exit 14995, size 1 = 5 pts * $20 = $100 gross
    const { gross_pnl, net_pnl } = calcPnl('short', 15000, 14995, 1, 0, 'NQ');
    expect(gross_pnl).toBe(100);
    expect(net_pnl).toBe(100);
  });

  it('calculates long NQ loss correctly', () => {
    const { gross_pnl, net_pnl } = calcPnl('long', 15005, 15000, 1, 0, 'NQ');
    expect(gross_pnl).toBe(-100);
    expect(net_pnl).toBe(-100);
  });

  it('deducts commission from net_pnl', () => {
    const { gross_pnl, net_pnl } = calcPnl('long', 15000, 15005, 1, 10, 'NQ');
    expect(gross_pnl).toBe(100);
    expect(net_pnl).toBe(90);
  });

  it('uses ES point value ($50/point)', () => {
    const { gross_pnl } = calcPnl('long', 4500, 4501, 1, 0, 'ES');
    expect(gross_pnl).toBe(50);
  });

  it('uses MNQ point value ($2/point)', () => {
    const { gross_pnl } = calcPnl('long', 15000, 15010, 1, 0, 'MNQ');
    expect(gross_pnl).toBe(20);
  });

  it('defaults to point value of 1 when no instrument provided', () => {
    const { gross_pnl } = calcPnl('long', 100, 110, 1, 0);
    expect(gross_pnl).toBe(10);
  });

  it('handles position_size > 1', () => {
    // 2 contracts of NQ, 5 pt move = 2 * 5 * 20 = $200
    const { gross_pnl } = calcPnl('long', 15000, 15005, 2, 0, 'NQ');
    expect(gross_pnl).toBe(200);
  });
});

describe('calcRMultiple', () => {
  it('returns null when stop_loss is null', () => {
    expect(calcRMultiple('long', 15000, null, 200, 1, 'NQ')).toBeNull();
  });

  it('returns null when risk is zero', () => {
    // Entry == stopLoss means risk = 0
    expect(calcRMultiple('long', 15000, 15000, 200, 1, 'NQ')).toBeNull();
  });

  it('calculates positive R for a winner', () => {
    // Long NQ: entry 15000, stop 14990 → risk = 10 pts * $20 = $200
    // net_pnl = $400 → R = 400/200 = 2R
    const r = calcRMultiple('long', 15000, 14990, 400, 1, 'NQ');
    expect(r).toBe(2);
  });

  it('calculates negative R for a loser', () => {
    // risk = 10 pts * $20 = $200, net_pnl = -$200 → R = -1
    const r = calcRMultiple('long', 15000, 14990, -200, 1, 'NQ');
    expect(r).toBe(-1);
  });

  it('works for short direction', () => {
    // Short: entry 15000, stop 15010 → risk = 10 pts * $20 = $200
    // net_pnl = $400 → R = 2
    const r = calcRMultiple('short', 15000, 15010, 400, 1, 'NQ');
    expect(r).toBe(2);
  });
});

describe('validateAndParseCsvRows', () => {
  const validRow = {
    instrument: 'NQ',
    direction: 'long',
    entry_price: '15000',
    exit_price: '15050',
    position_size: '1',
    entry_datetime: '2024-01-15T09:30:00',
    exit_datetime: '2024-01-15T10:00:00',
    stop_loss_planned: '14990',
    take_profit_planned: '15100',
    commission: '5',
    status: 'closed',
  };

  it('parses a valid row correctly', () => {
    const { trades, errors } = validateAndParseCsvRows([validRow]);
    expect(errors).toHaveLength(0);
    expect(trades).toHaveLength(1);
    expect(trades[0].instrument).toBe('NQ');
    expect(trades[0].direction).toBe('long');
    expect(trades[0].entry_price).toBe(15000);
    expect(trades[0].status).toBe('closed');
  });

  it('uppercases instrument', () => {
    const { trades } = validateAndParseCsvRows([{ ...validRow, instrument: 'nq' }]);
    expect(trades[0].instrument).toBe('NQ');
  });

  it('lowercases direction', () => {
    const { trades } = validateAndParseCsvRows([{ ...validRow, direction: 'LONG' }]);
    expect(trades[0].direction).toBe('long');
  });

  it('calculates P&L for closed trades', () => {
    const { trades } = validateAndParseCsvRows([validRow]);
    // NQ: 50 pts * $20/pt = $1000 gross, minus $5 commission = $995 net
    expect(trades[0].gross_pnl).toBe(1000);
    expect(trades[0].net_pnl).toBe(995);
  });

  it('rejects invalid instrument', () => {
    const { trades, errors } = validateAndParseCsvRows([{ ...validRow, instrument: 'INVALID' }]);
    expect(trades).toHaveLength(0);
    expect(errors[0].message).toMatch(/Invalid instrument/);
  });

  it('rejects invalid direction', () => {
    const { trades, errors } = validateAndParseCsvRows([{ ...validRow, direction: 'up' }]);
    expect(trades).toHaveLength(0);
    expect(errors[0].message).toMatch(/Invalid direction/);
  });

  it('rejects missing entry_price', () => {
    const { errors } = validateAndParseCsvRows([{ ...validRow, entry_price: '' }]);
    expect(errors[0].message).toMatch(/entry_price/);
  });

  it('rejects missing position_size', () => {
    const { errors } = validateAndParseCsvRows([{ ...validRow, position_size: '' }]);
    expect(errors[0].message).toMatch(/position_size/);
  });

  it('rejects missing entry_datetime', () => {
    const { errors } = validateAndParseCsvRows([{ ...validRow, entry_datetime: '' }]);
    expect(errors[0].message).toMatch(/entry_datetime/);
  });

  it('handles open trades with no exit price', () => {
    const row = { ...validRow, status: 'open', exit_price: '', exit_datetime: '' };
    const { trades, errors } = validateAndParseCsvRows([row]);
    expect(errors).toHaveLength(0);
    expect(trades[0].gross_pnl).toBeNull();
    expect(trades[0].net_pnl).toBeNull();
  });

  it('defaults commission to 0 when missing', () => {
    const row = { ...validRow, commission: '' };
    const { trades } = validateAndParseCsvRows([row]);
    expect(trades[0].commission).toBe(0);
  });

  it('defaults status to closed when missing', () => {
    const row = { ...validRow, status: '' };
    const { trades } = validateAndParseCsvRows([row]);
    expect(trades[0].status).toBe('closed');
  });

  it('reports correct row numbers in errors (1-indexed + header)', () => {
    const rows = [validRow, { ...validRow, instrument: 'BAD' }];
    const { errors } = validateAndParseCsvRows(rows);
    expect(errors[0].row).toBe(3); // row 1 = header, row 2 = first data, row 3 = second data
  });

  it('processes multiple valid rows', () => {
    const rows = [validRow, { ...validRow, entry_price: '15100', exit_price: '15000' }];
    const { trades, errors } = validateAndParseCsvRows(rows);
    expect(errors).toHaveLength(0);
    expect(trades).toHaveLength(2);
  });
});
