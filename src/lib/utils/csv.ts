import type { Instrument, InstrumentType, Direction, TradeStatus } from '../types';

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

const VALID_INSTRUMENTS = ['NDX100', 'SPX500', 'NQ', 'ES'];
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
  commission: number
): { gross_pnl: number; net_pnl: number } {
  const multiplier = direction === 'long' ? 1 : -1;
  const gross_pnl = (exitPrice - entryPrice) * positionSize * multiplier;
  const net_pnl = gross_pnl - commission;
  return { gross_pnl, net_pnl };
}

export function calcRMultiple(
  direction: Direction,
  entryPrice: number,
  stopLoss: number | null,
  netPnl: number,
  positionSize: number
): number | null {
  if (stopLoss === null) return null;
  const risk = Math.abs(entryPrice - stopLoss) * positionSize;
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
      const pnl = calcPnl(direction as Direction, entry_price, exit_price, position_size, commission);
      gross_pnl = pnl.gross_pnl;
      net_pnl = pnl.net_pnl;
      r_multiple = calcRMultiple(direction as Direction, entry_price, stop_loss_planned, net_pnl, position_size);
    }

    const instrument_type: InstrumentType = ['NQ', 'ES'].includes(instrument) ? 'futures' : 'index';

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
