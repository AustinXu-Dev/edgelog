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

Frontend and backend are **colocated** in one Next.js project. There is no separate API server. Database access happens in Server Components and API Routes directly via the Supabase client.

---

## Application Structure

### Route Groups

```
src/app/
├── page.tsx                        # Public marketing/landing page
├── (auth)/
│   ├── login/page.tsx              # Login form
│   └── register/page.tsx          # Registration form
├── (app)/                          # Protected — requires auth
│   ├── layout.tsx                  # Sidebar + BottomNav shell
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
│   └── settings/page.tsx           # Profile settings
├── api/trades/import/route.ts      # POST endpoint for CSV import
└── auth/callback/route.ts          # Supabase OAuth callback
```

### Auth & Middleware

- Auth is handled by **Supabase GoTrue** (email/password).
- `src/middleware.ts` guards `/dashboard`, `/trades`, `/journal`, `/settings` — unauthenticated users are redirected to `/login`.
- Authenticated users visiting `/login` or `/register` are redirected to `/dashboard`.
- The root `/` (marketing page) is public and unguarded.

---

## Core Features

### 1. Dashboard

The dashboard (`/dashboard`) is a Server Component that fetches all closed trades and computes analytics entirely on the server.

**KPI Metrics:**
- Total Net P&L
- Win Rate (% wins)
- Profit Factor (gross profit / gross loss)
- Average R-Multiple

**Charts (via Recharts):**
- **Equity Curve** — cumulative net P&L over time
- **P&L by Instrument** — bar chart per instrument
- **P&L by Day of Week** — Mon–Fri breakdown
- **P&L by Time of Day** — hour-of-day breakdown
- **Monthly P&L Calendar (Heatmap)** — color-coded daily P&L, paginated by month
- **Recent Trades Table** — last 10 trades with click-to-navigate rows

**Date Range Filter:** hidden by default. The `DashboardFilterToggle` client component reveals a `DateRangePicker` that appends `?from=&to=` query params, causing the page to re-render with filtered data.

---

### 2. Trade Management

**Trade List (`/trades`):**
- Filterable by instrument, direction, status, and date range.
- Responsive: card view on mobile, full table on desktop.
- Each row/card is clickable and navigates to the trade detail page.

**Trade Detail (`/trades/[id]`):**
- Displays: instrument, type, direction, entry/exit price, size, timestamps, stop loss, take profit, commission, status.
- P&L Summary panel: gross P&L, net P&L, R-multiple.
- Inline **tag management** via `TagSelector`.
- Inline **trade journal** (notes, star rating 1–5, strategy, screenshot upload).
- Edit and Delete actions in the topbar.

**Create Trade (`/trades/new`):**
- Manual form for all trade fields.
- Tag selection from existing tags at creation time.
- P&L and R-multiple are calculated automatically on save.

**Edit Trade (`/trades/[id]/edit`):**
- Same form, pre-populated with existing values.

**CSV Import (`/trades/import` + `POST /api/trades/import`):**
- Upload a CSV file; the client parses it with PapaParse.
- Preview validated rows and errors before committing.
- The API route inserts valid rows in bulk and deduplicates on `(user_id, instrument, entry_datetime)`.

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

---

### 5. Tagging

- Tags have a `name` and `color`, scoped per user.
- Created and managed from the trade detail page via `TagSelector`.
- Can be selected at trade creation time via the new trade form.
- Links stored in `trade_tag_links` (junction table).

---

### 6. Settings

- Profile page (`/settings`) with display name and timezone.
- Form updates the `profiles` table via a Server Action.

---

### 7. Marketing / Landing Page

- Public page at `/` with sections: Hero, Features, How It Works, App Preview, Testimonials, Pricing, FAQ, CTA, Footer.
- `MarketingNav` — sticky nav with mobile hamburger menu (client component).
- `FAQAccordion` — expandable FAQ items (client component).
- No auto-redirect to dashboard for authenticated users.

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

Trade deduplication key: `(user_id, instrument, entry_datetime)`.

### Supabase Clients

- `src/lib/supabase/client.ts` — browser client for Client Components.
- `src/lib/supabase/server.ts` — server client with cookie handling for Server Components, API Routes, and middleware.

### Database Access (`src/lib/db/`)

| File | Responsibility |
|---|---|
| `trades.ts` | `getTrades`, `getTradeById`, `createTrade`, `updateTrade`, `deleteTrade` |
| `dashboard.ts` | `getDashboardTrades` — closed trades with optional date/account filter |
| `journal.ts` | Daily journal CRUD, trade journal dates, trade links |
| `tags.ts` | Tag CRUD |
| `accounts.ts` | Account queries |

---

## P&L Calculation

P&L is computed client-side (for CSV preview) and server-side (on import/save) using per-instrument **point values**:

| Instrument | Point Value | Type |
|---|---|---|
| NQ | $20/point | CME E-mini Nasdaq Futures |
| ES | $50/point | CME E-mini S&P 500 Futures |
| NDX100 | $20/point | CFD (mirrors NQ) |
| SPX500 | $50/point | CFD (mirrors ES) |

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

## Environment Variables

```
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
```

---

## Development Commands

```bash
npm run dev      # Start development server (localhost:3000)
npm run build    # Production build
npm run start    # Start production server
npm run lint     # Run ESLint
```

No test runner is configured.
