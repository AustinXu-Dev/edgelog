import { cookies } from 'next/headers';
import Link from 'next/link';
import dynamic from 'next/dynamic';
import { getDashboardTrades } from '@/lib/db/dashboard';
import { getRecentTrades } from '@/lib/db/trades';
import {
  calcMetrics,
  buildEquityCurve,
  buildPnlByDow,
  buildPnlByHour,
  calcPnlByInstrument,
} from '@/lib/utils/metrics';
import { formatCurrency, formatPercent, formatR } from '@/lib/utils/formatters';
import { Topbar } from '@/components/layout/Topbar';
import { MetricCard } from '@/components/dashboard/MetricCard';
import { CalendarHeatmap } from '@/components/dashboard/CalendarHeatmap';
import { RecentTradesTable } from '@/components/dashboard/RecentTradesTable';
import { DashboardFilterToggle } from '@/components/dashboard/DashboardFilterToggle';
import { Card } from '@/components/ui/Card';

// Recharts is ~100KB gzipped — lazy-load so it doesn't block initial page render
const EquityCurve     = dynamic(() => import('@/components/dashboard/EquityCurve').then(m => m.EquityCurve), { ssr: false });
const PnLByInstrument = dynamic(() => import('@/components/dashboard/PnLByInstrument').then(m => m.PnLByInstrument), { ssr: false });
const PnLByDayOfWeek  = dynamic(() => import('@/components/dashboard/PnLByDayOfWeek').then(m => m.PnLByDayOfWeek), { ssr: false });
const PnLByTimeOfDay  = dynamic(() => import('@/components/dashboard/PnLByTimeOfDay').then(m => m.PnLByTimeOfDay), { ssr: false });

interface PageProps {
  searchParams: { from?: string; to?: string };
}

export default async function DashboardPage({ searchParams }: PageProps) {
  const from = searchParams.from;
  const to = searchParams.to;
  const activeAccountId = cookies().get('active_account_id')?.value ?? null;

  const [trades, recentTrades] = await Promise.all([
    getDashboardTrades(from, to, activeAccountId),
    getRecentTrades(10, activeAccountId),
  ]);

  const metrics = calcMetrics(trades);
  const equityData = buildEquityCurve(trades);
  const dowData = buildPnlByDow(trades);
  const hourData = buildPnlByHour(trades);
  const instrumentData = calcPnlByInstrument(trades);

  const now = new Date();
  const calYear = now.getFullYear();
  const calMonth = now.getMonth();

  const pnlColor =
    metrics.totalNetPnl > 0 ? 'text-emerald-600' : metrics.totalNetPnl < 0 ? 'text-red-600' : 'text-gray-900';

  return (
    <div className="flex flex-col h-full">
      <Topbar
        title="Dashboard"
        actions={<DashboardFilterToggle from={from} to={to} />}
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
          <EquityCurve data={equityData} />
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
              accountId={activeAccountId}
            />
          </Card>
          <Card
            title="Recent Trades"
            action={<Link href="/trades" className="text-xs text-blue-600 hover:underline">View all</Link>}
          >
            <RecentTradesTable trades={recentTrades} />
          </Card>
        </div>

        {/* Footer */}
        <div className="pt-4 pb-2 text-center">
          <p className="text-xs text-gray-400">© {new Date().getFullYear()} Edgelog. All rights reserved.</p>
        </div>
      </div>
    </div>
  );
}
