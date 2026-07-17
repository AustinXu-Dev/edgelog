export interface Profile {
  id: string;
  display_name: string | null;
  timezone: string;
  created_at: string;
}

export interface TradingAccount {
  id: string;
  user_id: string;
  name: string;
  broker: string | null;
  initial_balance: number;
  status: 'active' | 'breached' | 'archived' | 'passed';
  created_at: string;
}

export interface BalanceAdjustment {
  id: string;
  account_id: string;
  user_id: string;
  amount: number;
  type: 'withdrawal' | 'deposit';
  note: string | null;
  created_at: string;
}

export type Instrument =
  // CME Equity Futures
  | 'NQ' | 'ES' | 'MNQ' | 'MES' | 'YM' | 'MYM' | 'RTY' | 'M2K'
  // CME Metals Futures
  | 'GC' | 'MGC' | 'SI' | 'SIL' | 'PL'
  // CME Energy Futures
  | 'CL' | 'MCL'
  // Index CFDs
  | 'NDX100' | 'SPX500' | 'US30' | 'GER40'
  // Commodity CFDs
  | 'XAUUSD' | 'XAGUSD'
  // Forex
  | 'EURUSD' | 'GBPUSD' | 'AUDUSD' | 'NZDUSD' | 'USDJPY' | 'USDCAD'
  // Crypto
  | 'BTCUSD' | 'ETHUSD';

export type InstrumentType = 'futures' | 'index' | 'forex' | 'crypto';
export type Direction = 'long' | 'short';
export type TradeStatus = 'open' | 'closed';
export type Mood = 'focused' | 'neutral' | 'anxious' | 'impulsive';

export interface Trade {
  id: string;
  user_id: string;
  account_id: string | null;
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
  gross_pnl: number | null;
  net_pnl: number | null;
  r_multiple: number | null;
  status: TradeStatus;
  created_at: string;
}

export interface Checklist {
  id: string;
  user_id: string;
  name: string;
  session_time: string | null;
  sort_order: number;
  created_at: string;
}

export interface ChecklistItem {
  id: string;
  checklist_id: string;
  user_id: string;
  text: string;
  sort_order: number;
  created_at: string;
}

export interface ChecklistWithItems extends Checklist {
  items: ChecklistItem[];
}

export interface TradingStrategy {
  id: string;
  user_id: string;
  name: string;
  description: string | null;
  color: string;
  created_at: string;
}

export interface TradeWithDetails extends Trade {
  tags?: TradeTag[];
  journal?: TradeJournalEntry | null;
  strategies?: TradingStrategy[];
}

export interface TradeTag {
  id: string;
  user_id: string;
  name: string;
  color: string;
}

export interface TradeTagLink {
  trade_id: string;
  tag_id: string;
}

export interface TradeJournalEntry {
  id: string;
  trade_id: string;
  user_id: string;
  notes: string | null;
  rating: number | null;
  strategy: string | null;
  screenshot_url: string | null;
  created_at: string;
}

export interface DailyJournal {
  id: string;
  user_id: string;
  date: string;
  content: string | null;
  mood: Mood | null;
  created_at: string;
}

export interface DailyJournalWithTrades extends DailyJournal {
  linkedTrades: { id: string; instrument: string; direction: Direction; net_pnl: number | null }[];
}

export interface DashboardMetrics {
  totalNetPnl: number;
  winRate: number;
  profitFactor: number;
  avgRMultiple: number;
  tradeCount: number;
  winCount: number;
  lossCount: number;
  grossProfit: number;
  grossLoss: number;
}

export interface EquityPoint {
  date: string;
  cumPnl: number;
  pnl: number;
}

export interface PnLByInstrumentRow {
  instrument: string;
  total_pnl: number;
  trade_count: number;
}

export interface PnLByDowRow {
  dow: number;
  total_pnl: number;
}

export interface PnLByHourRow {
  hour: number;
  total_pnl: number;
}

export interface TradeFormValues {
  instrument: Instrument;
  instrument_type: InstrumentType;
  direction: Direction;
  entry_price: string;
  exit_price: string;
  position_size: string;
  entry_datetime: string;
  exit_datetime: string;
  stop_loss_planned: string;
  take_profit_planned: string;
  commission: string;
  status: TradeStatus;
}

export interface CsvTradeRow {
  instrument: string;
  instrument_type: string;
  direction: string;
  entry_price: string;
  exit_price: string;
  position_size: string;
  entry_datetime: string;
  exit_datetime: string;
  stop_loss_planned: string;
  take_profit_planned: string;
  commission: string;
  status: string;
  [key: string]: string;
}
