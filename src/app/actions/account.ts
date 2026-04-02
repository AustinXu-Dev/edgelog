'use server';

import { cookies } from 'next/headers';
import { revalidatePath } from 'next/cache';
import { createClient } from '@supabase/supabase-js';
import { createServerClient } from '@/lib/supabase/server';

export async function setActiveAccount(accountId: string | null) {
  if (accountId) {
    cookies().set('active_account_id', accountId, { path: '/' });
  } else {
    cookies().delete('active_account_id');
  }
  revalidatePath('/', 'layout');
}

export async function createAccountAndActivate(
  name: string,
  initialBalance: number
): Promise<{ id: string } | { error: string }> {
  const supabase = createServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return { error: 'Not authenticated' };

  const { data, error } = await supabase
    .from('trading_accounts')
    .insert({ user_id: user.id, name: name.trim(), initial_balance: initialBalance })
    .select('id')
    .single();

  if (error || !data) return { error: error?.message ?? 'Failed to create account' };

  await setActiveAccount(data.id);
  return { id: data.id };
}

export async function createAccountAction(
  name: string,
  initialBalance: number
): Promise<{ id: string } | { error: string }> {
  const supabase = createServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: 'Not authenticated' };

  const { data, error } = await supabase
    .from('trading_accounts')
    .insert({ user_id: user.id, name: name.trim(), initial_balance: initialBalance })
    .select('id')
    .single();

  if (error || !data) return { error: error?.message ?? 'Failed to create account' };
  revalidatePath('/', 'layout');
  return { id: data.id };
}

export async function deleteAccountAction(
  id: string,
  deleteTrades: boolean
): Promise<{ error?: string }> {
  const supabase = createServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: 'Not authenticated' };

  if (deleteTrades) {
    const { error: tradesError } = await supabase
      .from('trades')
      .delete()
      .eq('account_id', id)
      .eq('user_id', user.id);
    if (tradesError) return { error: tradesError.message };
  }

  const { error } = await supabase
    .from('trading_accounts')
    .delete()
    .eq('id', id)
    .eq('user_id', user.id);

  if (error) return { error: error.message };

  const activeAccountId = cookies().get('active_account_id')?.value;
  if (activeAccountId === id) cookies().delete('active_account_id');

  revalidatePath('/', 'layout');
  return {};
}

export async function closeEdgelogAccount(): Promise<{ error?: string }> {
  const supabase = createServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: 'Not authenticated' };

  const adminClient = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } }
  );

  const { error } = await adminClient.auth.admin.deleteUser(user.id);
  if (error) return { error: error.message };

  cookies().delete('active_account_id');
  return {};
}
