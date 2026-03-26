import { createServerClient } from '../supabase/server';
import type { Trade, TradeWithDetails } from '../types';

export async function getTrades(
  fromDate?: string,
  toDate?: string
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

  const { data } = await query;
  return data ?? [];
}

export async function getTradeById(id: string): Promise<TradeWithDetails | null> {
  const supabase = createServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;

  const { data: trade } = await supabase
    .from('trades')
    .select('*')
    .eq('id', id)
    .eq('user_id', user.id)
    .single();

  if (!trade) return null;

  const { data: tagLinks } = await supabase
    .from('trade_tag_links')
    .select('tag_id, trade_tags(id, name, color, user_id)')
    .eq('trade_id', id);

  const { data: journal } = await supabase
    .from('trade_journal_entries')
    .select('*')
    .eq('trade_id', id)
    .single();

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const tags = (tagLinks?.map((l: any) => l.trade_tags).filter(Boolean) ?? []) as import('../types').TradeTag[];

  return {
    ...trade,
    tags,
    journal: journal ?? null,
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
