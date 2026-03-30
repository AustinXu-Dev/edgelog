-- Trading accounts
create table if not exists public.trading_accounts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  name text not null,
  broker text,
  initial_balance numeric(18,2) not null default 0,
  created_at timestamptz not null default now(),
  unique(user_id, name)
);

alter table public.trading_accounts enable row level security;

create policy "Users can manage own trading accounts"
  on public.trading_accounts for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- Add account_id column to trades (nullable, so existing trades stay intact)
alter table public.trades
  add column if not exists account_id uuid references public.trading_accounts(id) on delete set null;

create index if not exists trades_account_idx on public.trades(account_id);
