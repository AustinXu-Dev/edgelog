import Link from 'next/link';
import { getDailyJournalEntries, getTradeJournalDates } from '@/lib/db/journal';
import { Topbar } from '@/components/layout/Topbar';
import { Button } from '@/components/ui/Button';
import { JournalList } from '@/components/journal/JournalList';
import type { DailyJournalWithTrades } from '@/lib/types';

export default async function JournalPage() {
  const [dailyEntries, tradeJournalDates] = await Promise.all([
    getDailyJournalEntries(),
    getTradeJournalDates(),
  ]);

  const today = new Date().toISOString().slice(0, 10);

  const dateMap: Record<string, { date: string; daily?: DailyJournalWithTrades; tradeCount?: number }> = {};

  for (const entry of dailyEntries) {
    dateMap[entry.date] = { date: entry.date, daily: entry };
  }
  for (const { date, count } of tradeJournalDates) {
    if (!dateMap[date]) dateMap[date] = { date };
    dateMap[date].tradeCount = count;
  }

  const allDates = Object.values(dateMap).sort((a, b) => b.date.localeCompare(a.date));

  return (
    <div className="flex flex-col h-full">
      <Topbar
        title="Daily Journal"
        actions={
          <Link href={`/journal/${today}`}>
            <Button size="sm"><i className="lni lni-pencil-1 text-sm" />Today&apos;s Entry</Button>
          </Link>
        }
      />
      <div className="flex-1 overflow-y-auto p-4 md:p-6">
        {allDates.length === 0 ? (
          <div className="text-center py-16 text-gray-400">
            <p className="text-lg">No journal entries yet</p>
            <p className="text-sm mt-1">
              <Link href={`/journal/${today}`} className="text-blue-600 hover:underline">
                Write your first entry here
              </Link>
            </p>
          </div>
        ) : (
          <JournalList items={allDates} />
        )}
      </div>
    </div>
  );
}
