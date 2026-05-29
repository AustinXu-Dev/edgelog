import { unstable_cache } from 'next/cache';
import { createClient } from '@supabase/supabase-js';
import { createServerClient } from '../supabase/server';
import type { Trade } from '../types';

// Inner fetch — uses service-role client so it works inside unstable_cache
// (cookie-based auth isn't available in cached callbacks)
const fetchDashboardTrades = unstable_cache(
  async (
    userId: string,
    fromDate: string | undefined,
    toDate: string | undefined,
    accountIds: string[] // empty = all accounts
  ): Promise<Trade[]> => {
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    let query = supabase
      .from('trades')
      .select('*')
      .eq('user_id', userId)
      .eq('status', 'closed')
      .order('entry_datetime', { ascending: true });

    if (fromDate) query = query.gte('entry_datetime', fromDate);
    if (toDate) query = query.lte('entry_datetime', toDate + 'T23:59:59Z');

    if (accountIds.length === 1) {
      query = query.eq('account_id', accountIds[0]);
    } else if (accountIds.length > 1) {
      query = query.in('account_id', accountIds);
    }

    const { data } = await query;
    return (data ?? []) as Trade[];
  },
  ['dashboard-trades'],
  { revalidate: 300, tags: ['dashboard-trades'] } // 5-minute cache, tag for manual invalidation
);

export async function getDashboardTrades(
  fromDate: string | undefined,
  toDate: string | undefined,
  accountIds: string[] = [] // empty = all accounts
): Promise<Trade[]> {
  const supabase = createServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return [];

  return fetchDashboardTrades(user.id, fromDate, toDate, accountIds);
}
