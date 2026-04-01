import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import Papa from 'papaparse';
import { createServerClient } from '@/lib/supabase/server';
import type { Trade } from '@/lib/types';

const CSV_COLUMNS: (keyof Trade)[] = [
  'instrument',
  'instrument_type',
  'direction',
  'entry_price',
  'exit_price',
  'position_size',
  'entry_datetime',
  'exit_datetime',
  'stop_loss_planned',
  'take_profit_planned',
  'commission',
  'status',
  'gross_pnl',
  'net_pnl',
  'r_multiple',
];

export async function GET(request: NextRequest) {
  const supabase = createServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { searchParams } = request.nextUrl;
  const activeAccountId = cookies().get('active_account_id')?.value ?? null;

  let query = supabase
    .from('trades')
    .select('*')
    .eq('user_id', user.id)
    .order('entry_datetime', { ascending: false });

  const instrument = searchParams.get('instrument');
  const direction = searchParams.get('direction');
  const status = searchParams.get('status');
  const from = searchParams.get('from');
  const to = searchParams.get('to');

  if (instrument) query = query.eq('instrument', instrument);
  if (direction) query = query.eq('direction', direction);
  if (status) query = query.eq('status', status);
  if (from) query = query.gte('entry_datetime', from);
  if (to) query = query.lte('entry_datetime', to + 'T23:59:59Z');
  if (activeAccountId) query = query.eq('account_id', activeAccountId);

  const { data: trades, error } = await query.limit(50000);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  const rows = (trades as Trade[]).map((t) =>
    Object.fromEntries(
      CSV_COLUMNS.map((col) => [col, t[col] ?? ''])
    )
  );

  const csv = Papa.unparse(rows, { columns: CSV_COLUMNS });

  return new NextResponse(csv, {
    headers: {
      'Content-Type': 'text/csv',
      'Content-Disposition': `attachment; filename="trades-${new Date().toISOString().slice(0, 10)}.csv"`,
      'Cache-Control': 'no-store',
    },
  });
}
