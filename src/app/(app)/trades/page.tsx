import { cookies } from 'next/headers';
import Link from 'next/link';
import { createServerClient } from '@/lib/supabase/server';
import { TradeTable } from '@/components/trades/TradeTable';
import { TradeFilters } from '@/components/trades/TradeFilters';
import { Topbar } from '@/components/layout/Topbar';
import { Button } from '@/components/ui/Button';
import type { Trade } from '@/lib/types';

interface PageProps {
  searchParams: {
    instrument?: string;
    direction?: string;
    status?: string;
    from?: string;
    to?: string;
  };
}

export default async function TradesPage({ searchParams }: PageProps) {
  const supabase = createServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return null;

  let query = supabase
    .from('trades')
    .select('*')
    .eq('user_id', user.id)
    .order('entry_datetime', { ascending: false });

  const activeAccountId = cookies().get('active_account_id')?.value ?? null;

  if (searchParams.instrument) query = query.eq('instrument', searchParams.instrument);
  if (searchParams.direction) query = query.eq('direction', searchParams.direction);
  if (searchParams.status) query = query.eq('status', searchParams.status);
  if (searchParams.from) query = query.gte('entry_datetime', searchParams.from);
  if (searchParams.to) query = query.lte('entry_datetime', searchParams.to + 'T23:59:59Z');
  if (activeAccountId) query = query.eq('account_id', activeAccountId);

  const { data: trades } = await query;

  return (
    <div className="flex flex-col h-full">
      <Topbar
        title="Trades"
        actions={
          <Link href="/trades/new">
            <Button size="sm"><i className="lni lni-plus text-sm" />New Trade</Button>
          </Link>
        }
      />
      <div className="flex-1 overflow-y-auto p-4 md:p-6 space-y-4">
        <div className="bg-white border border-gray-200 rounded-xl shadow-sm p-4">
          <TradeFilters />
        </div>
        <div className="bg-white border border-gray-200 rounded-xl shadow-sm p-4">
          <div className="flex items-center justify-between mb-4">
            <p className="text-sm text-gray-500">{trades?.length ?? 0} trades</p>
            <Link href="/trades/import">
              <Button variant="secondary" size="sm"><i className="lni lni-upload-1 text-sm" />Import CSV</Button>
            </Link>
          </div>
          <TradeTable trades={(trades as Trade[]) ?? []} />
        </div>
      </div>
    </div>
  );
}
