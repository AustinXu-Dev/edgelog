import { cookies } from 'next/headers';
import { getDailyJournalByDate, getJournalTradeLinks } from '@/lib/db/journal';
import { createServerClient } from '@/lib/supabase/server';
import { Topbar } from '@/components/layout/Topbar';
import { DailyJournalEditor } from './DailyJournalEditor';
import type { Trade } from '@/lib/types';

interface PageProps {
  params: { date: string };
}

export default async function DailyJournalPage({ params }: PageProps) {
  const { date } = params;
  const activeAccountId = cookies().get('active_account_id')?.value ?? null;

  const supabase = createServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;

  const next = new Date(date);
  next.setDate(next.getDate() + 1);
  const nextDate = next.toISOString().slice(0, 10);

  const [entry, { data: dateTrades }] = await Promise.all([
    getDailyJournalByDate(date),
    supabase
      .from('trades')
      .select('id, instrument, direction, entry_datetime, net_pnl')
      .eq('user_id', user.id)
      .gte('entry_datetime', `${date}T00:00:00Z`)
      .lt('entry_datetime', `${nextDate}T00:00:00Z`)
      .order('entry_datetime'),
  ]);

  const linkedTradeIds = entry ? await getJournalTradeLinks(entry.id) : [];

  return (
    <div className="flex flex-col h-full">
      <Topbar title={date} />
      <div className="flex-1 overflow-y-auto p-4 md:p-6">
        <div className="bg-white border border-gray-200 rounded-xl shadow-sm p-6 max-w-2xl">
          <DailyJournalEditor
            date={date}
            initial={entry}
            dateTrades={(dateTrades as Trade[]) ?? []}
            initialLinkedTradeIds={linkedTradeIds}
            accountId={activeAccountId}
          />
        </div>
      </div>
    </div>
  );
}
