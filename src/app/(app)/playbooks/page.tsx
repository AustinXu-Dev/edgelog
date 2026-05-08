import { getStrategies } from '@/lib/db/strategies';
import { Topbar } from '@/components/layout/Topbar';
import { Card } from '@/components/ui/Card';
import { PlaybooksManager } from './PlaybooksManager';

export default async function PlaybooksPage() {
  const strategies = await getStrategies();

  return (
    <div className="flex flex-col h-full">
      <Topbar title="Playbooks" />
      <div className="flex-1 overflow-y-auto p-4 md:p-6">
        <div className="space-y-4">
          <p className="text-sm text-gray-500">
            Define your trading strategies and playbooks. Apply them to trades on the trade detail page.
          </p>
          <Card title="Your Playbooks">
            <PlaybooksManager initialStrategies={strategies} />
          </Card>
        </div>
      </div>
    </div>
  );
}
