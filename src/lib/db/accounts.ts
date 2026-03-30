import { createServerClient } from '../supabase/server';
import type { TradingAccount } from '../types';

export async function getAccounts(): Promise<TradingAccount[]> {
  const supabase = createServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return [];

  const { data } = await supabase
    .from('trading_accounts')
    .select('*')
    .eq('user_id', user.id)
    .order('created_at', { ascending: true });

  return data ?? [];
}

export async function createAccount(
  name: string,
  initialBalance: number,
  broker?: string
): Promise<TradingAccount | null> {
  const supabase = createServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;

  const { data } = await supabase
    .from('trading_accounts')
    .insert({ user_id: user.id, name, initial_balance: initialBalance, broker: broker || null })
    .select()
    .single();

  return data ?? null;
}

export async function deleteAccount(id: string): Promise<boolean> {
  const supabase = createServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return false;

  const { error } = await supabase
    .from('trading_accounts')
    .delete()
    .eq('id', id)
    .eq('user_id', user.id);

  return !error;
}
