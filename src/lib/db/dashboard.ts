import { createServerClient } from '../supabase/server';
import type { Trade } from '../types';

export async function getDashboardTrades(fromDate: string, toDate: string): Promise<Trade[]> {
  const supabase = createServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return [];

  const { data } = await supabase
    .from('trades')
    .select('*')
    .eq('user_id', user.id)
    .eq('status', 'closed')
    .gte('entry_datetime', fromDate)
    .lte('entry_datetime', toDate + 'T23:59:59Z')
    .order('entry_datetime', { ascending: true });

  return data ?? [];
}
