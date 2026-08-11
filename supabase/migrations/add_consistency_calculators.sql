create table public.consistency_templates (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  name text not null,
  default_consistency_percent numeric(5,2) not null,
  created_at timestamptz not null default now(),
  unique(user_id, name)
);
alter table public.consistency_templates enable row level security;
create policy "Users manage own consistency templates" on public.consistency_templates
  for all using (auth.uid() = user_id);

create table public.consistency_calculators (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  name text not null,
  consistency_percent numeric(5,2) not null,
  account_id uuid references public.trading_accounts(id) on delete set null,
  custom_account_size numeric(18,2),
  target_profit numeric(18,2),
  created_at timestamptz not null default now(),
  unique(user_id, name)
);
alter table public.consistency_calculators enable row level security;
create policy "Users manage own consistency calculators" on public.consistency_calculators
  for all using (auth.uid() = user_id);

create table public.consistency_calculator_days (
  id uuid primary key default gen_random_uuid(),
  calculator_id uuid not null references public.consistency_calculators(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  day_number int not null,
  value numeric(18,2),
  created_at timestamptz not null default now()
);
alter table public.consistency_calculator_days enable row level security;
create policy "Users manage own consistency calculator days" on public.consistency_calculator_days
  for all using (auth.uid() = user_id);
