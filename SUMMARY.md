# Edgelog — Project Summary

## What Is It

Edgelog is a **personal trading journal** web application. It lets traders log trades, analyze performance metrics, and reflect on their trading psychology through a journaling system. It is a private, single-user tool — all data is scoped to the authenticated user.

---

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | Next.js 14 (App Router) |
| Language | TypeScript |
| Database & Auth | Supabase (PostgreSQL + GoTrue Auth) |
| Styling | Tailwind CSS |
| Charts | Recharts |
| Icons | LineIcons, Lucide React |
| CSV Parsing | PapaParse |
| Progress Bar | nextjs-toploader |
| Background Jobs | Inngest |
| Error Monitoring | Sentry (`@sentry/nextjs`) |

Frontend and backend are **colocated** in one Next.js project. There is no separate API server. Database access happens in Server Components and API Routes directly via the Supabase client.

---

## Application Structure

### Route Groups

```
src/app/
├── page.tsx                        # Public marketing/landing page
├── (auth)/
│   ├── login/page.tsx              # Login form (includes "Forgot password?" link)
│   ├── register/page.tsx           # Registration form → redirects to /onboarding
│   ├── forgot-password/page.tsx    # Enter email → sends Supabase password reset link
│   └── reset-password/page.tsx     # Set new password after clicking reset link
├── (onboarding)/                   # Protected, no sidebar
│   └── onboarding/page.tsx         # Account setup for new/accountless users
├── (app)/                          # Protected — requires auth
│   ├── layout.tsx                  # Sidebar + BottomNav shell + NoAccountBanner
│   ├── dashboard/page.tsx          # Analytics dashboard
│   ├── trades/
│   │   ├── page.tsx                # Trade list
│   │   ├── new/page.tsx            # Create trade form
│   │   ├── import/page.tsx         # CSV import UI
│   │   └── [id]/
│   │       ├── page.tsx            # Trade detail + journal + tags
│   │       └── edit/page.tsx       # Edit trade form
│   ├── journal/
│   │   ├── page.tsx                # Journal entry list
│   │   └── [date]/page.tsx         # Daily journal editor
│   └── settings/page.tsx           # Profile + Accounts tabs
├── api/
│   ├── trades/
│   │   ├── import/route.ts         # POST — queue CSV import job via Inngest
│   │   └── export/route.ts         # GET — download trades as CSV (with filters)
│   ├── jobs/[id]/route.ts          # GET — poll import job status
│   └── inngest/route.ts            # Inngest serve endpoint (GET/POST/PUT)
└── auth/callback/route.ts          # Supabase OAuth callback
```

### Auth & Middleware

- Auth is handled by **Supabase GoTrue** (email/password).
- `src/middleware.ts` guards `/dashboard`, `/trades`, `/journal`, `/settings`, `/onboarding` — unauthenticated users are redirected to `/login`.
- Authenticated users visiting `/login` or `/register` are redirected to `/dashboard`.
- The root `/` (marketing page) is public and unguarded.
- `/forgot-password` and `/reset-password` are public and unguarded (no middleware matcher).

### Forgot / Reset Password

- **`/forgot-password`** — User enters their email; calls `supabase.auth.resetPasswordForEmail()` with `redirectTo: /reset-password`. On success, shows a confirmation message.
- **`/reset-password`** — User lands here after clicking the email link (Supabase injects a recovery session via URL hash). User sets a new password; calls `supabase.auth.updateUser({ password })`, then redirects to `/dashboard`.
- Supabase dashboard must have `https://<domain>/reset-password` added to **Redirect URLs** (Authentication → URL Configuration).

### Onboarding

- After registration, users are redirected to `/onboarding` (not `/dashboard`) to create their first trading account.
- The `/onboarding` page uses its own `(onboarding)` route group with a minimal sidebar-free layout. If the user already has accounts, it immediately redirects to `/dashboard`.
- For existing users who have no accounts, `(app)/layout.tsx` renders a `NoAccountBanner` (`src/components/layout/NoAccountBanner.tsx`) — an amber warning bar visible on all app pages with an inline account creation form.

---

## Core Features

### 1. Dashboard

The dashboard (`/dashboard`) is a Server Component that fetches all closed trades and computes analytics entirely on the server. Trade data is cached for 5 minutes via `unstable_cache` (tag: `dashboard-trades`).

**KPI Metrics:**
- Total Net P&L
- Win Rate (% wins)
- Profit Factor (gross profit / gross loss)
- Average R-Multiple

**Charts (via Recharts — lazy-loaded with `next/dynamic`):**
- **Equity Curve** — cumulative net P&L over time
- **P&L by Instrument** — bar chart per instrument
- **P&L by Day of Week** — Mon–Fri breakdown
- **P&L by Time of Day** — hour-of-day breakdown
- **Monthly P&L Calendar (Heatmap)** — color-coded daily P&L, paginated by month. Previously fetched months are cached client-side in a `useRef<Map>` — no re-fetch on back navigation.
- **Recent Trades Table** — last 10 trades fetched with `.limit(10)` at the DB level. "View all" link goes to `/trades`.

**Date Range Filter:** hidden by default. The `DashboardFilterToggle` client component reveals a `DateRangePicker` that appends `?from=&to=` query params, causing the page to re-render with filtered data.

---

### 2. Trade Management

**Trade List (`/trades`):**
- Filterable by instrument, direction, status, and date range.
- Server-side pagination — 10 trades per page using Supabase `.range()` with `count: 'exact'`. Page is a `page` search param preserved alongside filters.
- Responsive: card view on mobile, full table on desktop.
- Each row/card is clickable and navigates to the trade detail page.

**Trade Detail (`/trades/[id]`):**
- Displays: instrument, type, direction, entry/exit price, size, timestamps, stop loss, take profit, commission, status.
- P&L Summary panel: gross P&L, net P&L, R-multiple.
- Inline **tag management** via `TagSelector`.
- Inline **trade journal** (notes, star rating 1–5, strategy, screenshot upload).
- Back, Edit, and Delete actions in the topbar.

**Create Trade (`/trades/new`):**
- Manual form for all trade fields.
- Tag selection from existing tags at creation time.
- P&L and R-multiple are calculated automatically on save.

**Edit Trade (`/trades/[id]/edit`):**
- Same form, pre-populated with existing values.

**CSV Import (`/trades/import`):**
- Upload a CSV file; the client parses it with PapaParse and shows a preview with validation errors.
- On confirm, `POST /api/trades/import` creates an `import_jobs` record and fires an Inngest event, returning a `jobId`.
- `CsvImporter` polls `GET /api/jobs/[id]` every 2 s, showing a spinner while pending/processing and a result on completion or failure.
- The Inngest function (`process-csv-import`) runs in the background: upserts trades via the Supabase service-role client and updates the job record. Deduplication key: `(user_id, instrument, entry_datetime)`.
- A companion Inngest function (`handle-csv-import-failure`) listens for `inngest/function.failed` and marks the job as failed after all retries are exhausted.

**CSV Export (`GET /api/trades/export`):**
- Returns a `.csv` download of the current trade list, respecting the same filters as the trade list page (instrument, direction, status, date range, active account).
- "Export CSV" button appears in the trades list only when trades exist; it passes the active filters as query params so the export matches exactly what is visible.
- Columns: `instrument, instrument_type, direction, entry_price, exit_price, position_size, entry_datetime, exit_datetime, stop_loss_planned, take_profit_planned, commission, status, gross_pnl, net_pnl, r_multiple`. The first 11 columns are re-importable.

---

### 3. Journal System

Two separate but interconnected journal types:

#### Trade Journal (per-trade)
- Stored in `trade_journal_entries`.
- Edited on the trade detail page (`/trades/[id]`).
- Fields: notes (free text), rating (1–5 stars), strategy (text), screenshot (image upload to Supabase Storage).

#### Daily Journal (per-day)
- Stored in `daily_journal`.
- Edited at `/journal/[date]`.
- Fields: free-text reflection content, mood (`focused | neutral | anxious | impulsive`), optional trade links.
- Trades that occurred on that day are listed and can be linked to the entry via `daily_journal_trade_links`.

#### Journal List (`/journal`)
- Merges dates from both `daily_journal` and `trade_journal_entries`.
- Shows dates where either a daily reflection or trade notes exist.
- Toggle between Card view and List view (preference saved to `localStorage`).

---

### 4. Trading Accounts

- Multiple named accounts per user, stored in `trading_accounts`.
- Each account has a `name`, optional `broker`, and `initial_balance`.
- The **active account** is stored in a cookie (`active_account_id`).
- All queries (dashboard, trade list) filter by the active account when one is selected.
- `AccountSwitcher` in the sidebar shows:
  - A dropdown to switch accounts or view all.
  - Current balance = `initial_balance + cumulative net_pnl`.
  - Starting balance and cumulative P&L.
  - Inline form to create a new account.

**Account server actions** (`src/app/actions/account.ts`):
- `createAccountAndActivate` — creates + immediately activates (used by onboarding and `NoAccountBanner`).
- `createAccountAction` — creates without changing active account (used by Settings Accounts tab).
- `deleteAccountAction(id, deleteTrades)` — deletes account. When `deleteTrades` is `true`, first deletes all trades for that account (which cascades to `trade_journal_entries`, `trade_tag_links`, `daily_journal_trade_links`).
- `closeEdgelogAccount` — deletes the Supabase auth user via Admin API (service-role key); all data cascades. Client redirects to `/` on success.

---

### 5. Tagging

- Tags have a `name` and `color`, scoped per user.
- Created and managed from the trade detail page via `TagSelector`.
- Can be selected at trade creation time via the new trade form.
- Links stored in `trade_tag_links` (junction table).

---

### 6. Settings

`/settings` uses URL-based tabs (`searchParams.tab`):

- **Profile tab** (default) — display name and timezone form. Below the form, a **Danger Zone** section lets users permanently close their Edgelog account by typing their email to confirm.
- **Accounts tab** (`?tab=accounts`) — lists all trading accounts with name and starting balance. Each account can be deleted with an inline confirmation that offers two options:
  - **Keep trades** — account is removed, trades become unassigned (`account_id → null`).
  - **Delete trades and journals** — account and all its trades are deleted (cascades to trade journal entries, tag links, daily journal trade links).
  - New accounts can be added inline from this tab.

---

### 7. Marketing / Landing Page

- Public page at `/` with sections: Hero, Features, How It Works, App Preview, Testimonials, Pricing, FAQ, CTA, Footer.
- `MarketingNav` — sticky nav with mobile hamburger menu (client component).
- `FAQAccordion` — expandable FAQ items (client component).
- No auto-redirect to dashboard for authenticated users.
- `AppMockup` — inline server component showing a pixel-accurate dashboard preview. Uses SVG (not Recharts) to replicate bar charts. Layout mirrors real dashboard: KPI cards → Equity Curve → 3-column charts (P&L by Instrument, DoW, ToD) → 2-column bottom row (Monthly P&L Calendar heatmap + Recent Trades table).

---

## Data Layer

### Database (Supabase / PostgreSQL)

All tables have **Row-Level Security (RLS)** — users can only read/write their own rows.

| Table | Purpose |
|---|---|
| `profiles` | Display name, timezone per user |
| `trading_accounts` | Named accounts with initial balance |
| `trades` | Core trade records |
| `trade_tags` | User-defined tags (name, color) |
| `trade_tag_links` | Junction: trades ↔ tags |
| `trade_journal_entries` | Per-trade notes, rating, strategy, screenshot path |
| `daily_journal` | Daily reflection with mood |
| `daily_journal_trade_links` | Junction: daily_journal ↔ trades |
| `import_jobs` | Tracks async CSV import status (pending → processing → completed/failed) |

Trade deduplication key: `(user_id, instrument, entry_datetime)`.

### Supabase Clients

- `src/lib/supabase/client.ts` — browser client for Client Components.
- `src/lib/supabase/server.ts` — server client with cookie handling for Server Components, API Routes, and middleware.

### Database Access (`src/lib/db/`)

| File | Responsibility |
|---|---|
| `trades.ts` | `getTrades`, `getTradeById` (single query with nested select), `getRecentTrades` (DB-limited), `createTrade`, `updateTrade`, `deleteTrade` |
| `dashboard.ts` | `getDashboardTrades` — closed trades with optional date/account filter, wrapped in `unstable_cache` (5 min, tag `dashboard-trades`) |
| `journal.ts` | Daily journal CRUD, `getTradeJournalDates` (via SQL `GROUP BY` RPC), trade links |
| `tags.ts` | Tag CRUD |
| `accounts.ts` | Account queries |

---

## Supported Instruments

All instrument fields are plain `text` in Supabase — no DB migration needed when adding new instruments.

| Category | Instruments |
|---|---|
| CME Equity Futures | NQ, ES, MNQ, MES, YM, MYM, RTY, M2K |
| CME Metals Futures | GC, MGC, SI, SIL, PL |
| CME Energy Futures | CL, MCL |
| Index CFDs | NDX100, SPX500, US30, GER40 |
| Commodity CFDs | XAUUSD, XAGUSD |
| Forex | EURUSD, GBPUSD, AUDUSD, NZDUSD, USDJPY, USDCAD |
| Crypto | BTCUSD, ETHUSD |

`getInstrumentType(instrument)` in `src/lib/utils/csv.ts` returns `'futures' | 'index' | 'forex' | 'crypto'`.

## P&L Calculation

P&L is computed client-side (for CSV preview) and server-side (on import/save) using per-instrument **point values** from `POINT_VALUES` in `src/lib/utils/csv.ts`:

| Instrument | Point Value | Note |
|---|---|---|
| NQ | $20/point | CME E-mini Nasdaq Futures |
| ES | $50/point | CME E-mini S&P 500 Futures |
| MNQ | $2/point | Micro Nasdaq-100 |
| MES | $5/point | Micro S&P 500 |
| YM | $5/point | E-mini Dow |
| MYM | $0.50/point | Micro Dow |
| RTY | $50/point | E-mini Russell 2000 |
| M2K | $5/point | Micro Russell 2000 |
| GC | $100/point | Gold Futures |
| MGC | $10/point | Micro Gold |
| SI | $5,000/point | Silver Futures |
| SIL | $1,000/point | Micro Silver |
| PL | $50/point | Platinum Futures |
| CL | $1,000/point | Crude Oil |
| MCL | $100/point | Micro Crude Oil |
| NDX100 | $20/point | CFD (mirrors NQ) |
| SPX500 | $50/point | CFD (mirrors ES) |
| US30 | $1/point | Dow Jones CFD |
| GER40 | $1/point | DAX 40 CFD (EUR-denominated, approx.) |
| XAUUSD | $100/point | Gold CFD — 1 lot = 100 troy oz |
| XAGUSD | $5,000/point | Silver CFD — 1 lot = 5,000 troy oz |
| EURUSD/GBPUSD/AUDUSD/NZDUSD | 100,000 | USD-quoted, position_size in lots |
| USDJPY | ~700 | Approximate (varies with rate) |
| USDCAD | ~74,000 | Approximate (varies with rate) |
| BTCUSD/ETHUSD | 1 | Crypto, position_size in coins |

**Gross P&L** = `(exit − entry) × size × direction × pointValue`
**Net P&L** = `gross_pnl − commission`
**R-Multiple** = `net_pnl / (|entry − stopLoss| × size × pointValue)`

---

## Metrics Computed (`src/lib/utils/metrics.ts`)

| Function | Output |
|---|---|
| `calcMetrics` | Total net P&L, win rate, profit factor, avg R, win/loss counts |
| `buildEquityCurve` | Array of `{ date, cumPnl, pnl }` sorted by exit date |
| `buildPnlByDow` | P&L aggregated by weekday (Mon–Fri) |
| `buildPnlByHour` | P&L aggregated by hour of entry |
| `buildDailyPnl` | `Record<date, pnl>` for calendar heatmap |
| `calcPnlByInstrument` | P&L and trade count per instrument |

---

## UI Layout

### Desktop
- Fixed **sidebar** (240px) on the left: logo, account switcher, nav links, "New Trade" CTA, user email, sign-out.
- **Topbar** on each page: title + context-specific action buttons.
- Content area scrolls independently.

### Mobile
- Sidebar hidden.
- **MobileAccountBar** at the top of the content area (shows active account).
- **BottomNav** fixed at the bottom: Dashboard, Trades, New Trade (+), Journal, Settings.
- Main content has `pb-16` padding to clear the bottom nav.
- `TradeTable` switches to a card layout.

### UI Conventions
- All topbar buttons use `size="sm"`.
- Button variants: `primary` (CTA), `secondary` (utility), `ghost` (cancel), `danger` (destructive).
- `DateRangePicker` uses raw `<input type="date">` to keep the topbar row flat.
- Page padding: `p-4 md:p-6`.

---

## Performance & Architecture Decisions

### Database

- **Composite indexes** on `trades(user_id, account_id, entry_datetime DESC)` and `trades(user_id, account_id, status)` cover all common query patterns.
- **`get_account_pnl(uuid)`** — SQL function returning `SUM(net_pnl)` for an account. Used by `AccountSwitcher` to avoid fetching all trade rows into JS.
- **`get_trade_journal_dates()`** — SQL function returning `{ date, count }` via `GROUP BY`. Used by `getTradeJournalDates` to avoid JS-side aggregation.
- **`getTradeById`** — single Supabase query with nested select for tags and journal (was 3 sequential round-trips).

### Server Caching

- `getDashboardTrades` is wrapped in `unstable_cache` (5-min TTL, `dashboard-trades` tag). The cached function uses the service-role client and takes `userId` as an explicit key so each user has their own cache slot.

### Client Performance

- Recharts is lazy-loaded via `next/dynamic({ ssr: false })` — the chart bundle doesn't block the initial dashboard render.
- `CalendarHeatmap` caches fetched months in a `useRef<Map>` — no redundant DB fetches when navigating between months.
- `CsvImporter` attaches `AbortController` signals to all fetch calls and aborts on unmount.

### Instrument Definitions

- **Single source of truth**: `INSTRUMENT_DEFINITIONS` in `src/lib/utils/csv.ts` — `{ value, label, shortLabel }` per instrument. All dropdowns (`TradeForm`, `TradeFilters`) derive from this array. Adding a new instrument requires a change in one place only.

### Pagination

- Trades list: server-side, 10 rows/page, Supabase `.range()` + `count: 'exact'`. `Pagination` component in `src/components/ui/Pagination.tsx`.
- Dashboard recent trades: DB-level `.limit(10)` via `getRecentTrades`, no pagination widget.

## Environment Variables

```
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
NEXT_PUBLIC_SENTRY_DSN=
NEXT_PUBLIC_SENTRY_ENVIRONMENT=   # development | production
SENTRY_AUTH_TOKEN=                # for source map uploads on build
SUPABASE_SERVICE_ROLE_KEY=        # used by Inngest background function (bypasses RLS)
INNGEST_SIGNING_KEY=              # from inngest.com dashboard — authenticates function calls
INNGEST_EVENT_KEY=                # from inngest.com dashboard — authenticates event sends
INNGEST_DEV=1                     # local dev only — routes to local Inngest Dev Server, skips signature check
```

---

## Error Monitoring

Sentry is configured via Next.js instrumentation conventions:

- `instrumentation-client.ts` — browser SDK with Session Replay
- `instrumentation.ts` — server + edge SDK via `register()`
- `src/app/global-error.tsx` — React error boundary for rendering errors
- Key captures: unknown instrument in `calcPnl`, Supabase upsert errors in CSV import route

---

## Development Commands

```bash
npm run dev      # Start development server (localhost:3000)
npm run build    # Production build
npm run start    # Start production server
npm run lint     # Run ESLint
```

For local Inngest development, run the Dev Server in a second terminal:

```bash
npx inngest-cli@latest dev   # Inngest Dev Server at localhost:8288 (auto-discovers /api/inngest)
```

`INNGEST_DEV=1` must be set in `.env.local` for the SDK to route to the local dev server. Do **not** set it in production.

No test runner is configured.
