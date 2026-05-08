alter table public.trading_accounts
  add column if not exists status text not null default 'active';

alter table public.trading_accounts
  add constraint trading_accounts_status_check
  check (status in ('active', 'breached', 'archived'));
