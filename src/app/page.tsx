import Link from 'next/link';
import {
  List,
  TrendingUp,
  BookOpen,
  Upload,
  BarChart3,
  Lock,
  ArrowRight,
  Check,
  ChevronRight,
  LayoutDashboard,
  Settings,
  Plus,
} from 'lucide-react';
import { MarketingNav } from '@/components/marketing/MarketingNav';
import { FAQAccordion } from '@/components/marketing/FAQAccordion';

// ─── Feature cards ────────────────────────────────────────────────────────────

const features = [
  {
    icon: List,
    title: 'Trade Logging',
    description: 'Log entries in seconds. Tag, categorize, and annotate every trade with the detail it deserves.',
  },
  {
    icon: TrendingUp,
    title: 'P&L Analytics',
    description: 'Track your equity curve, win rate, and R-multiples automatically. No spreadsheets needed.',
  },
  {
    icon: BookOpen,
    title: 'Daily Journal',
    description: 'Reflect on your trading day. Note emotions, market context, and lessons learned.',
  },
  {
    icon: Upload,
    title: 'Import Trades',
    description: 'CSV import from any broker. NQ, ES, NDX100, SPX500 point values are built in.',
  },
  {
    icon: BarChart3,
    title: 'Visual Analytics',
    description: 'Interactive charts powered by Recharts. Spot patterns across instruments, sessions, and days.',
  },
  {
    icon: Lock,
    title: 'Secure & Private',
    description: 'Your data is yours. Row-level security ensures only you can access your journal.',
  },
];

// ─── Testimonials ─────────────────────────────────────────────────────────────

const testimonials = [
  {
    quote:
      "After six months of journaling in Edgelog, my win rate went from 42% to 58%. The daily reflection habit alone was worth it.",
    name: 'Marcus R.',
    role: 'NQ Futures Trader',
  },
  {
    quote:
      "I've tried three other journal apps. Edgelog is the only one I've stuck with — it's fast, clean, and doesn't get in my way.",
    name: 'Sarah K.',
    role: 'ES Day Trader',
  },
  {
    quote:
      'The CSV import saved me hours of manual logging. I had 6 months of trades imported and analyzed in under 10 minutes.',
    name: 'David L.',
    role: 'Futures Trader',
  },
];

// ─── Pricing features ─────────────────────────────────────────────────────────

const pricingFeatures = [
  'Unlimited trades',
  'CSV import',
  'P&L analytics & equity curve',
  'Daily journal',
  'Per-trade notes & screenshots',
  'Multiple trading accounts',
  'Tag system',
];

// ─── App mockup ───────────────────────────────────────────────────────────────

function AppMockup() {
  const navItems = [
    { label: 'Dashboard', Icon: LayoutDashboard, active: true },
    { label: 'Trades', Icon: BarChart3, active: false },
    { label: 'Journal', Icon: BookOpen, active: false },
    { label: 'Settings', Icon: Settings, active: false },
  ];

  // March 2025: Mar 1 = Saturday (firstDay=6)
  const calRows: { days: (number | null)[]; types: string[]; week: string | null }[] = [
    { days: [null,null,null,null,null,null,1], types: ['','','','','','','n'], week: null },
    { days: [2,3,4,5,6,7,8],    types: ['n','m','G','m','r','m','n'], week: '+$2.6k' },
    { days: [9,10,11,12,13,14,15],  types: ['n','m','r','m','G','n','n'], week: '+$3.2k' },
    { days: [16,17,18,19,20,21,22], types: ['n','G','m','r','m','m','n'], week: '+$2.8k' },
    { days: [23,24,25,26,27,28,29], types: ['n','r','m','m','G','m','n'], week: '+$2.2k' },
    { days: [30,31,null,null,null,null,null], types: ['n','m','','','','',''], week: '+$0.8k' },
  ];

  const dayBg: Record<string, string> = {
    G: 'bg-emerald-500', m: 'bg-emerald-300', r: 'bg-red-300', n: 'bg-gray-100', '': '',
  };
  const dayTxt: Record<string, string> = {
    G: 'text-emerald-900', m: 'text-emerald-900', r: 'text-red-900', n: 'text-gray-400', '': '',
  };

  return (
    <div className="relative w-full max-w-4xl mx-auto">
      <div className="rounded-xl overflow-hidden shadow-2xl border border-gray-200 bg-white">
        {/* Window chrome */}
        <div className="bg-gray-900 px-4 py-3 flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-red-400" />
          <div className="w-3 h-3 rounded-full bg-yellow-400" />
          <div className="w-3 h-3 rounded-full bg-emerald-400" />
          <span className="ml-3 text-xs text-gray-400 font-mono">edgelog.app/dashboard</span>
        </div>

        {/* App shell */}
        <div className="flex" style={{ height: '480px' }}>
          {/* Sidebar — real: bg-white border-r border-gray-200 */}
          <div className="hidden sm:flex w-48 bg-white border-r border-gray-200 flex-col flex-shrink-0">
            {/* Logo — real: px-5 py-5 border-b font-bold */}
            <div className="px-4 py-3.5 border-b border-gray-200">
              <span className="text-sm font-bold text-gray-900 tracking-tight">Edgelog</span>
            </div>
            {/* Account section */}
            <div className="px-3 py-2.5 border-b border-gray-200">
              <div className="text-[9px] text-gray-400 uppercase tracking-wide mb-1">Main Account</div>
              <div className="text-sm font-bold text-gray-900 font-mono">$28,640.00</div>
              <div className="text-[10px] text-emerald-600 font-mono mt-0.5">+$8,640.00 P&L</div>
            </div>
            {/* Nav — real: active = bg-blue-50 text-blue-600 (NOT bg-blue-600) */}
            <nav className="flex-1 px-2 py-2 flex flex-col gap-0.5">
              {navItems.map(({ label, Icon, active }) => (
                <div
                  key={label}
                  className={`flex items-center gap-2.5 px-2.5 py-1.5 rounded-lg text-xs font-medium ${
                    active ? 'bg-blue-50 text-blue-600' : 'text-gray-600'
                  }`}
                >
                  <Icon className="w-3.5 h-3.5 flex-shrink-0" />
                  {label}
                </div>
              ))}
              {/* New Trade CTA */}
              <div className="mt-3 pt-3 border-t border-gray-200">
                <div className="flex items-center justify-center gap-1.5 px-2.5 py-1.5 bg-blue-600 text-white rounded-lg text-xs font-medium">
                  <Plus className="w-3 h-3" />
                  New Trade
                </div>
              </div>
            </nav>
            {/* User footer */}
            <div className="px-4 py-2.5 border-t border-gray-200">
              <p className="text-[10px] text-gray-400 truncate">trader@email.com</p>
            </div>
          </div>

          {/* Main content */}
          <div className="flex-1 bg-gray-50 flex flex-col overflow-hidden">
            {/* Topbar — real: bg-white border-b, title text-lg font-semibold */}
            <div className="bg-white border-b border-gray-200 px-4 py-2.5 flex items-center justify-between flex-shrink-0">
              <span className="text-sm font-semibold text-gray-900">Dashboard</span>
              <span className="text-[10px] text-gray-500 bg-gray-100 px-2 py-0.5 rounded">Mar 1 – Mar 31, 2025</span>
            </div>

            <div className="flex-1 overflow-y-auto p-3 space-y-2.5">

              {/* KPI row — real: rounded-xl p-5, label text-[11px] uppercase tracking-wide, value text-2xl font-bold */}
              <div className="grid grid-cols-4 gap-2">
                {[
                  { label: 'Total Net P&L', value: '+$8,640', sub: '33 trades', color: 'text-emerald-600' },
                  { label: 'Win Rate', value: '67%', sub: '22W / 11L', color: 'text-gray-900' },
                  { label: 'Profit Factor', value: '2.40', sub: undefined, color: 'text-gray-900' },
                  { label: 'Avg R-Multiple', value: '+1.90R', sub: undefined, color: 'text-gray-900' },
                ].map((m) => (
                  <div key={m.label} className="bg-white border border-gray-200 rounded-xl shadow-sm p-2.5">
                    <p className="text-[9px] font-semibold text-gray-500 uppercase tracking-wide">{m.label}</p>
                    <p className={`text-sm font-bold mt-0.5 font-mono ${m.color}`}>{m.value}</p>
                    {m.sub && <p className="text-[9px] text-gray-500 mt-0.5">{m.sub}</p>}
                  </div>
                ))}
              </div>

              {/* Equity Curve — real: Card rounded-xl, title text-[11px] uppercase tracking-wide */}
              <div className="bg-white border border-gray-200 rounded-xl shadow-sm p-3">
                <p className="text-[9px] font-semibold text-gray-500 uppercase tracking-wide mb-2">Equity Curve</p>
                <svg viewBox="0 0 400 52" className="w-full" style={{ height: '52px' }}>
                  <defs>
                    <linearGradient id="eqGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#2563eb" stopOpacity="0.12" />
                      <stop offset="100%" stopColor="#2563eb" stopOpacity="0" />
                    </linearGradient>
                  </defs>
                  {[13, 26, 39].map((y) => (
                    <line key={y} x1="0" y1={y} x2="400" y2={y} stroke="#f3f4f6" strokeWidth="1" />
                  ))}
                  <path
                    d="M0,48 C12,46 20,43 32,41 C44,39 52,44 64,41 C76,38 84,33 96,30 C108,27 116,31 128,28 C140,25 148,20 160,17 C172,14 180,19 190,16 C200,13 210,8 222,6 C234,3 242,6 252,4 C262,2 270,1 280,2 C290,1 298,3 308,2 C318,1 328,2 338,1 C348,1 358,2 368,1 C378,1 388,1 400,1"
                    fill="none" stroke="#2563eb" strokeWidth="1.5" strokeLinecap="round"
                  />
                  <path
                    d="M0,48 C12,46 20,43 32,41 C44,39 52,44 64,41 C76,38 84,33 96,30 C108,27 116,31 128,28 C140,25 148,20 160,17 C172,14 180,19 190,16 C200,13 210,8 222,6 C234,3 242,6 252,4 C262,2 270,1 280,2 C290,1 298,3 308,2 C318,1 328,2 338,1 C348,1 358,2 368,1 C378,1 388,1 400,1 L400,52 L0,52 Z"
                    fill="url(#eqGrad)"
                  />
                </svg>
              </div>

              {/* Charts row — real: grid-cols-3 (Instrument | DoW | ToD), all vertical bar charts via Recharts */}
              <div className="grid grid-cols-3 gap-2">

                {/* P&L by Instrument — SVG vertical bar chart matching Recharts output */}
                <div className="bg-white border border-gray-200 rounded-xl shadow-sm p-2.5">
                  <p className="text-[9px] font-semibold text-gray-500 uppercase tracking-wide mb-1">P&L by Instrument</p>
                  <svg viewBox="0 0 130 78" className="w-full" style={{ height: '78px' }}>
                    {/* Y-axis grid lines */}
                    <line x1="28" y1="4"  x2="128" y2="4"  stroke="#f3f4f6" strokeWidth="1" />
                    <line x1="28" y1="24" x2="128" y2="24" stroke="#f3f4f6" strokeWidth="1" />
                    <line x1="28" y1="44" x2="128" y2="44" stroke="#f3f4f6" strokeWidth="1" />
                    <line x1="28" y1="64" x2="128" y2="64" stroke="#f3f4f6" strokeWidth="1" />
                    {/* Y-axis labels */}
                    <text x="26" y="7"  textAnchor="end" fontSize="6" fill="#9ca3af">$5k</text>
                    <text x="26" y="27" textAnchor="end" fontSize="6" fill="#9ca3af">$3k</text>
                    <text x="26" y="47" textAnchor="end" fontSize="6" fill="#9ca3af">$1k</text>
                    <text x="26" y="67" textAnchor="end" fontSize="6" fill="#9ca3af">$0</text>
                    {/* Bars from baseline y=64, green (#059669), radius top */}
                    {/* NQ $5.1k → h=60 */}
                    <rect x="32" y="4"  width="14" height="60" rx="2" ry="2" fill="#059669" />
                    {/* EUR/USD $2.3k → h=27 */}
                    <rect x="57" y="37" width="14" height="27" rx="2" ry="2" fill="#059669" />
                    {/* ES $0.9k → h=11 */}
                    <rect x="82" y="53" width="14" height="11" rx="2" ry="2" fill="#059669" />
                    {/* BTC $0.3k → h=4 */}
                    <rect x="107" y="60" width="14" height="4" rx="2" ry="2" fill="#059669" />
                    {/* X-axis labels */}
                    <text x="39"  y="75" textAnchor="middle" fontSize="6"   fill="#9ca3af">NQ</text>
                    <text x="64"  y="75" textAnchor="middle" fontSize="5.5" fill="#9ca3af">EUR</text>
                    <text x="89"  y="75" textAnchor="middle" fontSize="6"   fill="#9ca3af">ES</text>
                    <text x="114" y="75" textAnchor="middle" fontSize="5.5" fill="#9ca3af">BTC</text>
                  </svg>
                </div>

                {/* P&L by Day of Week — SVG vertical bar chart with zero line */}
                <div className="bg-white border border-gray-200 rounded-xl shadow-sm p-2.5">
                  <p className="text-[9px] font-semibold text-gray-500 uppercase tracking-wide mb-1">P&L by Day of Week</p>
                  <svg viewBox="0 0 130 78" className="w-full" style={{ height: '78px' }}>
                    {/* Grid lines */}
                    <line x1="28" y1="4"  x2="128" y2="4"  stroke="#f3f4f6" strokeWidth="1" />
                    <line x1="28" y1="24" x2="128" y2="24" stroke="#f3f4f6" strokeWidth="1" />
                    {/* Zero line */}
                    <line x1="28" y1="52" x2="128" y2="52" stroke="#e5e7eb" strokeWidth="1" />
                    {/* Y-axis labels */}
                    <text x="26" y="7"  textAnchor="end" fontSize="6" fill="#9ca3af">$3k</text>
                    <text x="26" y="27" textAnchor="end" fontSize="6" fill="#9ca3af">$1k</text>
                    <text x="26" y="55" textAnchor="end" fontSize="6" fill="#9ca3af">$0</text>
                    {/* Bars from zero line y=52 */}
                    {/* Mon +$1.2k → h=22 up */}
                    <rect x="30" y="30" width="12" height="22" rx="2" ry="2" fill="#059669" />
                    {/* Tue +$2.6k → h=48 up */}
                    <rect x="50" y="4"  width="12" height="48" rx="2" ry="2" fill="#059669" />
                    {/* Wed -$320 → h=6 down (red) */}
                    <rect x="70" y="52" width="12" height="6"  rx="2" ry="2" fill="#dc2626" />
                    {/* Thu +$1.8k → h=33 up */}
                    <rect x="90" y="19" width="12" height="33" rx="2" ry="2" fill="#059669" />
                    {/* Fri +$2.4k → h=44 up */}
                    <rect x="110" y="8" width="12" height="44" rx="2" ry="2" fill="#059669" />
                    {/* X-axis labels */}
                    <text x="36"  y="70" textAnchor="middle" fontSize="6" fill="#9ca3af">Mon</text>
                    <text x="56"  y="70" textAnchor="middle" fontSize="6" fill="#9ca3af">Tue</text>
                    <text x="76"  y="70" textAnchor="middle" fontSize="6" fill="#9ca3af">Wed</text>
                    <text x="96"  y="70" textAnchor="middle" fontSize="6" fill="#9ca3af">Thu</text>
                    <text x="116" y="70" textAnchor="middle" fontSize="6" fill="#9ca3af">Fri</text>
                  </svg>
                </div>

                {/* P&L by Time of Day — SVG vertical bar chart */}
                <div className="bg-white border border-gray-200 rounded-xl shadow-sm p-2.5">
                  <p className="text-[9px] font-semibold text-gray-500 uppercase tracking-wide mb-1">P&L by Time of Day</p>
                  <svg viewBox="0 0 130 78" className="w-full" style={{ height: '78px' }}>
                    {/* Grid lines */}
                    <line x1="28" y1="4"  x2="128" y2="4"  stroke="#f3f4f6" strokeWidth="1" />
                    <line x1="28" y1="24" x2="128" y2="24" stroke="#f3f4f6" strokeWidth="1" />
                    {/* Zero line */}
                    <line x1="28" y1="56" x2="128" y2="56" stroke="#e5e7eb" strokeWidth="1" />
                    {/* Y-axis labels */}
                    <text x="26" y="7"  textAnchor="end" fontSize="6" fill="#9ca3af">$2k</text>
                    <text x="26" y="59" textAnchor="end" fontSize="6" fill="#9ca3af">$0</text>
                    {/* 8 bars (9am–4pm) */}
                    <rect x="30" y="56" width="9" height="5"  rx="1" fill="#dc2626" />
                    <rect x="41" y="35" width="9" height="21" rx="1" fill="#059669" />
                    <rect x="52" y="20" width="9" height="36" rx="1" fill="#059669" />
                    <rect x="63" y="42" width="9" height="14" rx="1" fill="#059669" />
                    <rect x="74" y="56" width="9" height="7"  rx="1" fill="#dc2626" />
                    <rect x="85" y="30" width="9" height="26" rx="1" fill="#059669" />
                    <rect x="96" y="46" width="9" height="10" rx="1" fill="#059669" />
                    <rect x="107" y="56" width="9" height="3" rx="1" fill="#dc2626" />
                    {/* X-axis labels */}
                    <text x="34"  y="72" textAnchor="middle" fontSize="5.5" fill="#9ca3af">9am</text>
                    <text x="79"  y="72" textAnchor="middle" fontSize="5.5" fill="#9ca3af">1pm</text>
                    <text x="116" y="72" textAnchor="middle" fontSize="5.5" fill="#9ca3af">4pm</text>
                  </svg>
                </div>
              </div>

              {/* Bottom row — real: grid-cols-2 (Calendar | Recent Trades) */}
              <div className="grid grid-cols-2 gap-2">

                {/* Monthly P&L Calendar — heatmap grid matching real CalendarHeatmap */}
                <div className="bg-white border border-gray-200 rounded-xl shadow-sm p-2.5">
                  <p className="text-[9px] font-semibold text-gray-500 uppercase tracking-wide mb-1.5">Monthly P&L Calendar</p>
                  {/* Header: ‹ Month Year [total] › */}
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-[9px] text-gray-500 font-bold leading-none">‹</span>
                    <div className="flex items-center gap-1">
                      <span className="text-[9px] font-semibold text-gray-800">March 2025</span>
                      <span className="text-[7px] font-mono font-semibold text-emerald-700 bg-emerald-50 px-1 py-0.5 rounded">+$8.6k</span>
                    </div>
                    <span className="text-[9px] text-gray-500 font-bold leading-none">›</span>
                  </div>
                  {/* Day labels: Sun Mon Tue Wed Thu Fri Sat | Week */}
                  <div className="grid gap-0.5 mb-0.5" style={{ gridTemplateColumns: 'repeat(7, 1fr) 26px' }}>
                    {['S','M','T','W','T','F','S','W'].map((d, i) => (
                      <div key={i} className="text-center text-[7px] text-gray-400 font-medium">{d}</div>
                    ))}
                  </div>
                  {/* Calendar weeks */}
                  {calRows.map((row, wi) => (
                    <div key={wi} className="grid gap-0.5 mb-0.5" style={{ gridTemplateColumns: 'repeat(7, 1fr) 26px' }}>
                      {row.days.map((day, di) => {
                        if (day === null) return <div key={di} />;
                        const t = row.types[di];
                        if (t === '') return <div key={di} />;
                        return (
                          <div key={di} className={`rounded flex items-center justify-center ${dayBg[t]}`} style={{ minHeight: '16px' }}>
                            <span className={`text-[7px] font-semibold leading-none ${dayTxt[t]}`}>{day}</span>
                          </div>
                        );
                      })}
                      {/* Weekly total */}
                      {row.week ? (
                        <div className="rounded bg-emerald-50 border border-emerald-200 flex items-center justify-center" style={{ minHeight: '16px' }}>
                          <span className="text-[6px] font-mono text-emerald-700 font-semibold leading-none">{row.week}</span>
                        </div>
                      ) : <div />}
                    </div>
                  ))}
                </div>

                {/* Recent Trades — real: table with header */}
                <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">
                  <p className="text-[9px] font-semibold text-gray-500 uppercase tracking-wide px-3 pt-2 pb-1 border-b border-gray-100">Recent Trades</p>
                  <table className="w-full">
                    <thead>
                      <tr className="bg-gray-50 border-b border-gray-200">
                        {['Date', 'Instrument', 'Dir', 'Net P&L', 'R'].map((h) => (
                          <th key={h} className="text-left py-1.5 px-2 text-[8px] text-gray-500 font-semibold uppercase tracking-wide whitespace-nowrap">{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {[
                        { date: 'Mar 31', sym: 'NQ',      dir: 'long',  pnl: '+$640', r: '+3.20R' },
                        { date: 'Mar 31', sym: 'EUR/USD',  dir: 'long',  pnl: '+$480', r: '+2.10R' },
                        { date: 'Mar 30', sym: 'ES',       dir: 'short', pnl: '-$125', r: '-0.50R' },
                        { date: 'Mar 29', sym: 'NQ',       dir: 'long',  pnl: '+$320', r: '+1.80R' },
                        { date: 'Mar 28', sym: 'NQ',       dir: 'long',  pnl: '+$800', r: '+4.20R' },
                        { date: 'Mar 27', sym: 'BTC/USD',  dir: 'long',  pnl: '+$340', r: '+1.40R' },
                      ].map((t, i) => (
                        <tr key={i} className="hover:bg-gray-50">
                          <td className="py-1.5 px-2 text-[8px] text-gray-400 whitespace-nowrap">{t.date}</td>
                          <td className="py-1.5 px-2 text-[8px] font-medium font-mono text-gray-900">{t.sym}</td>
                          <td className="py-1.5 px-2">
                            <span className={`text-xs font-bold ${t.dir === 'long' ? 'text-emerald-600' : 'text-red-500'}`}>{t.dir === 'long' ? '↑' : '↓'}</span>
                          </td>
                          <td className={`py-1.5 px-2 text-[8px] font-mono font-medium ${t.pnl.startsWith('+') ? 'text-emerald-600' : 'text-red-500'}`}>{t.pnl}</td>
                          <td className="py-1.5 px-2 text-[8px] text-gray-500 font-mono">{t.r}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

              </div>

            </div>
          </div>
        </div>
      </div>

      {/* Glow effect */}
      <div className="absolute -inset-1 bg-blue-500/5 rounded-2xl blur-xl -z-10" />
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-white" style={{ scrollBehavior: 'smooth' }}>
      <MarketingNav />

      {/* ── Hero ── */}
      <section className="bg-white pt-16 pb-20 sm:pt-24 sm:pb-28 px-4">
        <div className="max-w-6xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 bg-blue-50 text-blue-700 text-xs font-medium px-3 py-1.5 rounded-full mb-6">
            <span className="w-1.5 h-1.5 rounded-full bg-blue-500" />
            Built for traders by traders
          </div>

          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-semibold tracking-tight text-gray-900 mb-6 leading-tight">
            Your trading edge starts
            <br />
            <span className="text-blue-600">with your journal</span>
          </h1>

          <p className="text-lg text-gray-600 max-w-xl mx-auto mb-8 leading-relaxed">
            Track, analyze, and improve your trades. The minimalist journal built for traders
            who take their craft seriously.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 mb-16">
            <Link
              href="/register"
              className="inline-flex items-center justify-center gap-2 px-6 py-3 text-base font-medium rounded-lg bg-blue-600 hover:bg-blue-700 text-white transition-colors shadow-sm"
            >
              Start Journaling Free
              <ArrowRight className="w-4 h-4" />
            </Link>
            <a
              href="#features"
              className="inline-flex items-center gap-1.5 text-sm text-gray-600 hover:text-gray-900 transition-colors py-3"
            >
              See how it works
              <ChevronRight className="w-4 h-4" />
            </a>
          </div>

          <AppMockup />

          {/* Stats pills */}
          <div className="flex flex-wrap justify-center gap-3 mt-10">
            {['500+ traders', '10,000+ trades logged', '4.9 / 5 rating'].map((stat) => (
              <span
                key={stat}
                className="bg-gray-100 text-gray-600 text-xs font-medium px-3 py-1.5 rounded-full"
              >
                {stat}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* ── Features ── */}
      <section id="features" className="bg-gray-50 py-20 sm:py-24 px-4 border-t border-gray-200">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-14">
            <p className="text-xs font-semibold uppercase tracking-widest text-blue-600 mb-3">
              Features
            </p>
            <h2 className="text-3xl sm:text-4xl font-semibold tracking-tight text-gray-900">
              Everything you need to trade better
            </h2>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map(({ icon: Icon, title, description }) => (
              <div
                key={title}
                className="bg-white rounded-xl border border-gray-200 shadow-sm p-6 hover:shadow-md transition-shadow"
              >
                <div className="w-9 h-9 rounded-lg bg-blue-50 flex items-center justify-center mb-4">
                  <Icon className="w-5 h-5 text-blue-600" />
                </div>
                <h3 className="font-semibold text-gray-900 mb-2">{title}</h3>
                <p className="text-sm text-gray-600 leading-relaxed">{description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── How it works ── */}
      <section className="bg-white py-20 sm:py-24 px-4 border-t border-gray-200">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-14">
            <p className="text-xs font-semibold uppercase tracking-widest text-blue-600 mb-3">
              How it works
            </p>
            <h2 className="text-3xl sm:text-4xl font-semibold tracking-tight text-gray-900">
              Start journaling in minutes
            </h2>
          </div>

          <div className="grid sm:grid-cols-3 gap-8 relative">
            {/* Connecting line (desktop) */}
            <div className="hidden sm:block absolute top-6 left-1/6 right-1/6 h-px bg-gray-200" />

            {[
              {
                step: '1',
                title: 'Import or add trades',
                description: 'Upload your broker CSV or log trades manually. Point values for major futures contracts are handled automatically.',
              },
              {
                step: '2',
                title: 'Tag and annotate',
                description: 'Add tags, write trade notes, rate your execution, and attach screenshots directly to each trade.',
              },
              {
                step: '3',
                title: 'Review and improve',
                description: 'Analyze patterns across instruments, sessions, and time of day. Spot what works and do more of it.',
              },
            ].map(({ step, title, description }) => (
              <div key={step} className="flex flex-col items-center text-center relative">
                <div className="w-12 h-12 rounded-full bg-blue-600 text-white flex items-center justify-center text-lg font-semibold mb-5 z-10 shadow-sm">
                  {step}
                </div>
                <h3 className="font-semibold text-gray-900 mb-2">{title}</h3>
                <p className="text-sm text-gray-600 leading-relaxed max-w-xs">{description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── App Preview ── */}
      <section className="bg-gray-50 py-20 sm:py-24 px-4 border-t border-gray-200">
        <div className="max-w-6xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            {/* Left: journal entry view */}
            <div className="rounded-xl overflow-hidden shadow-xl border border-gray-200 bg-white">
              <div className="bg-gray-900 px-4 py-3 flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-red-400" />
                <div className="w-3 h-3 rounded-full bg-yellow-400" />
                <div className="w-3 h-3 rounded-full bg-emerald-400" />
                <span className="ml-3 text-xs text-gray-400 font-mono">edgelog.app/journal/2025-03-31</span>
              </div>
              <div className="p-5">
                {/* Entry header */}
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <div className="text-sm font-semibold text-gray-900">Monday, March 31</div>
                    <div className="flex items-center gap-1.5 mt-1">
                      <span className="text-base">😊</span>
                      <span className="text-xs text-gray-500">Focused</span>
                      <span className="text-gray-200 mx-1">·</span>
                      <span className="text-xs text-gray-500">2 trades</span>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-sm font-mono font-semibold text-emerald-600">+$515</div>
                    <div className="text-xs text-gray-400 mt-0.5">net P&L</div>
                  </div>
                </div>

                {/* Reflection text */}
                <div className="bg-gray-50 rounded-lg p-3 mb-4 border border-gray-100">
                  <p className="text-xs text-gray-600 leading-relaxed">
                    Waited for the first pullback after open. Clean entry on NQ at 21,840 — respected the plan and let
                    the winner run to 3.2R. ES short was impulsive; should have passed on the setup. Overall happy
                    with discipline.
                  </p>
                </div>

                {/* Linked trades */}
                <div className="text-xs font-medium text-gray-500 mb-2">Linked Trades</div>
                <div className="space-y-2">
                  {[
                    { sym: 'NQ', dir: 'Long', entry: '21,840', pnl: '+$640', r: '3.2R', rating: 5 },
                    { sym: 'ES', dir: 'Short', entry: '5,918', pnl: '-$125', r: '-0.5R', rating: 2 },
                  ].map((t, i) => (
                    <div
                      key={i}
                      className="flex items-center gap-3 bg-gray-50 rounded-lg px-3 py-2.5 border border-gray-100"
                    >
                      <span className="font-mono text-xs font-semibold text-gray-800 w-14 flex-shrink-0">
                        {t.sym}
                      </span>
                      <span
                        className={`text-xs px-1.5 py-0.5 rounded flex-shrink-0 ${
                          t.dir === 'Long' ? 'bg-emerald-50 text-emerald-700' : 'bg-red-50 text-red-600'
                        }`}
                      >
                        {t.dir}
                      </span>
                      <span className="text-xs text-gray-400 flex-shrink-0 hidden sm:inline">{t.entry}</span>
                      <div className="flex-1 flex items-center gap-0.5">
                        {Array.from({ length: 5 }).map((_, j) => (
                          <span
                            key={j}
                            className={`text-sm leading-none ${j < t.rating ? 'text-yellow-400' : 'text-gray-200'}`}
                          >
                            ★
                          </span>
                        ))}
                      </div>
                      <span className="text-xs text-gray-400 flex-shrink-0">{t.r}</span>
                      <span
                        className={`text-xs font-mono font-semibold flex-shrink-0 ${
                          t.pnl.startsWith('+') ? 'text-emerald-600' : 'text-red-500'
                        }`}
                      >
                        {t.pnl}
                      </span>
                    </div>
                  ))}
                </div>

                {/* Recent entries list */}
                <div className="text-xs font-medium text-gray-500 mt-4 mb-2">Recent Entries</div>
                <div className="space-y-1.5">
                  {[
                    { date: 'Mar 28', mood: '😊', pnl: '+$800', tags: ['A+ Setup', 'Patient'] },
                    { date: 'Mar 27', mood: '😐', pnl: '+$120', tags: ['Choppy'] },
                    { date: 'Mar 26', mood: '😞', pnl: '-$380', tags: ['FOMO', 'Oversize'] },
                  ].map((entry) => (
                    <div
                      key={entry.date}
                      className="flex items-center gap-3 px-3 py-2 rounded-lg bg-gray-50 border border-gray-100"
                    >
                      <span className="text-base flex-shrink-0">{entry.mood}</span>
                      <span className="text-xs font-medium text-gray-700 w-12 flex-shrink-0">{entry.date}</span>
                      <div className="flex flex-1 gap-1 min-w-0">
                        {entry.tags.map((tag) => (
                          <span key={tag} className="text-xs bg-blue-50 text-blue-700 px-1.5 py-0.5 rounded truncate">
                            {tag}
                          </span>
                        ))}
                      </div>
                      <span
                        className={`text-xs font-mono font-semibold flex-shrink-0 ${
                          entry.pnl.startsWith('+') ? 'text-emerald-600' : 'text-red-500'
                        }`}
                      >
                        {entry.pnl}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Right: copy */}
            <div>
              <p className="text-xs font-semibold uppercase tracking-widest text-blue-600 mb-3">
                The details matter
              </p>
              <h2 className="text-3xl sm:text-4xl font-semibold tracking-tight text-gray-900 mb-6">
                Built by traders,
                <br />
                for traders
              </h2>
              <ul className="space-y-4 mb-8">
                {[
                  'Clean, distraction-free interface',
                  'Futures-focused — NQ, ES, and micros supported',
                  'Per-trade and daily journaling in one place',
                  'Multiple account support with balance tracking',
                  'Export your data anytime',
                ].map((point) => (
                  <li key={point} className="flex items-start gap-3">
                    <div className="w-5 h-5 rounded-full bg-emerald-50 flex items-center justify-center flex-shrink-0 mt-0.5">
                      <Check className="w-3 h-3 text-emerald-600" />
                    </div>
                    <span className="text-sm text-gray-700 leading-relaxed">{point}</span>
                  </li>
                ))}
              </ul>
              <Link
                href="/register"
                className="inline-flex items-center justify-center gap-2 px-6 py-3 text-base font-medium rounded-lg bg-blue-600 hover:bg-blue-700 text-white transition-colors shadow-sm"
              >
                Try it free
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ── Testimonials ── */}
      <section className="bg-white py-20 sm:py-24 px-4 border-t border-gray-200">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-14">
            <p className="text-xs font-semibold uppercase tracking-widest text-blue-600 mb-3">
              Traders love it
            </p>
            <h2 className="text-3xl sm:text-4xl font-semibold tracking-tight text-gray-900">
              Real results, real traders
            </h2>
          </div>

          <div className="grid sm:grid-cols-3 gap-6">
            {testimonials.map(({ quote, name, role }) => (
              <div
                key={name}
                className="bg-white rounded-xl border border-gray-200 shadow-sm p-6 flex flex-col gap-4"
              >
                <div className="flex gap-1 mb-1">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <svg key={i} className="w-4 h-4 text-yellow-400 fill-current" viewBox="0 0 20 20">
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                  ))}
                </div>
                <p className="text-sm text-gray-600 leading-relaxed flex-1">&ldquo;{quote}&rdquo;</p>
                <div className="flex items-center gap-3 pt-2 border-t border-gray-100">
                  <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center text-xs font-semibold text-gray-600">
                    {name[0]}
                  </div>
                  <div>
                    <div className="text-sm font-medium text-gray-900">{name}</div>
                    <div className="text-xs text-gray-400">{role}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Pricing ── */}
      <section id="pricing" className="bg-gray-50 py-20 sm:py-24 px-4 border-t border-gray-200">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-14">
            <p className="text-xs font-semibold uppercase tracking-widest text-blue-600 mb-3">
              Pricing
            </p>
            <h2 className="text-3xl sm:text-4xl font-semibold tracking-tight text-gray-900">
              Simple. Free. Forever.
            </h2>
            <p className="text-gray-600 mt-3 text-sm">No credit card required. No hidden tiers.</p>
          </div>

          <div className="max-w-sm mx-auto">
            <div className="bg-white rounded-xl border-2 border-blue-600 shadow-lg p-8 text-center">
              <div className="inline-block bg-blue-50 text-blue-700 text-xs font-semibold px-3 py-1 rounded-full mb-5">
                Free Forever
              </div>
              <div className="text-5xl font-semibold text-gray-900 mb-1">$0</div>
              <div className="text-sm text-gray-400 mb-8">per month</div>

              <ul className="space-y-3 mb-8 text-left">
                {pricingFeatures.map((f) => (
                  <li key={f} className="flex items-center gap-3">
                    <div className="w-5 h-5 rounded-full bg-emerald-50 flex items-center justify-center flex-shrink-0">
                      <Check className="w-3 h-3 text-emerald-600" />
                    </div>
                    <span className="text-sm text-gray-700">{f}</span>
                  </li>
                ))}
              </ul>

              <Link
                href="/register"
                className="block w-full py-3 text-sm font-medium rounded-lg bg-blue-600 hover:bg-blue-700 text-white transition-colors text-center"
              >
                Get Started
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ── FAQ ── */}
      <section id="faq" className="bg-white py-20 sm:py-24 px-4 border-t border-gray-200">
        <div className="max-w-2xl mx-auto">
          <div className="text-center mb-12">
            <p className="text-xs font-semibold uppercase tracking-widest text-blue-600 mb-3">
              FAQ
            </p>
            <h2 className="text-3xl sm:text-4xl font-semibold tracking-tight text-gray-900">
              Common questions
            </h2>
          </div>
          <FAQAccordion />
        </div>
      </section>

      {/* ── CTA Banner ── */}
      <section className="bg-blue-600 py-20 sm:py-24 px-4">
        <div className="max-w-6xl mx-auto text-center">
          <h2 className="text-3xl sm:text-4xl font-semibold tracking-tight text-white mb-4">
            Ready to improve your trading?
          </h2>
          <p className="text-blue-200 text-sm mb-8">
            Join 500+ traders who journal with Edgelog
          </p>
          <Link
            href="/register"
            className="inline-flex items-center justify-center gap-2 px-8 py-3 text-base font-medium rounded-lg bg-white hover:bg-gray-50 text-blue-600 transition-colors shadow-sm"
          >
            Start Free
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </section>

      {/* ── Footer ── */}
      <footer className="bg-gray-900 text-gray-400 py-14 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="grid sm:grid-cols-2 lg:grid-cols-5 gap-8 mb-12">
            {/* Brand */}
            <div className="lg:col-span-2">
              <div className="font-semibold text-xl text-white mb-3 tracking-tight">Edgelog</div>
              <p className="text-sm leading-relaxed max-w-xs">
                A personal trading journal for futures traders who take their craft seriously.
              </p>
            </div>

            {/* Links */}
            {[
              {
                heading: 'Product',
                links: ['Features', 'Pricing', 'Changelog'],
              },
              {
                heading: 'Resources',
                links: ['Import Guide', 'CSV Format', 'Keyboard Shortcuts'],
              },
              {
                heading: 'Legal',
                links: ['Privacy Policy', 'Terms of Service'],
              },
            ].map(({ heading, links }) => (
              <div key={heading}>
                <div className="text-xs font-semibold uppercase tracking-widest text-gray-500 mb-4">
                  {heading}
                </div>
                <ul className="space-y-2.5">
                  {links.map((link) => (
                    <li key={link}>
                      <a href="#" className="text-sm hover:text-gray-200 transition-colors">
                        {link}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>

          <div className="border-t border-gray-800 pt-8 flex flex-col sm:flex-row items-center justify-between gap-3">
            <span className="text-xs">© {new Date().getFullYear()} Edgelog. All rights reserved.</span>
            <span className="text-xs">Made for traders, by traders.</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
