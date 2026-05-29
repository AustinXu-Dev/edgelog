import { createServerClient } from '../supabase/server';
import type { Trade, TradeWithDetails } from '../types';

export async function getTrades(
  fromDate?: string,
  toDate?: string,
  accountId?: string | null
): Promise<Trade[]> {
  const supabase = createServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return [];

  let query = supabase
    .from('trades')
    .select('*')
    .eq('user_id', user.id)
    .order('entry_datetime', { ascending: false });

  if (fromDate) query = query.gte('entry_datetime', fromDate);
  if (toDate) query = query.lte('entry_datetime', toDate + 'T23:59:59Z');
  if (accountId) query = query.eq('account_id', accountId);

  const { data } = await query;
  return data ?? [];
}

export async function getRecentTrades(
  limit: number,
  accountIds: string[] = []
): Promise<Trade[]> {
  const supabase = createServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return [];

  let query = supabase
    .from('trades')
    .select('*')
    .eq('user_id', user.id)
    .order('entry_datetime', { ascending: false })
    .limit(limit);

  if (accountIds.length === 1) {
    query = query.eq('account_id', accountIds[0]);
  } else if (accountIds.length > 1) {
    query = query.in('account_id', accountIds);
  }

  const { data } = await query;
  return data ?? [];
}

export async function getTradeById(id: string): Promise<TradeWithDetails | null> {
  const supabase = createServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;

  // Single query — replaces 3 sequential round-trips
  const { data: trade } = await supabase
    .from('trades')
    .select(`
      *,
      trade_tag_links(trade_tags(id, name, color, user_id)),
      trade_journal_entries(*),
      trade_strategy_links(trading_strategies(id, name, description, color, user_id, created_at))
    `)
    .eq('id', id)
    .eq('user_id', user.id)
    .single();

  if (!trade) return null;

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const tags = ((trade as any).trade_tag_links?.map((l: any) => l.trade_tags).filter(Boolean) ?? []) as import('../types').TradeTag[];
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const journal = (trade as any).trade_journal_entries ?? null;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const strategies = ((trade as any).trade_strategy_links?.map((l: any) => l.trading_strategies).filter(Boolean) ?? []) as import('../types').TradingStrategy[];

  // eslint-disable-next-line @typescript-eslint/no-explicit-any, @typescript-eslint/no-unused-vars
  const { trade_tag_links: _tagLinks, trade_journal_entries: _journalEntries, trade_strategy_links: _stratLinks, ...tradeData } = trade as any;

  return {
    ...tradeData,
    tags,
    journal,
    strategies,
  };
}

export async function createTrade(
  values: Omit<Trade, 'id' | 'user_id' | 'created_at'>
): Promise<Trade | null> {
  const supabase = createServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;

  const { data } = await supabase
    .from('trades')
    .insert({ ...values, user_id: user.id })
    .select()
    .single();

  return data ?? null;
}

export async function updateTrade(
  id: string,
  values: Partial<Omit<Trade, 'id' | 'user_id' | 'created_at'>>
): Promise<Trade | null> {
  const supabase = createServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;

  const { data } = await supabase
    .from('trades')
    .update(values)
    .eq('id', id)
    .eq('user_id', user.id)
    .select()
    .single();

  return data ?? null;
}

export async function deleteTrade(id: string): Promise<boolean> {
  const supabase = createServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return false;

  const { error } = await supabase
    .from('trades')
    .delete()
    .eq('id', id)
    .eq('user_id', user.id);

  return !error;
}
