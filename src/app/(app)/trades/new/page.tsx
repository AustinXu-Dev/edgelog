import { Topbar } from '@/components/layout/Topbar';
import { TradeForm } from '@/components/trades/TradeForm';

export default function NewTradePage() {
  return (
    <div className="flex flex-col h-full">
      <Topbar title="New Trade" />
      <div className="flex-1 overflow-y-auto p-6">
        <div className="bg-gray-900 border border-gray-800 rounded-xl p-6 max-w-2xl">
          <TradeForm />
        </div>
      </div>
    </div>
  );
}
