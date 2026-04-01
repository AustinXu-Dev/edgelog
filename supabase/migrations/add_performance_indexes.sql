-- Composite index for the most common query pattern:
-- trades filtered by user + account, ordered by date (trades page, dashboard, export)
CREATE INDEX IF NOT EXISTS trades_user_account_date
  ON trades(user_id, account_id, entry_datetime DESC);

-- Supports status-filtered dashboard queries (closed trades only)
CREATE INDEX IF NOT EXISTS trades_user_account_status
  ON trades(user_id, account_id, status);

-- Supports journal date lookups
CREATE INDEX IF NOT EXISTS trade_journal_entries_user_trade
  ON trade_journal_entries(user_id, trade_id);

-- Supports import job polling by user
CREATE INDEX IF NOT EXISTS import_jobs_user_status
  ON import_jobs(user_id, status);

-- Aggregate P&L for an account — avoids fetching all rows into JS
CREATE OR REPLACE FUNCTION get_account_pnl(p_account_id uuid)
RETURNS numeric
LANGUAGE sql
STABLE
SECURITY DEFINER
AS $$
  SELECT COALESCE(SUM(net_pnl), 0)
  FROM trades
  WHERE account_id = p_account_id
    AND status = 'closed'
    AND user_id = auth.uid();
$$;

-- Trade journal dates with count — replaces JS-side GROUP BY aggregation
CREATE OR REPLACE FUNCTION get_trade_journal_dates()
RETURNS TABLE(date text, count bigint)
LANGUAGE sql
STABLE
SECURITY DEFINER
AS $$
  SELECT
    LEFT(t.entry_datetime::text, 10) AS date,
    COUNT(*)                          AS count
  FROM trade_journal_entries tje
  JOIN trades t ON t.id = tje.trade_id
  WHERE tje.user_id = auth.uid()
  GROUP BY LEFT(t.entry_datetime::text, 10)
  ORDER BY date DESC;
$$;
