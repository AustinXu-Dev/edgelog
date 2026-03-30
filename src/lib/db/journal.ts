import { createServerClient } from '../supabase/server';
import type { TradeJournalEntry, DailyJournal, DailyJournalWithTrades } from '../types';

// Trade journal entries
export async function getTradeJournal(tradeId: string): Promise<TradeJournalEntry | null> {
  const supabase = createServerClient();

  const { data } = await supabase
    .from('trade_journal_entries')
    .select('*')
    .eq('trade_id', tradeId)
    .single();

  return data ?? null;
}

export async function upsertTradeJournal(
  tradeId: string,
  values: Partial<Omit<TradeJournalEntry, 'id' | 'trade_id' | 'user_id' | 'created_at'>>
): Promise<TradeJournalEntry | null> {
  const supabase = createServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;

  const { data } = await supabase
    .from('trade_journal_entries')
    .upsert(
      { ...values, trade_id: tradeId, user_id: user.id },
      { onConflict: 'trade_id' }
    )
    .select()
    .single();

  return data ?? null;
}

// Dates that have trade journal entries, with count per date
export async function getTradeJournalDates(): Promise<{ date: string; count: number }[]> {
  const supabase = createServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return [];

  const { data } = await supabase
    .from('trade_journal_entries')
    .select('trades!inner(entry_datetime)')
    .eq('user_id', user.id);

  if (!data) return [];

  const dateMap: Record<string, number> = {};
  for (const row of data) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const dt: string | undefined = (row as any).trades?.entry_datetime;
    if (dt) {
      const date = dt.slice(0, 10);
      dateMap[date] = (dateMap[date] ?? 0) + 1;
    }
  }

  return Object.entries(dateMap)
    .map(([date, count]) => ({ date, count }))
    .sort((a, b) => b.date.localeCompare(a.date));
}

// Daily journal trade links
export async function getJournalTradeLinks(journalId: string): Promise<string[]> {
  const supabase = createServerClient();
  const { data } = await supabase
    .from('daily_journal_trade_links')
    .select('trade_id')
    .eq('journal_id', journalId);
  return data?.map((r: { trade_id: string }) => r.trade_id) ?? [];
}

// Daily journal
export async function getDailyJournalEntries(): Promise<DailyJournalWithTrades[]> {
  const supabase = createServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return [];

  const { data } = await supabase
    .from('daily_journal')
    .select(`
      *,
      daily_journal_trade_links (
        trades ( id, instrument, direction, net_pnl )
      )
    `)
    .eq('user_id', user.id)
    .order('date', { ascending: false });

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return (data ?? []).map((entry: any) => ({
    ...entry,
    linkedTrades: ((entry.daily_journal_trade_links ?? []) as Array<{ trades: unknown }>)
      .map((link) => link.trades)
      .filter(Boolean),
  }));
}

export async function getDailyJournalByDate(date: string): Promise<DailyJournal | null> {
  const supabase = createServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;

  const { data } = await supabase
    .from('daily_journal')
    .select('*')
    .eq('user_id', user.id)
    .eq('date', date)
    .single();

  return data ?? null;
}

export async function upsertDailyJournal(
  date: string,
  values: Partial<Omit<DailyJournal, 'id' | 'user_id' | 'date' | 'created_at'>>
): Promise<DailyJournal | null> {
  const supabase = createServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;

  const { data } = await supabase
    .from('daily_journal')
    .upsert(
      { ...values, date, user_id: user.id },
      { onConflict: 'user_id,date' }
    )
    .select()
    .single();

  return data ?? null;
}
