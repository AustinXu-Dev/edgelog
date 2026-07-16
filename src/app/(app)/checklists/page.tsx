import { getChecklistsWithItems } from '@/lib/db/checklists';
import { Topbar } from '@/components/layout/Topbar';
import { Card } from '@/components/ui/Card';
import { ChecklistsManager } from './ChecklistsManager';

export default async function ChecklistsPage() {
  const checklists = await getChecklistsWithItems();

  return (
    <div className="flex flex-col h-full">
      <Topbar title="Checklists" />
      <div className="flex-1 overflow-y-auto p-4 md:p-6">
        <div className="space-y-4">
          <p className="text-sm text-gray-500">
            Define your daily trading checklists. They show up fresh every day on your dashboard.
          </p>
          <Card title="Your Checklists">
            <ChecklistsManager initialChecklists={checklists} />
          </Card>
        </div>
      </div>
    </div>
  );
}
