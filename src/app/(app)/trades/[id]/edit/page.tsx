import { notFound } from 'next/navigation';
import { getTradeById } from '@/lib/db/trades';
import { Topbar } from '@/components/layout/Topbar';
import { TradeForm } from '@/components/trades/TradeForm';

interface PageProps {
  params: { id: string };
}

export default async function EditTradePage({ params }: PageProps) {
  const trade = await getTradeById(params.id);
  if (!trade) notFound();

  return (
    <div className="flex flex-col h-full">
      <Topbar title="Edit Trade" />
      <div className="flex-1 overflow-y-auto p-6">
        <div className="bg-white border border-gray-200 rounded-xl shadow-sm p-6 max-w-2xl">
          <TradeForm initialValues={trade} tradeId={trade.id} />
        </div>
      </div>
    </div>
  );
}
