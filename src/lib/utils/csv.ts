import * as Sentry from '@sentry/nextjs';
import type { Instrument, InstrumentType, Direction, TradeStatus } from '../types';

export const POINT_VALUES: Record<string, number> = {
  // CME Equity Futures
  NQ: 20,       // E-mini Nasdaq-100 ($20/pt)
  ES: 50,       // E-mini S&P 500 ($50/pt)
  MNQ: 2,       // Micro E-mini Nasdaq-100 ($2/pt)
  MES: 5,       // Micro E-mini S&P 500 ($5/pt)
  YM: 5,        // E-mini Dow ($5/pt)
  MYM: 0.5,     // Micro E-mini Dow ($0.50/pt)
  RTY: 50,      // E-mini Russell 2000 ($50/pt)
  M2K: 5,       // Micro E-mini Russell 2000 ($5/pt)
  // CME Commodity Futures
  GC: 100,      // Gold — 100 troy oz ($100/pt)
  MGC: 10,      // Micro Gold — 10 troy oz ($10/pt)
  CL: 1000,     // Crude Oil — 1,000 barrels ($1,000/pt)
  MCL: 100,     // Micro Crude Oil — 100 barrels ($100/pt)
  // Index CFDs
  NDX100: 20,   // Nasdaq-100 CFD (mirrors NQ spec)
  SPX500: 50,   // S&P 500 CFD (mirrors ES spec)
  US30: 1,      // Dow Jones CFD ($1/pt)
  GER40: 1,     // DAX 40 CFD (EUR-denominated — P&L approximate in USD)
  // Forex — position_size in standard lots (1 lot = 100,000 base units)
  // USD-quoted pairs (exact)
  EURUSD: 100000,
  GBPUSD: 100000,
  AUDUSD: 100000,
  NZDUSD: 100000,
  // Non-USD-quoted pairs (approximate — varies with exchange rate)
  USDJPY: 700,    // ~100,000 / 143 USD/JPY
  USDCAD: 74000,  // ~100,000 / 1.35 USD/CAD
  // Crypto — position_size in coins, P&L in USD
  BTCUSD: 1,
  ETHUSD: 1,
};

const FUTURES_SET = new Set(['NQ', 'ES', 'MNQ', 'MES', 'YM', 'MYM', 'RTY', 'M2K', 'GC', 'MGC', 'CL', 'MCL']);
const FOREX_SET = new Set(['EURUSD', 'GBPUSD', 'AUDUSD', 'NZDUSD', 'USDJPY', 'USDCAD']);
const CRYPTO_SET = new Set(['BTCUSD', 'ETHUSD']);

export function getInstrumentType(instrument: string): InstrumentType {
  if (FUTURES_SET.has(instrument)) return 'futures';
  if (FOREX_SET.has(instrument)) return 'forex';
  if (CRYPTO_SET.has(instrument)) return 'crypto';
  return 'index';
}

export interface ParsedCsvTrade {
  instrument: Instrument;
  instrument_type: InstrumentType;
  direction: Direction;
  entry_price: number;
  exit_price: number | null;
  position_size: number;
  entry_datetime: string;
  exit_datetime: string | null;
  stop_loss_planned: number | null;
  take_profit_planned: number | null;
  commission: number;
  status: TradeStatus;
  gross_pnl: number | null;
  net_pnl: number | null;
  r_multiple: number | null;
}

export interface CsvParseError {
  row: number;
  message: string;
}

const VALID_INSTRUMENTS = Object.keys(POINT_VALUES);
const VALID_DIRECTIONS = ['long', 'short'];
const VALID_STATUSES = ['open', 'closed'];

function parseNum(v: string | undefined): number | null {
  if (!v || v.trim() === '') return null;
  const n = parseFloat(v.trim());
  return isNaN(n) ? null : n;
}

function parseDate(v: string | undefined): string | null {
  if (!v || v.trim() === '') return null;
  const d = new Date(v.trim());
  if (isNaN(d.getTime())) return null;
  return d.toISOString();
}

export function calcPnl(
  direction: Direction,
  entryPrice: number,
  exitPrice: number,
  positionSize: number,
  commission: number,
  instrument?: string
): { gross_pnl: number; net_pnl: number } {
  const dirMultiplier = direction === 'long' ? 1 : -1;
  const pointValue = instrument ? (POINT_VALUES[instrument] ?? 1) : 1;
  if (instrument && !POINT_VALUES[instrument]) {
    Sentry.captureMessage(`Unknown instrument in calcPnl: ${instrument}`, {
      level: 'warning',
      extra: { instrument, direction, entryPrice, exitPrice, positionSize },
    });
  }
  const gross_pnl = (exitPrice - entryPrice) * positionSize * dirMultiplier * pointValue;
  const net_pnl = gross_pnl - commission;
  return { gross_pnl, net_pnl };
}

export function calcRMultiple(
  direction: Direction,
  entryPrice: number,
  stopLoss: number | null,
  netPnl: number,
  positionSize: number,
  instrument?: string
): number | null {
  if (stopLoss === null) return null;
  const pointValue = instrument ? (POINT_VALUES[instrument] ?? 1) : 1;
  const risk = Math.abs(entryPrice - stopLoss) * positionSize * pointValue;
  if (risk === 0) return null;
  return netPnl / risk;
}

export function validateAndParseCsvRows(
  rows: Record<string, string>[]
): { trades: ParsedCsvTrade[]; errors: CsvParseError[] } {
  const trades: ParsedCsvTrade[] = [];
  const errors: CsvParseError[] = [];

  rows.forEach((row, index) => {
    const rowNum = index + 2; // 1-indexed + header row

    const instrument = row['instrument']?.trim().toUpperCase();
    const direction = row['direction']?.trim().toLowerCase();
    const status = (row['status']?.trim().toLowerCase() || 'closed') as TradeStatus;

    if (!VALID_INSTRUMENTS.includes(instrument)) {
      errors.push({ row: rowNum, message: `Invalid instrument: "${instrument}"` });
      return;
    }
    if (!VALID_DIRECTIONS.includes(direction)) {
      errors.push({ row: rowNum, message: `Invalid direction: "${direction}"` });
      return;
    }

    const entry_price = parseNum(row['entry_price']);
    const position_size = parseNum(row['position_size']);
    const entry_datetime = parseDate(row['entry_datetime']);

    if (entry_price === null) {
      errors.push({ row: rowNum, message: 'Missing or invalid entry_price' });
      return;
    }
    if (position_size === null) {
      errors.push({ row: rowNum, message: 'Missing or invalid position_size' });
      return;
    }
    if (!entry_datetime) {
      errors.push({ row: rowNum, message: 'Missing or invalid entry_datetime' });
      return;
    }

    const exit_price = parseNum(row['exit_price']);
    const exit_datetime = parseDate(row['exit_datetime']);
    const stop_loss_planned = parseNum(row['stop_loss_planned']);
    const take_profit_planned = parseNum(row['take_profit_planned']);
    const commission = parseNum(row['commission']) ?? 0;

    let gross_pnl: number | null = null;
    let net_pnl: number | null = null;
    let r_multiple: number | null = null;

    const resolvedStatus: TradeStatus = VALID_STATUSES.includes(status) ? status : 'closed';

    if (resolvedStatus === 'closed' && exit_price !== null) {
      const pnl = calcPnl(direction as Direction, entry_price, exit_price, position_size, commission, instrument);
      gross_pnl = pnl.gross_pnl;
      net_pnl = pnl.net_pnl;
      r_multiple = calcRMultiple(direction as Direction, entry_price, stop_loss_planned, net_pnl, position_size, instrument);
    }

    const instrument_type: InstrumentType = getInstrumentType(instrument);

    trades.push({
      instrument: instrument as Instrument,
      instrument_type,
      direction: direction as Direction,
      entry_price,
      exit_price,
      position_size,
      entry_datetime,
      exit_datetime,
      stop_loss_planned,
      take_profit_planned,
      commission,
      status: resolvedStatus,
      gross_pnl,
      net_pnl,
      r_multiple,
    });
  });

  return { trades, errors };
}
