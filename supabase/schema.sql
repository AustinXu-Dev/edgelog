-- ============================================================
-- Edgelog — Supabase Schema
-- Run this in the Supabase SQL Editor (in order)
-- ============================================================

-- ============================================================
-- 1. PROFILES
-- ============================================================
create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  display_name text,
  timezone text not null default 'UTC',
  created_at timestamptz not null default now()
);

alter table public.profiles enable row level security;

create policy "Users can view own profile"
  on public.profiles for select
  using (auth.uid() = id);

create policy "Users can update own profile"
  on public.profiles for update
  using (auth.uid() = id)
  with check (auth.uid() = id);

create policy "Users can insert own profile"
  on public.profiles for insert
  with check (auth.uid() = id);

-- Auto-create a profile row when a new user signs up
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id)
  values (new.id);
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();


-- ============================================================
-- 2. TRADES
-- ============================================================
create table public.trades (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  instrument text not null,                          -- NDX100, SPX500, NQ, ES
  instrument_type text not null default 'index',     -- index, futures
  direction text not null check (direction in ('long', 'short')),
  entry_price numeric(18,8) not null,
  exit_price numeric(18,8),
  position_size numeric(18,8) not null,
  entry_datetime timestamptz not null,
  exit_datetime timestamptz,
  stop_loss_planned numeric(18,8),
  take_profit_planned numeric(18,8),
  commission numeric(18,4) not null default 0,
  gross_pnl numeric(18,4),
  net_pnl numeric(18,4),
  r_multiple numeric(8,4),
  status text not null default 'closed' check (status in ('open', 'closed')),
  created_at timestamptz not null default now()
);

alter table public.trades enable row level security;

create policy "Users can manage own trades"
  on public.trades for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create index trades_user_entry on public.trades(user_id, entry_datetime desc);

-- Unique constraint for CSV import deduplication
create unique index trades_dedup on public.trades(user_id, instrument, entry_datetime);


-- ============================================================
-- 3. TRADE TAGS
-- ============================================================
create table public.trade_tags (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  name text not null,
  color text not null default '#6366f1',
  unique(user_id, name)
);

alter table public.trade_tags enable row level security;

create policy "Users can manage own tags"
  on public.trade_tags for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);


-- ============================================================
-- 4. TRADE TAG LINKS (junction)
-- ============================================================
create table public.trade_tag_links (
  trade_id uuid not null references public.trades(id) on delete cascade,
  tag_id uuid not null references public.trade_tags(id) on delete cascade,
  primary key (trade_id, tag_id)
);

alter table public.trade_tag_links enable row level security;

create policy "Users can manage own tag links"
  on public.trade_tag_links for all
  using (
    exists (
      select 1 from public.trades t
      where t.id = trade_id and t.user_id = auth.uid()
    )
  );


-- ============================================================
-- 5. TRADE JOURNAL ENTRIES
-- ============================================================
create table public.trade_journal_entries (
  id uuid primary key default gen_random_uuid(),
  trade_id uuid not null references public.trades(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  notes text,
  rating smallint check (rating between 1 and 5),
  strategy text,
  screenshot_url text,  -- storage path: {user_id}/{trade_id}/screenshot.ext
  created_at timestamptz not null default now(),
  unique(trade_id)      -- one journal entry per trade
);

alter table public.trade_journal_entries enable row level security;

create policy "Users can manage own journal entries"
  on public.trade_journal_entries for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);


-- ============================================================
-- 6. DAILY JOURNAL
-- ============================================================
create table public.daily_journal (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  date date not null,
  content text,
  mood text check (mood in ('focused', 'neutral', 'anxious', 'impulsive')),
  created_at timestamptz not null default now(),
  unique(user_id, date)
);

alter table public.daily_journal enable row level security;

create policy "Users can manage own daily journal"
  on public.daily_journal for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create index daily_journal_user_date on public.daily_journal(user_id, date desc);


-- ============================================================
-- 7. STORAGE BUCKET
-- ============================================================
-- Run this separately in Storage > New bucket, or via SQL:
insert into storage.buckets (id, name, public)
values ('trade-screenshots', 'trade-screenshots', false)
on conflict do nothing;

create policy "Users can upload own screenshots"
  on storage.objects for insert
  with check (
    bucket_id = 'trade-screenshots'
    and auth.uid()::text = (storage.foldername(name))[1]
  );

create policy "Users can view own screenshots"
  on storage.objects for select
  using (
    bucket_id = 'trade-screenshots'
    and auth.uid()::text = (storage.foldername(name))[1]
  );

create policy "Users can update own screenshots"
  on storage.objects for update
  using (
    bucket_id = 'trade-screenshots'
    and auth.uid()::text = (storage.foldername(name))[1]
  );

create policy "Users can delete own screenshots"
  on storage.objects for delete
  using (
    bucket_id = 'trade-screenshots'
    and auth.uid()::text = (storage.foldername(name))[1]
  );
