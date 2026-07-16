create table public.checklists (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  name text not null,
  session_time text,
  sort_order int not null default 0,
  created_at timestamptz not null default now(),
  unique(user_id, name)
);
alter table public.checklists enable row level security;
create policy "Users manage own checklists" on public.checklists
  for all using (auth.uid() = user_id);

create table public.checklist_items (
  id uuid primary key default gen_random_uuid(),
  checklist_id uuid not null references public.checklists(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  text text not null,
  sort_order int not null default 0,
  created_at timestamptz not null default now()
);
alter table public.checklist_items enable row level security;
create policy "Users manage own checklist items" on public.checklist_items
  for all using (auth.uid() = user_id);

create table public.checklist_completions (
  id uuid primary key default gen_random_uuid(),
  item_id uuid not null references public.checklist_items(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  date date not null,
  created_at timestamptz not null default now(),
  unique(item_id, date)
);
alter table public.checklist_completions enable row level security;
create policy "Users manage own checklist completions" on public.checklist_completions
  for all using (auth.uid() = user_id);

create index checklist_completions_user_date on public.checklist_completions(user_id, date desc);
