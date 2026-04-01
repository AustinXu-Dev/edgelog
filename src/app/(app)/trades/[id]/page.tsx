import { notFound } from 'next/navigation';
import Link from 'next/link';
import { createServerClient } from '@/lib/supabase/server';
import { getTradeById } from '@/lib/db/trades';
import { getTags } from '@/lib/db/tags';
import { Topbar } from '@/components/layout/Topbar';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { JournalEditor } from '@/components/journal/JournalEditor';
import { ScreenshotUploader } from '@/components/journal/ScreenshotUploader';
import { TagSelector } from '@/components/trades/TagSelector';
import { DeleteTradeButton } from './DeleteTradeButton';
import { formatCurrency, formatDatetime, pnlColor, formatR } from '@/lib/utils/formatters';

interface PageProps {
  params: { id: string };
}

export default async function TradeDetailPage({ params }: PageProps) {
  const supabase = createServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;

  const [trade, allTags] = await Promise.all([
    getTradeById(params.id),
    getTags(),
  ]);

  if (!trade) notFound();

  // Get signed screenshot URL if exists
  let screenshotUrl: string | null = null;
  if (trade.journal?.screenshot_url) {
    const { data } = await supabase.storage
      .from('trade-screenshots')
      .createSignedUrl(trade.journal.screenshot_url, 3600);
    screenshotUrl = data?.signedUrl ?? null;
  }

  const selectedTagIds = trade.tags?.map((t) => t.id) ?? [];

  return (
    <div className="flex flex-col h-full">
      <Topbar
        title={`${trade.instrument} — ${trade.direction === 'long' ? 'Long' : 'Short'}`}
        actions={
          <div className="flex gap-2">
            <Link href="/trades">
              <Button variant="ghost" size="sm">Back</Button>
            </Link>
            <Link href={`/trades/${trade.id}/edit`}>
              <Button variant="secondary" size="sm"><i className="lni lni-pencil-1 text-sm" />Edit</Button>
            </Link>
            <DeleteTradeButton tradeId={trade.id} />
          </div>
        }
      />
      <div className="flex-1 overflow-y-auto p-6 space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Trade Details */}
          <Card title="Trade Details">
            <dl className="grid grid-cols-2 gap-x-4 gap-y-3 text-sm">
              <dt className="text-gray-500">Instrument</dt>
              <dd className="text-gray-900 font-medium">{trade.instrument} ({trade.instrument_type})</dd>

              <dt className="text-gray-500">Direction</dt>
              <dd className={trade.direction === 'long' ? 'text-emerald-600 font-medium' : 'text-red-600 font-medium'}>
                {trade.direction === 'long' ? 'Long' : 'Short'}
              </dd>

              <dt className="text-gray-500">Entry</dt>
              <dd className="text-gray-900 font-mono">{trade.entry_price.toFixed(4)}</dd>

              <dt className="text-gray-500">Exit</dt>
              <dd className="text-gray-900 font-mono">{trade.exit_price?.toFixed(4) ?? '—'}</dd>

              <dt className="text-gray-500">Size</dt>
              <dd className="text-gray-900 font-mono">{trade.position_size}</dd>

              <dt className="text-gray-500">Entry Time</dt>
              <dd className="text-gray-700">{formatDatetime(trade.entry_datetime)}</dd>

              <dt className="text-gray-500">Exit Time</dt>
              <dd className="text-gray-700">{trade.exit_datetime ? formatDatetime(trade.exit_datetime) : '—'}</dd>

              <dt className="text-gray-500">Stop Loss</dt>
              <dd className="text-gray-700 font-mono">{trade.stop_loss_planned?.toFixed(4) ?? '—'}</dd>

              <dt className="text-gray-500">Take Profit</dt>
              <dd className="text-gray-700 font-mono">{trade.take_profit_planned?.toFixed(4) ?? '—'}</dd>

              <dt className="text-gray-500">Commission</dt>
              <dd className="text-gray-700 font-mono">{formatCurrency(trade.commission)}</dd>

              <dt className="text-gray-500">Status</dt>
              <dd>
                <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${trade.status === 'closed' ? 'bg-gray-100 text-gray-600' : 'bg-emerald-50 text-emerald-700'}`}>
                  {trade.status}
                </span>
              </dd>
            </dl>
          </Card>

          {/* P&L Summary */}
          <Card title="P&L Summary">
            <dl className="grid grid-cols-2 gap-x-4 gap-y-3 text-sm">
              <dt className="text-gray-500">Gross P&L</dt>
              <dd className={`font-bold text-lg font-mono ${pnlColor(trade.gross_pnl)}`}>
                {trade.gross_pnl !== null ? formatCurrency(trade.gross_pnl) : '—'}
              </dd>

              <dt className="text-gray-500">Net P&L</dt>
              <dd className={`font-bold text-2xl font-mono ${pnlColor(trade.net_pnl)}`}>
                {trade.net_pnl !== null ? formatCurrency(trade.net_pnl) : '—'}
              </dd>

              <dt className="text-gray-500">R-Multiple</dt>
              <dd className={`font-bold text-lg font-mono ${pnlColor(trade.r_multiple)}`}>
                {formatR(trade.r_multiple)}
              </dd>
            </dl>
          </Card>
        </div>

        {/* Tags */}
        <Card title="Tags">
          <TagSelector
            tradeId={trade.id}
            allTags={allTags}
            selectedTagIds={selectedTagIds}
          />
        </Card>

        {/* Journal */}
        <Card title="Trade Journal">
          <JournalEditor tradeId={trade.id} initial={trade.journal} />
        </Card>

        {/* Screenshot */}
        <Card title="Screenshot">
          <ScreenshotUploader
            tradeId={trade.id}
            userId={user.id}
            existingUrl={screenshotUrl}
          />
        </Card>
      </div>
    </div>
  );
}
