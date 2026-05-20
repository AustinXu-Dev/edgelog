alter table public.trading_accounts
  drop constraint if exists trading_accounts_status_check;

alter table public.trading_accounts
  add constraint trading_accounts_status_check
  check (status in ('active', 'breached', 'archived', 'passed'));
