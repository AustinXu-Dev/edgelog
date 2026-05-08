import { createServerClient } from '../supabase/server';
import type { TradingAccount, BalanceAdjustment } from '../types';

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

export async function updateAccountStatus(
  id: string,
  status: TradingAccount['status']
): Promise<boolean> {
  const supabase = createServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return false;

  const { error } = await supabase
    .from('trading_accounts')
    .update({ status })
    .eq('id', id)
    .eq('user_id', user.id);

  return !error;
}

export async function getTotalAdjustments(accountId: string): Promise<number> {
  const supabase = createServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return 0;

  const { data } = await supabase
    .from('account_balance_adjustments')
    .select('amount')
    .eq('account_id', accountId)
    .eq('user_id', user.id);

  if (!data || data.length === 0) return 0;
  return data.reduce((sum, row) => sum + row.amount, 0);
}

export async function getBalanceAdjustments(accountId: string): Promise<BalanceAdjustment[]> {
  const supabase = createServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return [];

  const { data } = await supabase
    .from('account_balance_adjustments')
    .select('*')
    .eq('account_id', accountId)
    .eq('user_id', user.id)
    .order('created_at', { ascending: false });

  return data ?? [];
}

export async function createBalanceAdjustment(
  accountId: string,
  amount: number,
  type: 'withdrawal' | 'deposit',
  note?: string
): Promise<BalanceAdjustment | null> {
  const supabase = createServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;

  const { data } = await supabase
    .from('account_balance_adjustments')
    .insert({
      account_id: accountId,
      user_id: user.id,
      amount,
      type,
      note: note ?? null,
    })
    .select()
    .single();

  return data ?? null;
}
