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
  return (
    <div className="relative w-full max-w-3xl mx-auto">
      <div className="rounded-xl overflow-hidden shadow-2xl border border-gray-200 bg-white">
        {/* Window chrome */}
        <div className="bg-gray-900 px-4 py-3 flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-red-400" />
          <div className="w-3 h-3 rounded-full bg-yellow-400" />
          <div className="w-3 h-3 rounded-full bg-emerald-400" />
          <span className="ml-3 text-xs text-gray-400 font-mono">edgelog.app/dashboard</span>
        </div>

        {/* App shell */}
        <div className="flex h-64 sm:h-80">
          {/* Sidebar */}
          <div className="hidden sm:flex w-48 bg-gray-900 border-r border-gray-700 flex-col p-3 gap-1">
            <div className="text-white text-sm font-semibold px-2 py-2 mb-2">Edgelog</div>
            {['Dashboard', 'Trades', 'Journal', 'Settings'].map((item, i) => (
              <div
                key={item}
                className={`px-2 py-1.5 rounded text-xs ${
                  i === 0
                    ? 'bg-blue-600 text-white'
                    : 'text-gray-400 hover:text-gray-200'
                }`}
              >
                {item}
              </div>
            ))}
          </div>

          {/* Main content */}
          <div className="flex-1 bg-gray-50 p-4 overflow-hidden">
            {/* Metric cards */}
            <div className="grid grid-cols-3 gap-2 mb-4">
              {[
                { label: 'Net P&L', value: '+$4,280', color: 'text-emerald-600' },
                { label: 'Win Rate', value: '64%', color: 'text-blue-600' },
                { label: 'Avg R', value: '1.8R', color: 'text-gray-900' },
              ].map((m) => (
                <div key={m.label} className="bg-white rounded-lg border border-gray-200 p-2 shadow-sm">
                  <div className="text-xs text-gray-400 mb-0.5">{m.label}</div>
                  <div className={`text-sm font-semibold font-mono ${m.color}`}>{m.value}</div>
                </div>
              ))}
            </div>

            {/* Fake equity curve */}
            <div className="bg-white rounded-lg border border-gray-200 p-3 shadow-sm mb-3">
              <div className="text-xs text-gray-400 mb-2">Equity Curve</div>
              <svg viewBox="0 0 200 50" className="w-full h-10">
                <defs>
                  <linearGradient id="curveGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#2563eb" stopOpacity="0.15" />
                    <stop offset="100%" stopColor="#2563eb" stopOpacity="0" />
                  </linearGradient>
                </defs>
                <path
                  d="M0,40 C10,38 20,35 30,32 C40,29 50,30 60,27 C70,24 80,22 90,20 C100,18 110,16 120,13 C130,10 140,12 150,9 C160,6 170,8 180,5 C190,3 195,2 200,2"
                  fill="none"
                  stroke="#2563eb"
                  strokeWidth="2"
                  strokeLinecap="round"
                />
                <path
                  d="M0,40 C10,38 20,35 30,32 C40,29 50,30 60,27 C70,24 80,22 90,20 C100,18 110,16 120,13 C130,10 140,12 150,9 C160,6 170,8 180,5 C190,3 195,2 200,2 L200,50 L0,50 Z"
                  fill="url(#curveGrad)"
                />
              </svg>
            </div>

            {/* Trade rows */}
            <div className="bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden">
              {[
                { sym: 'NQ', dir: 'Long', pnl: '+$320', color: 'text-emerald-600' },
                { sym: 'ES', dir: 'Short', pnl: '-$125', color: 'text-red-500' },
                { sym: 'NQ', dir: 'Long', pnl: '+$640', color: 'text-emerald-600' },
              ].map((t, i) => (
                <div
                  key={i}
                  className="flex items-center justify-between px-3 py-1.5 text-xs border-b border-gray-100 last:border-0"
                >
                  <span className="font-mono text-gray-700">{t.sym}</span>
                  <span className="text-gray-400">{t.dir}</span>
                  <span className={`font-mono font-medium ${t.color}`}>{t.pnl}</span>
                </div>
              ))}
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
            {/* Left: second mockup — journal view */}
            <div className="rounded-xl overflow-hidden shadow-xl border border-gray-200 bg-white">
              <div className="bg-gray-900 px-4 py-3 flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-red-400" />
                <div className="w-3 h-3 rounded-full bg-yellow-400" />
                <div className="w-3 h-3 rounded-full bg-emerald-400" />
                <span className="ml-3 text-xs text-gray-400 font-mono">edgelog.app/journal</span>
              </div>
              <div className="p-5 space-y-3">
                <div className="flex items-center justify-between mb-4">
                  <span className="text-sm font-semibold text-gray-900">March 2025</span>
                  <span className="text-xs text-gray-400">Daily Journal</span>
                </div>
                {[
                  { date: 'Mar 28', mood: '😊', pnl: '+$840', tags: ['Trend', 'Patient'] },
                  { date: 'Mar 27', mood: '😐', pnl: '+$120', tags: ['Choppy'] },
                  { date: 'Mar 26', mood: '😞', pnl: '-$380', tags: ['FOMO', 'Oversize'] },
                  { date: 'Mar 25', mood: '😊', pnl: '+$1,200', tags: ['A+ Setup'] },
                ].map((entry) => (
                  <div
                    key={entry.date}
                    className="flex items-center gap-3 p-3 rounded-lg bg-gray-50 border border-gray-100"
                  >
                    <span className="text-lg">{entry.mood}</span>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-medium text-gray-700">{entry.date}</span>
                        <div className="flex gap-1">
                          {entry.tags.map((tag) => (
                            <span
                              key={tag}
                              className="text-xs bg-blue-50 text-blue-700 px-1.5 py-0.5 rounded"
                            >
                              {tag}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>
                    <span
                      className={`text-xs font-mono font-semibold ${
                        entry.pnl.startsWith('+') ? 'text-emerald-600' : 'text-red-500'
                      }`}
                    >
                      {entry.pnl}
                    </span>
                  </div>
                ))}
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
