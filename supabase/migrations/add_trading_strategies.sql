create table public.trading_strategies (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  name text not null,
  description text,
  color text not null default '#2563eb',
  created_at timestamptz not null default now(),
  unique(user_id, name)
);
alter table public.trading_strategies enable row level security;
create policy "Users manage own strategies" on public.trading_strategies
  for all using (auth.uid() = user_id);

create table public.trade_strategy_links (
  trade_id uuid not null references public.trades(id) on delete cascade,
  strategy_id uuid not null references public.trading_strategies(id) on delete cascade,
  primary key (trade_id, strategy_id)
);
alter table public.trade_strategy_links enable row level security;
create policy "Users manage own strategy links" on public.trade_strategy_links
  for all using (
    exists (select 1 from public.trades t where t.id = trade_id and t.user_id = auth.uid())
  );
