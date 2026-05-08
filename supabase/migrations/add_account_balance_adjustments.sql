create table if not exists public.account_balance_adjustments (
  id uuid primary key default gen_random_uuid(),
  account_id uuid not null references public.trading_accounts(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  amount numeric(18,2) not null,  -- negative = withdrawal, positive = deposit
  type text not null default 'withdrawal',
  note text,
  created_at timestamptz not null default now()
);

alter table public.account_balance_adjustments enable row level security;

create policy "Users manage own adjustments" on public.account_balance_adjustments
  for all using (user_id = auth.uid()) with check (user_id = auth.uid());

create index account_balance_adjustments_account_idx
  on public.account_balance_adjustments(account_id);
