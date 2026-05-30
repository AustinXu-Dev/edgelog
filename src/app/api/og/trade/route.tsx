import { ImageResponse } from 'next/og';
import { POINT_VALUES } from '@/lib/utils/csv';
import { formatCurrency, formatR } from '@/lib/utils/formatters';

const BG = '#0d1117';
const BG2 = '#111827';

function formatDuration(entry: string, exit: string | null): string {
  if (!exit) return '—';
  const ms = new Date(exit).getTime() - new Date(entry).getTime();
  const totalMins = Math.floor(ms / 60000);
  if (totalMins < 1) return '<1m';
  const hours = Math.floor(totalMins / 60);
  const mins = totalMins % 60;
  if (hours > 0) return mins > 0 ? `${hours}h ${mins}m` : `${hours}h`;
  return `${mins}m`;
}

function formatPrice(value: number): string {
  if (value >= 1000) return value.toLocaleString('en-US', { maximumFractionDigits: 2 });
  return value.toFixed(value < 10 ? 5 : 4);
}

// Module-level font cache — persists across requests in the same server instance
const fontCache = new Map<number, ArrayBuffer>();

async function loadFont(weight: number): Promise<ArrayBuffer> {
  if (fontCache.has(weight)) return fontCache.get(weight)!;
  // Use old IE UA so Google Fonts returns TTF (supported by all Satori versions)
  const css = await fetch(
    `https://fonts.googleapis.com/css2?family=Inter:wght@${weight}&display=swap`,
    { headers: { 'User-Agent': 'Mozilla/5.0 (compatible; Googlebot/2.1; +http://www.google.com/bot.html)' } }
  ).then((r) => r.text());
  const url = css.match(/src: url\(([^)]+)\)/)?.[1];
  if (!url) throw new Error(`Font URL not found for Inter ${weight}`);
  const data = await fetch(url).then((r) => r.arrayBuffer());
  fontCache.set(weight, data);
  return data;
}

interface Strategy { id: string; name: string; color: string }

interface TradeData {
  instrument: string;
  direction: string;
  entry_price: number;
  exit_price: number | null;
  net_pnl: number | null;
  r_multiple: number | null;
  position_size: number;
  stop_loss_planned: number | null;
  take_profit_planned: number | null;
  entry_datetime: string;
  exit_datetime: string | null;
  strategies?: Strategy[];
}

export async function POST(req: Request) {
  const trade: TradeData = await req.json();

  const isWin = (trade.net_pnl ?? 0) >= 0;
  const accent = isWin ? '#4ade80' : '#f87171';
  const pnlColor = isWin ? '#4ade80' : '#f87171';
  const pointValue = POINT_VALUES[trade.instrument] ?? 1;
  const riskAmount =
    trade.stop_loss_planned !== null
      ? Math.abs(trade.entry_price - trade.stop_loss_planned) * trade.position_size * pointValue
      : null;
  const roi = trade.r_multiple !== null ? trade.r_multiple * 100 : null;
  const strategies = trade.strategies ?? [];
  const hasStrategies = strategies.length > 0;

  // Height: base 398px + strategies rows
  const height = 398 + (hasStrategies ? 16 + Math.ceil(strategies.length / 4) * 38 : 0);

  const stats = [
    { label: 'Contracts', value: String(trade.position_size) },
    { label: 'Risk $', value: riskAmount !== null ? formatCurrency(riskAmount, 0) : '—' },
    { label: 'Entry', value: trade.entry_price != null ? formatPrice(trade.entry_price) : '—' },
    { label: 'Exit', value: trade.exit_price != null ? formatPrice(trade.exit_price) : '—' },
    // { label: 'Stop', value: trade.stop_loss_planned != null ? formatPrice(trade.stop_loss_planned) : '—' },
    // { label: 'Target', value: trade.take_profit_planned != null ? formatPrice(trade.take_profit_planned) : '—' },
  ];

  const [font400, font600, font800] = await Promise.all([
    loadFont(400),
    loadFont(600),
    loadFont(800),
  ]);

  return new ImageResponse(
    (
      <div
        style={{
          width: 440,
          height,
          display: 'flex',
          flexDirection: 'column',
          background: BG,
          borderRadius: 20,
          overflow: 'hidden',
          fontFamily: 'Inter',
        }}
      >
        {/* Accent bar */}
        <div style={{ height: 4, background: accent, flexShrink: 0 }} />

        {/* Body */}
        <div style={{ display: 'flex', flexDirection: 'column', padding: 24, flex: 1 }}>

          {/* Instrument + direction */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 6 }}>
            <div style={{ color: '#f9fafb', fontSize: 20, fontWeight: 700, letterSpacing: -0.3 }}>
              {trade.instrument}
            </div>
            <div style={{
              padding: '4px 10px',
              borderRadius: 99,
              fontSize: 12,
              fontWeight: 600,
              background: trade.direction === 'long' ? 'rgba(74,222,128,0.15)' : 'rgba(248,113,113,0.15)',
              color: trade.direction === 'long' ? '#4ade80' : '#f87171',
              border: `1px solid ${trade.direction === 'long' ? 'rgba(74,222,128,0.3)' : 'rgba(248,113,113,0.3)'}`,
            }}>
              {trade.direction === 'long' ? '↑ LONG' : '↓ SHORT'}
            </div>
          </div>

          {/* Prices + duration */}
          <div style={{ display: 'flex', alignItems: 'center', marginBottom: 20 }}>
            {/* <div style={{ color: '#6b7280', fontSize: 13 }}>{formatPrice(trade.entry_price)}</div>
            <div style={{ color: '#374151', fontSize: 13, margin: '0 6px' }}>→</div>
            <div style={{ color: '#6b7280', fontSize: 13 }}>{trade.exit_price != null ? formatPrice(trade.exit_price) : '—'}</div> */}
            
            <div style={{ color: '#6b7280', fontSize: 13 }}>Trade Duration</div>
            <div style={{ color: '#374151', fontSize: 13, margin: '0 6px' }}>•</div>
            <div style={{ color: '#6b7280', fontSize: 13 }}>{formatDuration(trade.entry_datetime, trade.exit_datetime)}</div>
          </div>

          {/* P&L */}
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '16px 0', marginBottom: 16 }}>
            <div style={{ fontSize: 42, fontWeight: 800, color: pnlColor, letterSpacing: -1, lineHeight: 1 }}>
              {trade.net_pnl !== null ? formatCurrency(trade.net_pnl) : '—'}
            </div>
            <div style={{ fontSize: 12, color: '#4b5563', marginTop: 4 }}>Net P&L</div>
          </div>

          {/* R + ROI */}
          <div style={{ display: 'flex', marginBottom: 20 }}>
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', background: BG2, borderRadius: 10, padding: 12, marginRight: 6 }}>
              <div style={{ fontSize: 11, color: '#6b7280', marginBottom: 4, textTransform: 'uppercase', letterSpacing: '0.05em' }}>R-Multiple</div>
              <div style={{ fontSize: 22, fontWeight: 700, color: trade.r_multiple !== null ? pnlColor : '#9ca3af' }}>
                {formatR(trade.r_multiple)}
              </div>
            </div>
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', background: BG2, borderRadius: 10, padding: 12 }}>
              <div style={{ fontSize: 11, color: '#6b7280', marginBottom: 4, textTransform: 'uppercase', letterSpacing: '0.05em' }}>ROI on Risk</div>
              <div style={{ fontSize: 22, fontWeight: 700, color: roi !== null ? pnlColor : '#9ca3af' }}>
                {roi !== null ? `${roi >= 0 ? '+' : ''}${roi.toFixed(0)}%` : '—'}
              </div>
            </div>
          </div>

          {/* Divider */}
          <div style={{ height: 1, background: '#1f2937', marginBottom: 16 }} />

          {/* 4-stat row */}
          <div style={{ display: 'flex', marginBottom: hasStrategies ? 16 : 0 }}>
            {stats.map(({ label, value }, i) => (
              <div
                key={label}
                style={{
                  flex: 1,
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  borderRight: i < stats.length - 1 ? '1px solid #1f2937' : 'none',
                }}
              >
                <div style={{ fontSize: 10, color: '#6b7280', marginBottom: 3, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                  {label}
                </div>
                <div style={{ fontSize: 13, fontWeight: 600, color: '#d1d5db' }}>
                  {value}
                </div>
              </div>
            ))}
          </div>

          {/* Strategy tags */}
          {hasStrategies && (
            <div style={{ display: 'flex', flexWrap: 'wrap' }}>
              {strategies.map((s, i) => (
                <div
                  key={s.id}
                  style={{
                    display: 'flex',
                    padding: '3px 10px',
                    borderRadius: 99,
                    fontSize: 11,
                    fontWeight: 500,
                    background: `${s.color}20`,
                    color: s.color,
                    border: `1px solid ${s.color}40`,
                    marginRight: i < strategies.length - 1 ? 6 : 0,
                  }}
                >
                  {s.name}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer divider */}
        <div style={{ height: 1, background: '#1f2937', flexShrink: 0 }} />
        {/* Footer */}
        <div style={{ display: 'flex', padding: '10px 24px', justifyContent: 'flex-end', alignItems: 'center', flexShrink: 0 }}>
          <div style={{ fontSize: 11, color: '#374151', fontWeight: 600, letterSpacing: '0.05em' }}>edgelog</div>
        </div>
      </div>
    ),
    {
      width: 440,
      height,
      fonts: [
        { name: 'Inter', data: font400, weight: 400 },
        { name: 'Inter', data: font600, weight: 600 },
        { name: 'Inter', data: font800, weight: 800 },
      ],
    }
  );
}
