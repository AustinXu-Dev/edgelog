-- Add initial_balance to existing trading_accounts table
alter table public.trading_accounts
  add column if not exists initial_balance numeric(18,2) not null default 0;
