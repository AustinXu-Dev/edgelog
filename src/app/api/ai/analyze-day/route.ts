import { NextResponse } from 'next/server';
import Groq from 'groq-sdk';
import { createServerClient } from '@/lib/supabase/server';

// In-memory cache: key → { result, expires }
const cache = new Map<string, { result: string; expires: number }>();
// Dedup: track in-flight keys so double-clicks return 429 instead of firing two Groq calls
const inFlight = new Set<string>();

export async function POST(req: Request) {
  const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });
  const supabase = createServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { date } = await req.json() as { date: string; accountId?: string | null };

  const cacheKey = `${user.id}:${date}`;

  // Return cached result if still fresh (30 min)
  const cached = cache.get(cacheKey);
  if (cached && cached.expires > Date.now()) {
    return NextResponse.json({ analysis: cached.result });
  }

  // Reject duplicate concurrent requests for the same user+date
  if (inFlight.has(cacheKey)) {
    return NextResponse.json({ error: 'Analysis already in progress' }, { status: 429 });
  }
  inFlight.add(cacheKey);

  const next = new Date(date);
  next.setDate(next.getDate() + 1);
  const nextDate = next.toISOString().slice(0, 10);

  // Fetch all trades for the day regardless of account — matches what the journal page shows
  const tradesQuery = supabase
    .from('trades')
    .select(`
      id, instrument, direction, entry_price, exit_price, net_pnl, r_multiple, entry_datetime,
      trade_strategy_links(trading_strategies(name)),
      trade_journal_entries(notes)
    `)
    .eq('user_id', user.id)
    .gte('entry_datetime', `${date}T00:00:00Z`)
    .lt('entry_datetime', `${nextDate}T00:00:00Z`)
    .order('entry_datetime');

  // Fetch daily journal entry for the day
  const [{ data: trades }, { data: journal }] = await Promise.all([
    tradesQuery,
    supabase
      .from('daily_journal')
      .select('content, mood')
      .eq('user_id', user.id)
      .eq('date', date)
      .maybeSingle(),
  ]);

  const tradeLines = (trades ?? []).map((t) => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const stratNames = (t as any).trade_strategy_links
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      ?.map((l: any) => l.trading_strategies?.name)
      .filter(Boolean)
      .join(', ') || 'none';
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const notes = (t as any).trade_journal_entries?.notes || '';
    const pnl = t.net_pnl !== null ? `$${t.net_pnl.toFixed(2)}` : 'open';
    const r = t.r_multiple !== null ? `${t.r_multiple.toFixed(2)}R` : '—';
    return `  - ${t.direction.toUpperCase()} ${t.instrument} | strategy: ${stratNames} | P&L: ${pnl} | R: ${r}${notes ? ` | Notes: ${notes}` : ''}`;
  }).join('\n');

  const prompt = `You are a professional trading coach reviewing a trader's daily performance.

Date: ${date}
Mood: ${journal?.mood ?? 'not recorded'}
Journal: ${journal?.content ?? 'no entry written'}

Trades (${(trades ?? []).length} total):
${tradeLines || '  (no trades)'}

Provide:
1. Overall assessment of today's trading
2. Strategy adherence observations
3. Mindset / emotional pattern from the journal
4. One specific improvement for tomorrow

Be concise and direct (under 300 words).`;

  try {
    const completion = await groq.chat.completions.create({
      model: 'llama-3.3-70b-versatile',
      messages: [{ role: 'user', content: prompt }],
      max_tokens: 600,
    });

    const analysis = completion.choices[0]?.message?.content ?? '';
    cache.set(cacheKey, { result: analysis, expires: Date.now() + 30 * 60 * 1000 });
    return NextResponse.json({ analysis });
  } finally {
    inFlight.delete(cacheKey);
  }
}
