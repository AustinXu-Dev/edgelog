import { cookies } from 'next/headers';
import { getTags } from '@/lib/db/tags';
import { Topbar } from '@/components/layout/Topbar';
import { TradeForm } from '@/components/trades/TradeForm';

export default async function NewTradePage() {
  const allTags = await getTags();
  const activeAccountId = cookies().get('active_account_id')?.value ?? null;

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
