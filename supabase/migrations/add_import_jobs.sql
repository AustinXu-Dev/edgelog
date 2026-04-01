create table if not exists import_jobs (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users not null,
  status text not null default 'pending', -- pending | processing | completed | failed
  total integer not null default 0,
  inserted integer,
  skipped integer,
  error text,
  created_at timestamptz default now()
);

alter table import_jobs enable row level security;

create policy "Users can manage own import jobs" on import_jobs
  for all using (auth.uid() = user_id);
