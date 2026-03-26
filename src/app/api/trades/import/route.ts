import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabase/server';
import type { ParsedCsvTrade } from '@/lib/utils/csv';

export async function POST(request: NextRequest) {
  const supabase = createServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const body = await request.json();
  const trades: ParsedCsvTrade[] = body.trades;

  if (!Array.isArray(trades) || trades.length === 0) {
    return NextResponse.json({ error: 'No trades provided' }, { status: 400 });
  }

  const rows = trades.map((t) => ({
    ...t,
    user_id: user.id,
  }));

  // Use upsert with conflict on entry_datetime + instrument to skip duplicates
  const { data, error } = await supabase
    .from('trades')
    .upsert(rows, { onConflict: 'user_id,instrument,entry_datetime', ignoreDuplicates: true })
    .select();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  const inserted = data?.length ?? 0;
  const skipped = trades.length - inserted;

  return NextResponse.json({ inserted, skipped });
}
