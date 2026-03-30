-- Migration: add daily_journal_trade_links
-- Run this in the Supabase SQL Editor

create table if not exists public.daily_journal_trade_links (
  journal_id uuid not null references public.daily_journal(id) on delete cascade,
  trade_id   uuid not null references public.trades(id) on delete cascade,
  primary key (journal_id, trade_id)
);

alter table public.daily_journal_trade_links enable row level security;

create policy "Users can manage own journal trade links"
  on public.daily_journal_trade_links for all
  using (
    exists (
      select 1 from public.daily_journal j
      where j.id = journal_id and j.user_id = auth.uid()
    )
  );
