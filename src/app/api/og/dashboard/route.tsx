import { ImageResponse } from 'next/og';
import { formatCurrency, formatPercent, formatR } from '@/lib/utils/formatters';

const BG = '#0d1117';
const BG2 = '#111827';

function formatShortCurrency(value: number): string {
  const abs = Math.abs(value);
  const sign = value < 0 ? '-' : '+';
  if (abs >= 1_000_000) return `${sign}$${(abs / 1_000_000).toFixed(1)}M`;
  if (abs >= 1_000) return `${sign}$${(abs / 1_000).toFixed(1)}K`;
  return `${sign}$${abs.toFixed(0)}`;
}

function formatPeriod(from?: string, to?: string): string {
  if (!from && !to) return 'All Time';
  const fmt = (iso: string) =>
    new Date(iso).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  if (from && to) return `${fmt(from)} – ${fmt(to)}`;
  if (from) return `From ${fmt(from)}`;
  return `To ${fmt(to!)}`;
}

const fontCache = new Map<number, ArrayBuffer>();

async function loadFont(weight: number): Promise<ArrayBuffer> {
  if (fontCache.has(weight)) return fontCache.get(weight)!;
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

interface PnLRow { instrument: string; total_pnl: number }

interface DashboardBody {
  metrics: {
    totalNetPnl: number;
    winRate: number;
    tradeCount: number;
    winCount: number;
    lossCount: number;
    avgRMultiple: number;
    grossProfit: number;
    grossLoss: number;
  };
  instrumentData: PnLRow[];
  winStreak: number;
  initialBalance: number;
  from?: string;
  to?: string;
}

export async function POST(req: Request) {
  const { metrics, instrumentData, winStreak, initialBalance, from, to }: DashboardBody = await req.json();

  const isPositive = metrics.totalNetPnl >= 0;
  const pnlColor = isPositive ? '#4ade80' : '#f87171';
  const roi = initialBalance > 0 ? (metrics.totalNetPnl / initialBalance) * 100 : null;
  const period = formatPeriod(from, to);
  const maxBar = Math.max(metrics.grossProfit, metrics.grossLoss, 1);
  const hasBars = metrics.grossProfit > 0 || metrics.grossLoss > 0;
  const topInstruments = [...instrumentData]
    .sort((a, b) => Math.abs(b.total_pnl) - Math.abs(a.total_pnl))
    .slice(0, 4);
  const hasStreak = winStreak >= 2;

  // Dynamic height
  let height = 24 + 40 + 42 + (roi !== null ? 20 : 0) + 20 + 90 + 24;
  if (hasBars) height += 70;
  if (topInstruments.length > 0) height += 38 + (hasStreak ? 16 : 0);
  if (hasStreak) height += 42;
  height += 30; // buffer

  const kpis = [
    { label: 'Win Rate', value: formatPercent(metrics.winRate), sub: `${metrics.winCount}W / ${metrics.lossCount}L` },
    { label: 'Trades', value: String(metrics.tradeCount), sub: 'closed' },
    { label: 'Avg R', value: formatR(metrics.avgRMultiple), sub: 'per trade' },
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
        <div style={{ display: 'flex', flexDirection: 'column', padding: 24 }}>

          {/* Header */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
            <div style={{ fontSize: 14, fontWeight: 700, color: '#374151', letterSpacing: '0.05em' }}>edgelog</div>
            <div style={{ padding: '3px 10px', borderRadius: 99, fontSize: 11, fontWeight: 500, background: BG2, color: '#9ca3af', border: '1px solid #374151' }}>
              {period}
            </div>
          </div>

          {/* P&L */}
          <div style={{ display: 'flex', flexDirection: 'column', marginBottom: 20 }}>
            <div style={{ fontSize: 42, fontWeight: 800, color: pnlColor, letterSpacing: -1, lineHeight: 1 }}>
              {formatCurrency(metrics.totalNetPnl)}
            </div>
            {roi !== null && (
              <div style={{ fontSize: 15, color: pnlColor, marginTop: 4, fontWeight: 500 }}>
                {roi >= 0 ? '+' : ''}{roi.toFixed(1)}% ROI
              </div>
            )}
          </div>

          {/* 3 KPIs */}
          <div style={{ display: 'flex', marginBottom: 20 }}>
            {kpis.map(({ label, value, sub }, i) => (
              <div key={label} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', background: BG2, borderRadius: 10, padding: 12, marginLeft: i > 0 ? 8 : 0 }}>
                <div style={{ fontSize: 10, color: '#6b7280', marginBottom: 4, textTransform: 'uppercase', letterSpacing: '0.05em' }}>{label}</div>
                <div style={{ fontSize: 20, fontWeight: 700, color: '#f9fafb' }}>{value}</div>
                <div style={{ fontSize: 10, color: '#4b5563', marginTop: 2 }}>{sub}</div>
              </div>
            ))}
          </div>

          {/* Profit / Loss bars */}
          {hasBars && (
            <div style={{ display: 'flex', flexDirection: 'column', marginBottom: 20 }}>
              {/* Profit bar */}
              <div style={{ display: 'flex', flexDirection: 'column', marginBottom: 8 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                  <div style={{ fontSize: 11, color: '#6b7280' }}>Gross Profit</div>
                  <div style={{ fontSize: 11, fontWeight: 600, color: '#4ade80' }}>{formatShortCurrency(metrics.grossProfit)}</div>
                </div>
                <div style={{ height: 6, borderRadius: 3, background: '#1f2937', overflow: 'hidden' }}>
                  <div style={{ height: 6, borderRadius: 3, background: '#4ade80', width: `${(metrics.grossProfit / maxBar) * 100}%` }} />
                </div>
              </div>
              {/* Loss bar */}
              <div style={{ display: 'flex', flexDirection: 'column' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                  <div style={{ fontSize: 11, color: '#6b7280' }}>Gross Loss</div>
                  <div style={{ fontSize: 11, fontWeight: 600, color: '#f87171' }}>{formatShortCurrency(-metrics.grossLoss)}</div>
                </div>
                <div style={{ height: 6, borderRadius: 3, background: '#1f2937', overflow: 'hidden' }}>
                  <div style={{ height: 6, borderRadius: 3, background: '#f87171', width: `${(metrics.grossLoss / maxBar) * 100}%` }} />
                </div>
              </div>
            </div>
          )}

          {/* Instrument chips */}
          {topInstruments.length > 0 && (
            <div style={{ display: 'flex', flexWrap: 'wrap', marginBottom: hasStreak ? 16 : 0 }}>
              {topInstruments.map((inst, i) => {
                const pos = inst.total_pnl >= 0;
                return (
                  <div
                    key={inst.instrument}
                    style={{
                      display: 'flex',
                      padding: '4px 10px',
                      borderRadius: 99,
                      fontSize: 11,
                      fontWeight: 500,
                      background: pos ? 'rgba(74,222,128,0.1)' : 'rgba(248,113,113,0.1)',
                      color: pos ? '#4ade80' : '#f87171',
                      border: `1px solid ${pos ? 'rgba(74,222,128,0.25)' : 'rgba(248,113,113,0.25)'}`,
                      marginRight: i < topInstruments.length - 1 ? 6 : 0,
                      marginBottom: 6,
                    }}
                  >
                    {inst.instrument} {formatShortCurrency(inst.total_pnl)}
                  </div>
                );
              })}
            </div>
          )}

          {/* Win streak */}
          {hasStreak && (
            <div style={{ display: 'inline-flex', alignItems: 'center', padding: '6px 14px', borderRadius: 99, background: 'rgba(251,191,36,0.1)', border: '1px solid rgba(251,191,36,0.3)' }}>
              <div style={{ fontSize: 12, fontWeight: 600, color: '#fbbf24' }}>
                {winStreak}-trade win streak
              </div>
            </div>
          )}
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
