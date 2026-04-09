import { createServerClient } from '../supabase/server';
import type { TradingStrategy } from '../types';

export async function getStrategies(): Promise<TradingStrategy[]> {
  const supabase = createServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return [];

  const { data } = await supabase
    .from('trading_strategies')
    .select('*')
    .eq('user_id', user.id)
    .order('name');

  return data ?? [];
}

export async function createStrategy(
  name: string,
  description: string | null,
  color: string
): Promise<TradingStrategy | null> {
  const supabase = createServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;

  const { data } = await supabase
    .from('trading_strategies')
    .insert({ name, description: description || null, color, user_id: user.id })
    .select()
    .single();

  return data ?? null;
}

export async function deleteStrategy(id: string): Promise<boolean> {
  const supabase = createServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return false;

  const { error } = await supabase
    .from('trading_strategies')
    .delete()
    .eq('id', id)
    .eq('user_id', user.id);

  return !error;
}

export async function setTradeStrategyLinks(tradeId: string, strategyIds: string[]): Promise<void> {
  const supabase = createServerClient();

  await supabase.from('trade_strategy_links').delete().eq('trade_id', tradeId);

  if (strategyIds.length === 0) return;

  await supabase.from('trade_strategy_links').insert(
    strategyIds.map((strategy_id) => ({ trade_id: tradeId, strategy_id }))
  );
}

export async function getStrategiesForTrade(tradeId: string): Promise<TradingStrategy[]> {
  const supabase = createServerClient();

  const { data } = await supabase
    .from('trade_strategy_links')
    .select('trading_strategies(id, name, description, color, user_id, created_at)')
    .eq('trade_id', tradeId);

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return (data?.map((l: any) => l.trading_strategies).filter(Boolean) ?? []) as TradingStrategy[];
}
