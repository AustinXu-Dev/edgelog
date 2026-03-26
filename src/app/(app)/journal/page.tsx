import Link from 'next/link';
import { getDailyJournalEntries } from '@/lib/db/journal';
import { Topbar } from '@/components/layout/Topbar';
import { Button } from '@/components/ui/Button';

const MOOD_LABELS: Record<string, string> = {
  focused: '🎯 Focused',
  neutral: '😐 Neutral',
  anxious: '😰 Anxious',
  impulsive: '⚡ Impulsive',
};

export default async function JournalPage() {
  const entries = await getDailyJournalEntries();

  const today = new Date().toISOString().slice(0, 10);

  return (
    <div className="flex flex-col h-full">
      <Topbar
        title="Daily Journal"
        actions={
          <Link href={`/journal/${today}`}>
            <Button size="sm">Today&apos;s Entry</Button>
          </Link>
        }
      />
      <div className="flex-1 overflow-y-auto p-6">
        {entries.length === 0 ? (
          <div className="text-center py-16 text-gray-600">
            <p className="text-lg">No journal entries yet</p>
            <p className="text-sm mt-1">
              <Link href={`/journal/${today}`} className="text-indigo-400 hover:underline">
                Write your first entry here
              </Link>
            </p>
          </div>
        ) : (
          <div className="space-y-3 max-w-2xl">
            {entries.map((entry) => (
              <Link
                key={entry.id}
                href={`/journal/${entry.date}`}
                className="block bg-gray-900 border border-gray-800 rounded-xl p-4 hover:border-gray-700 transition-colors"
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="font-medium text-gray-100">{entry.date}</span>
                  {entry.mood && (
                    <span className="text-sm text-gray-400">{MOOD_LABELS[entry.mood] ?? entry.mood}</span>
                  )}
                </div>
                {entry.content && (
                  <p className="text-sm text-gray-400 line-clamp-2">{entry.content}</p>
                )}
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
