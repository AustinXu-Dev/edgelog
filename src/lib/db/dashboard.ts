import { createServerClient } from '../supabase/server';
import type { Trade } from '../types';

export async function getDashboardTrades(
  fromDate: string | undefined,
  toDate: string | undefined,
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
    .eq('status', 'closed')
    .order('entry_datetime', { ascending: true });

  if (fromDate) query = query.gte('entry_datetime', fromDate);
  if (toDate) query = query.lte('entry_datetime', toDate + 'T23:59:59Z');
  if (accountId) query = query.eq('account_id', accountId);

  const { data } = await query;
  return data ?? [];
}
