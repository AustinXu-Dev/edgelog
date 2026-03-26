import { getDailyJournalByDate } from '@/lib/db/journal';
import { Topbar } from '@/components/layout/Topbar';
import { DailyJournalEditor } from './DailyJournalEditor';

interface PageProps {
  params: { date: string };
}

export default async function DailyJournalPage({ params }: PageProps) {
  const { date } = params;
  const entry = await getDailyJournalByDate(date);

  return (
    <div className="flex flex-col h-full">
      <Topbar title={date} />
      <div className="flex-1 overflow-y-auto p-6">
        <div className="bg-gray-900 border border-gray-800 rounded-xl p-6 max-w-2xl">
          <DailyJournalEditor date={date} initial={entry} />
        </div>
      </div>
    </div>
  );
}
