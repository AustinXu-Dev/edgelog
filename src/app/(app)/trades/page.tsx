import { cookies } from 'next/headers';
import Link from 'next/link';
import { createServerClient } from '@/lib/supabase/server';
import { TradeTable } from '@/components/trades/TradeTable';
import { TradeFilters } from '@/components/trades/TradeFilters';
import { Topbar } from '@/components/layout/Topbar';
import { Button } from '@/components/ui/Button';
import { Pagination } from '@/components/ui/Pagination';
import type { Trade } from '@/lib/types';

const PAGE_SIZE = 10;

interface PageProps {
  searchParams: {
    instrument?: string;
    direction?: string;
    status?: string;
    from?: string;
    to?: string;
    page?: string;
  };
}

export default async function TradesPage({ searchParams }: PageProps) {
  const supabase = createServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return null;

  const page = Math.max(1, parseInt(searchParams.page ?? '1', 10));
  const from = (page - 1) * PAGE_SIZE;
  const to = from + PAGE_SIZE - 1;

  let activeAccountId: string | null = cookies().get('active_account_id')?.value ?? null;
  if (!activeAccountId) {
    const { data: firstAccount } = await supabase
      .from('trading_accounts')
      .select('id')
      .eq('user_id', user.id)
      .eq('status', 'active')
      .order('created_at', { ascending: true })
      .limit(1)
      .maybeSingle();
    activeAccountId = firstAccount?.id ?? null;
  }

  let query = supabase
    .from('trades')
    .select('*', { count: 'exact' })
    .eq('user_id', user.id)
    .order('entry_datetime', { ascending: false });

  if (searchParams.instrument) query = query.eq('instrument', searchParams.instrument);
  if (searchParams.direction) query = query.eq('direction', searchParams.direction);
  if (searchParams.status) query = query.eq('status', searchParams.status);
  if (searchParams.from) query = query.gte('entry_datetime', searchParams.from);
  if (searchParams.to) query = query.lte('entry_datetime', searchParams.to + 'T23:59:59Z');
  if (activeAccountId) query = query.eq('account_id', activeAccountId);

  const { data: trades, count } = await query.range(from, to);

  const totalCount = count ?? 0;
  const totalPages = Math.ceil(totalCount / PAGE_SIZE);

  const filterParams = Object.fromEntries(
    Object.entries(searchParams)
      .filter(([k, v]) => k !== 'page' && v !== undefined)
  ) as Record<string, string>;

  const exportParams = new URLSearchParams(filterParams).toString();

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
            <p className="text-sm text-gray-500">
              {totalCount} trade{totalCount !== 1 ? 's' : ''}
              {totalPages > 1 && (
                <span className="text-gray-400"> — page {page} of {totalPages}</span>
              )}
            </p>
            <div className="flex items-center gap-2">
              {totalCount > 0 && (
                <a href={`/api/trades/export${exportParams ? `?${exportParams}` : ''}`}>
                  <Button variant="secondary" size="sm"><i className="lni lni-download text-sm" />Export CSV</Button>
                </a>
              )}
              <Link href="/trades/import">
                <Button variant="secondary" size="sm"><i className="lni lni-upload-1 text-sm" />Import CSV</Button>
              </Link>
            </div>
          </div>
          <TradeTable trades={(trades as Trade[]) ?? []} />
          <Pagination page={page} totalPages={totalPages} basePath="/trades" filterParams={filterParams} />
        </div>
      </div>
    </div>
  );
}
