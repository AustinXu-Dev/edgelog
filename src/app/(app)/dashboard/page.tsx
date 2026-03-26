import { getDashboardTrades } from '@/lib/db/dashboard';
import { getTrades } from '@/lib/db/trades';
import {
  calcMetrics,
  buildEquityCurve,
  buildPnlByDow,
  buildPnlByHour,
  buildDailyPnl,
  calcPnlByInstrument,
} from '@/lib/utils/metrics';
import { formatCurrency, formatPercent, formatR } from '@/lib/utils/formatters';
import { Topbar } from '@/components/layout/Topbar';
import { MetricCard } from '@/components/dashboard/MetricCard';
import { EquityCurve } from '@/components/dashboard/EquityCurve';
import { CalendarHeatmap } from '@/components/dashboard/CalendarHeatmap';
import { PnLByInstrument } from '@/components/dashboard/PnLByInstrument';
import { PnLByDayOfWeek } from '@/components/dashboard/PnLByDayOfWeek';
import { PnLByTimeOfDay } from '@/components/dashboard/PnLByTimeOfDay';
import { RecentTradesTable } from '@/components/dashboard/RecentTradesTable';
import { DateRangePicker } from '@/components/ui/DateRangePicker';
import { Card } from '@/components/ui/Card';

function getDefaultDateRange() {
  const now = new Date();
  const from = new Date(now.getFullYear(), now.getMonth(), 1).toISOString().slice(0, 10);
  const to = new Date(now.getFullYear(), now.getMonth() + 1, 0).toISOString().slice(0, 10);
  return { from, to };
}

interface PageProps {
  searchParams: { from?: string; to?: string };
}

export default async function DashboardPage({ searchParams }: PageProps) {
  const defaults = getDefaultDateRange();
  const from = searchParams.from ?? defaults.from;
  const to = searchParams.to ?? defaults.to;

  const [trades, recentTrades] = await Promise.all([
    getDashboardTrades(from, to),
    getTrades(),
  ]);

  const metrics = calcMetrics(trades);
  const equityData = buildEquityCurve(trades);
  const dowData = buildPnlByDow(trades);
  const hourData = buildPnlByHour(trades);
  const dailyPnl = buildDailyPnl(trades);
  const instrumentData = calcPnlByInstrument(trades);

  const calYear = new Date(from).getFullYear();
  const calMonth = new Date(from).getMonth();

  const pnlColor =
    metrics.totalNetPnl > 0 ? 'text-emerald-400' : metrics.totalNetPnl < 0 ? 'text-red-400' : 'text-gray-100';

  return (
    <div className="flex flex-col h-full">
      <Topbar
        title="Dashboard"
        actions={<DateRangePicker from={from} to={to} />}
      />
      <div className="flex-1 overflow-y-auto p-6 space-y-6">
        {/* KPI Row */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
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
            <CalendarHeatmap dailyPnl={dailyPnl} year={calYear} month={calMonth} />
          </Card>
          <Card title="Recent Trades">
            <RecentTradesTable trades={recentTrades.slice(0, 10)} />
          </Card>
        </div>
      </div>
    </div>
  );
}
