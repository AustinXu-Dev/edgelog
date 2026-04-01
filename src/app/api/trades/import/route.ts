import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabase/server';
import { inngest } from '@/inngest/client';
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

  const accountId = request.cookies.get('active_account_id')?.value ?? null;

  // Create a job record so the client can poll for progress
  const { data: job, error: jobError } = await supabase
    .from('import_jobs')
    .insert({ user_id: user.id, status: 'pending', total: trades.length })
    .select('id')
    .single();

  if (jobError || !job) {
    return NextResponse.json({ error: 'Failed to create import job' }, { status: 500 });
  }

  await inngest.send({
    name: 'trades/csv.import',
    data: { jobId: job.id, userId: user.id, trades, accountId },
  });

  return NextResponse.json({ jobId: job.id });
}
