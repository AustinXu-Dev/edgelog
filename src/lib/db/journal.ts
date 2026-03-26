import { createServerClient } from '../supabase/server';
import type { TradeJournalEntry, DailyJournal } from '../types';

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

// Daily journal
export async function getDailyJournalEntries(): Promise<DailyJournal[]> {
  const supabase = createServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return [];

  const { data } = await supabase
    .from('daily_journal')
    .select('*')
    .eq('user_id', user.id)
    .order('date', { ascending: false });

  return data ?? [];
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
