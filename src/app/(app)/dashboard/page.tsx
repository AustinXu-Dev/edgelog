import { cookies } from 'next/headers';
import Link from 'next/link';
import dynamic from 'next/dynamic';
import { getDashboardTrades } from '@/lib/db/dashboard';
import { getRecentTrades } from '@/lib/db/trades';
import { getAccounts } from '@/lib/db/accounts';
import { createServerClient } from '@/lib/supabase/server';
import {
  calcMetrics,
  buildEquityCurve,
  buildPnlByDow,
  buildPnlByHour,
  calcPnlByInstrument,
  // calcWinStreak,
} from '@/lib/utils/metrics';
import { formatCurrency, formatPercent, formatR } from '@/lib/utils/formatters';
import { Topbar } from '@/components/layout/Topbar';
import { MetricCard } from '@/components/dashboard/MetricCard';
import { CalendarHeatmap } from '@/components/dashboard/CalendarHeatmap';
import { RecentTradesTable } from '@/components/dashboard/RecentTradesTable';
import { DashboardFilterToggle } from '@/components/dashboard/DashboardFilterToggle';
import { DashboardAccountPicker } from '@/components/dashboard/DashboardAccountPicker';
// import { DashboardShareCard } from '@/components/dashboard/DashboardShareCard';
import { Card } from '@/components/ui/Card';

// Recharts is ~100KB gzipped — lazy-load so it doesn't block initial page render
const EquityCurve       = dynamic(() => import('@/components/dashboard/EquityCurve').then(m => m.EquityCurve), { ssr: false });
const PnLByInstrument   = dynamic(() => import('@/components/dashboard/PnLByInstrument').then(m => m.PnLByInstrument), { ssr: false });
const PnLByDayOfWeek    = dynamic(() => import('@/components/dashboard/PnLByDayOfWeek').then(m => m.PnLByDayOfWeek), { ssr: false });
const PnLByTimeOfDay    = dynamic(() => import('@/components/dashboard/PnLByTimeOfDay').then(m => m.PnLByTimeOfDay), { ssr: false });
const DashboardAIInsights = dynamic(() => import('@/components/dashboard/DashboardAIInsights').then(m => m.DashboardAIInsights), { ssr: false });

interface PageProps {
  searchParams: { from?: string; to?: string; accs?: string };
}

export default async function DashboardPage({ searchParams }: PageProps) {
  const from = searchParams.from;
  const to = searchParams.to;
  const supabase = createServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  const { data: profile } = user
    ? await supabase.from('profiles').select('timezone').eq('id', user.id).single()
    : { data: null };
  const timezone = profile?.timezone ?? 'UTC';

  const accounts = await getAccounts();

  // Mirror the layout's fallback: if the cookie is missing or points to a deleted account,
  // default to the first active account rather than showing all accounts.
  const cookieAccountId = cookies().get('active_account_id')?.value ?? null;
  const cookieAccountExists = cookieAccountId ? accounts.some((a) => a.id === cookieAccountId) : false;
  const firstActiveAccount = accounts.find((a) => a.status === 'active') ?? null;
  const activeAccountId = (cookieAccountExists ? cookieAccountId : firstActiveAccount?.id) ?? null;

  // Resolve which account IDs to filter by:
  // ?accs=all  → explicitly show all accounts (no filter)
  // ?accs=id1,id2 → show only those accounts
  // (absent)   → fall back to the resolved activeAccountId from cookie
  let selectedAccountIds: string[];
  if (searchParams.accs === 'all') {
    selectedAccountIds = [];
  } else if (searchParams.accs) {
    const validIds = new Set(accounts.map((a) => a.id));
    selectedAccountIds = searchParams.accs.split(',').filter((id) => validIds.has(id));
  } else if (activeAccountId) {
    selectedAccountIds = [activeAccountId];
  } else {
    selectedAccountIds = [];
  }

  const [trades, recentTrades] = await Promise.all([
    getDashboardTrades(from, to, selectedAccountIds),
    getRecentTrades(10, selectedAccountIds),
  ]);

  // Sum initial balances of selected accounts for the equity curve baseline
  const initialBalance = selectedAccountIds.length > 0
    ? accounts
        .filter((a) => selectedAccountIds.includes(a.id))
        .reduce((sum, a) => sum + a.initial_balance, 0)
    : 0;

  // Single account ID for features that only support one account (calendar, AI)
  const singleAccountId = selectedAccountIds.length === 1 ? selectedAccountIds[0] : null;

  const metrics = calcMetrics(trades);
  const equityData = buildEquityCurve(trades, initialBalance);
  const dowData = buildPnlByDow(trades, timezone);
  const hourData = buildPnlByHour(trades, timezone);
  const instrumentData = calcPnlByInstrument(trades);
  // const winStreak = calcWinStreak(trades);

  const now = new Date();
  const calYear = now.getFullYear();
  const calMonth = now.getMonth();

  const pnlColor =
    metrics.totalNetPnl > 0 ? 'text-emerald-600' : metrics.totalNetPnl < 0 ? 'text-red-600' : 'text-gray-900';

  return (
    <div className="flex flex-col h-full">
      <Topbar
        title="Dashboard"
        actions={
          <div className="flex items-center gap-2">
            {accounts.length > 1 && (
              <DashboardAccountPicker accounts={accounts} selectedIds={selectedAccountIds} />
            )}
            <DashboardFilterToggle from={from} to={to} />
            {/* <DashboardShareCard
              metrics={metrics}
              instrumentData={instrumentData}
              winStreak={winStreak}
              initialBalance={initialBalance}
              from={from}
              to={to}
            /> */}
          </div>
        }
      />
      <div className="flex-1 overflow-y-auto p-4 md:p-6 space-y-4 md:space-y-6">
        {/* KPI Row */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
          <MetricCard
            label="Total Net P&L"
            value={formatCurrency(metrics.totalNetPnl)}
            sub={`${metrics.tradeCount} trades`}
            valueColor={pnlColor}
          />
          <MetricCard
            label="Win Rate"
            value={formatPercent(metrics.winRate)}
            sub={`${metrics.winCount}W / ${metrics.lossCount}L`}
          />
          <MetricCard
            label="Profit Factor"
            value={isFinite(metrics.profitFactor) ? metrics.profitFactor.toFixed(2) : '∞'}
          />
          <MetricCard
            label="Avg R-Multiple"
            value={formatR(metrics.avgRMultiple)}
          />
        </div>

        {/* Equity Curve */}
        <Card title="Equity Curve">
          <EquityCurve data={equityData} initialBalance={initialBalance} />
        </Card>

        {/* Charts row */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card title="P&L by Instrument">
            <PnLByInstrument data={instrumentData} />
          </Card>
          <Card title="P&L by Day of Week">
            <PnLByDayOfWeek data={dowData} />
          </Card>
          <Card title="P&L by Time of Day">
            <PnLByTimeOfDay data={hourData} />
          </Card>
        </div>

        {/* Calendar + Recent Trades */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Card title="Monthly P&L Calendar">
            <CalendarHeatmap
              initialYear={calYear}
              initialMonth={calMonth}
              accountIds={selectedAccountIds}
            />
          </Card>
          <Card
            title="Recent Trades"
            action={<Link href="/trades" className="text-xs text-blue-600 hover:underline">View all</Link>}
          >
            <RecentTradesTable trades={recentTrades} />
          </Card>
        </div>

        {/* AI Insights */}
        <Card title="AI Insights (Last 30 Days)">
          <DashboardAIInsights accountId={singleAccountId} />
        </Card>

        {/* Footer */}
        <div className="pt-4 pb-2 text-center">
          <p className="text-xs text-gray-400">© {new Date().getFullYear()} Edgelog. All rights reserved.</p>
        </div>
      </div>
    </div>
  );
}
