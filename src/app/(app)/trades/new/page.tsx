import { cookies } from 'next/headers';
import { getTags } from '@/lib/db/tags';
import { getAccounts } from '@/lib/db/accounts';
import { Topbar } from '@/components/layout/Topbar';
import { TradeForm } from '@/components/trades/TradeForm';

export default async function NewTradePage() {
  const allTags = await getTags();
  const activeAccountId = cookies().get('active_account_id')?.value ?? null;

  // Check if the active account is breached or archived
  if (activeAccountId) {
    const accounts = await getAccounts();
    const activeAccount = accounts.find((a) => a.id === activeAccountId);
    if (activeAccount && (activeAccount.status === 'breached' || activeAccount.status === 'archived')) {
      return (
        <div className="flex flex-col h-full">
          <Topbar title="New Trade" />
          <div className="flex-1 overflow-y-auto p-4 md:p-6">
            <div className="bg-amber-50 border border-amber-200 rounded-xl p-6 max-w-2xl">
              <div className="flex items-start gap-3">
                <span className="text-amber-500 text-xl mt-0.5">⚠</span>
                <div>
                  <p className="text-sm font-semibold text-amber-800">
                    Account {activeAccount.status === 'breached' ? 'Breached' : 'Archived'}
                  </p>
                  <p className="text-sm text-amber-700 mt-1">
                    &ldquo;{activeAccount.name}&rdquo; is {activeAccount.status}. Switch to an active account to log new trades.
                  </p>
                  <p className="text-xs text-amber-600 mt-2">
                    You can manage account status in{' '}
                    <a href="/settings?tab=accounts" className="underline hover:text-amber-800">
                      Settings → Accounts
                    </a>.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      );
    }
  }

  return (
    <div className="flex flex-col h-full">
      <Topbar title="New Trade" />
      <div className="flex-1 overflow-y-auto p-6">
        <div className="bg-white border border-gray-200 rounded-xl shadow-sm p-6 max-w-2xl">
          <TradeForm allTags={allTags} initialAccountId={activeAccountId} />
        </div>
      </div>
    </div>
  );
}
