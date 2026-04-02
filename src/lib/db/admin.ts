import { supabaseAdmin } from '@/lib/supabase/admin';

export interface AdminUser {
  id: string;
  email: string;
  created_at: string;
  last_sign_in_at: string | null;
  display_name: string | null;
  timezone: string;
  trade_count: number;
  account_count: number;
}

export interface AdminUserDetail {
  id: string;
  email: string;
  created_at: string;
  last_sign_in_at: string | null;
  display_name: string | null;
  timezone: string;
  accounts: { id: string; name: string; broker: string | null; initial_balance: number; trade_count: number }[];
  total_trades: number;
  total_pnl: number | null;
}

export async function getAdminUsers(): Promise<AdminUser[]> {
  const { data: authData, error: authError } = await supabaseAdmin.auth.admin.listUsers();
  if (authError) throw authError;

  const userIds = authData.users.map((u) => u.id);
  if (userIds.length === 0) return [];

  const [profilesRes, tradeCountsRes, accountCountsRes] = await Promise.all([
    supabaseAdmin.from('profiles').select('id, display_name, timezone').in('id', userIds),
    supabaseAdmin
      .from('trades')
      .select('user_id')
      .in('user_id', userIds),
    supabaseAdmin
      .from('trading_accounts')
      .select('user_id')
      .in('user_id', userIds),
  ]);

  const profileMap = new Map(
    (profilesRes.data ?? []).map((p) => [p.id, p])
  );

  const tradeCountMap = new Map<string, number>();
  for (const row of tradeCountsRes.data ?? []) {
    tradeCountMap.set(row.user_id, (tradeCountMap.get(row.user_id) ?? 0) + 1);
  }

  const accountCountMap = new Map<string, number>();
  for (const row of accountCountsRes.data ?? []) {
    accountCountMap.set(row.user_id, (accountCountMap.get(row.user_id) ?? 0) + 1);
  }

  return authData.users
    .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
    .map((u) => {
      const profile = profileMap.get(u.id);
      return {
        id: u.id,
        email: u.email ?? '',
        created_at: u.created_at,
        last_sign_in_at: u.last_sign_in_at ?? null,
        display_name: profile?.display_name ?? null,
        timezone: profile?.timezone ?? 'UTC',
        trade_count: tradeCountMap.get(u.id) ?? 0,
        account_count: accountCountMap.get(u.id) ?? 0,
      };
    });
}

export async function getAdminUserDetail(userId: string): Promise<AdminUserDetail | null> {
  const { data: authUser, error: authError } = await supabaseAdmin.auth.admin.getUserById(userId);
  if (authError || !authUser.user) return null;

  const [profileRes, accountsRes, tradesRes] = await Promise.all([
    supabaseAdmin.from('profiles').select('display_name, timezone').eq('id', userId).single(),
    supabaseAdmin
      .from('trading_accounts')
      .select('id, name, broker, initial_balance')
      .eq('user_id', userId),
    supabaseAdmin
      .from('trades')
      .select('account_id, net_pnl')
      .eq('user_id', userId),
  ]);

  const tradesByAccount = new Map<string | null, number>();
  let totalPnl = 0;
  for (const t of tradesRes.data ?? []) {
    tradesByAccount.set(t.account_id, (tradesByAccount.get(t.account_id) ?? 0) + 1);
    if (t.net_pnl != null) totalPnl += t.net_pnl;
  }

  const accounts = (accountsRes.data ?? []).map((a) => ({
    ...a,
    trade_count: tradesByAccount.get(a.id) ?? 0,
  }));

  return {
    id: authUser.user.id,
    email: authUser.user.email ?? '',
    created_at: authUser.user.created_at,
    last_sign_in_at: authUser.user.last_sign_in_at ?? null,
    display_name: profileRes.data?.display_name ?? null,
    timezone: profileRes.data?.timezone ?? 'UTC',
    accounts,
    total_trades: tradesRes.data?.length ?? 0,
    total_pnl: tradesRes.data?.length ? totalPnl : null,
  };
}

export async function deleteAdminUser(userId: string): Promise<void> {
  const { error } = await supabaseAdmin.auth.admin.deleteUser(userId);
  if (error) throw error;
}
