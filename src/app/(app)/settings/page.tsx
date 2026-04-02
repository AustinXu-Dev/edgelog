import Link from 'next/link';
import { cookies } from 'next/headers';
import { createServerClient } from '@/lib/supabase/server';
import { getAccounts } from '@/lib/db/accounts';
import { Topbar } from '@/components/layout/Topbar';
import { SettingsForm } from './SettingsForm';
import { AccountsTab } from './AccountsTab';
import { DangerZone } from './DangerZone';

function tabClass(active: boolean) {
  return active
    ? 'px-4 py-2 text-sm font-medium text-blue-600 border-b-2 border-blue-600 -mb-px'
    : 'px-4 py-2 text-sm font-medium text-gray-500 hover:text-gray-700 border-b-2 border-transparent -mb-px';
}

export default async function SettingsPage({
  searchParams,
}: {
  searchParams: { tab?: string };
}) {
  const supabase = createServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;

  const tab = searchParams.tab === 'accounts' ? 'accounts' : 'profile';

  const [profileResult, accounts] = await Promise.all([
    supabase.from('profiles').select('*').eq('id', user.id).single(),
    tab === 'accounts' ? getAccounts() : Promise.resolve([]),
  ]);

  const activeAccountId = cookies().get('active_account_id')?.value ?? null;

  return (
    <div className="flex flex-col h-full">
      <Topbar title="Settings" />
      <div className="flex-1 overflow-y-auto p-4 md:p-6">
        <div className="max-w-lg space-y-4">
          {/* Tab navigation */}
          <div className="flex border-b border-gray-200">
            <Link href="/settings" className={tabClass(tab === 'profile')}>
              Profile
            </Link>
            <Link href="/settings?tab=accounts" className={tabClass(tab === 'accounts')}>
              Accounts
            </Link>
          </div>

          {tab === 'profile' && (
            <>
              <div className="bg-white border border-gray-200 rounded-xl shadow-sm p-6 space-y-6">
                <div>
                  <p className="text-[11px] font-semibold uppercase tracking-wide text-gray-500 mb-1">Account</p>
                  <p className="text-sm text-gray-700">{user.email}</p>
                </div>
                <SettingsForm
                  userId={user.id}
                  initialDisplayName={profileResult.data?.display_name ?? ''}
                  initialTimezone={profileResult.data?.timezone ?? 'UTC'}
                />
              </div>
              <DangerZone userEmail={user.email ?? ''} />
            </>
          )}

          {tab === 'accounts' && (
            <div className="bg-white border border-gray-200 rounded-xl shadow-sm p-6">
              <AccountsTab accounts={accounts} activeAccountId={activeAccountId} />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
