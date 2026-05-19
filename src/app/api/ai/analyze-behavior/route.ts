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

  const { accountId } = await req.json() as { accountId?: string | null };

  const { data: profile } = await supabase.from('profiles').select('timezone').eq('id', user.id).single();
  const timezone = profile?.timezone ?? 'UTC';

  const cacheKey = `${user.id}:${accountId ?? 'all'}`;

  // Return cached result if still fresh (30 min)
  const cached = cache.get(cacheKey);
  if (cached && cached.expires > Date.now()) {
    return NextResponse.json({ analysis: cached.result });
  }

  // Reject duplicate concurrent requests for the same user+account
  if (inFlight.has(cacheKey)) {
    return NextResponse.json({ error: 'Analysis already in progress' }, { status: 429 });
  }
  inFlight.add(cacheKey);

  // Fetch the most recent 200 closed trades — no hard date cutoff so old accounts aren't left empty
  let query = supabase
    .from('trades')
    .select(`
      id, instrument, direction, net_pnl, r_multiple, entry_datetime, status,
      trade_strategy_links(trading_strategies(name))
    `)
    .eq('user_id', user.id)
    .eq('status', 'closed')
    .order('entry_datetime', { ascending: false })
    .limit(200);

  if (accountId) query = query.eq('account_id', accountId);

  const { data: tradesDesc } = await query;
  // Reverse so chronological order is oldest-first for analysis
  const trades = (tradesDesc ?? []).slice().reverse();
  const tradeList = trades ?? [];

  const totalTrades = tradeList.length;
  const wins = tradeList.filter((t) => (t.net_pnl ?? 0) > 0).length;
  const winRate = totalTrades > 0 ? ((wins / totalTrades) * 100).toFixed(1) : '0';
  const totalPnl = tradeList.reduce((sum, t) => sum + (t.net_pnl ?? 0), 0).toFixed(2);
  const oldestDate = tradeList[0]?.entry_datetime?.slice(0, 10) ?? 'N/A';
  const newestDate = tradeList[tradeList.length - 1]?.entry_datetime?.slice(0, 10) ?? 'N/A';

  // Strategy breakdown
  const stratMap = new Map<string, { trades: number; wins: number; totalR: number }>();
  for (const t of tradeList) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const names: string[] = (t as any).trade_strategy_links
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      ?.map((l: any) => l.trading_strategies?.name)
      .filter(Boolean) ?? [];
    const key = names.length > 0 ? names.join('+') : 'No strategy';
    const entry = stratMap.get(key) ?? { trades: 0, wins: 0, totalR: 0 };
    entry.trades++;
    if ((t.net_pnl ?? 0) > 0) entry.wins++;
    entry.totalR += t.r_multiple ?? 0;
    stratMap.set(key, entry);
  }
  const stratLines = Array.from(stratMap.entries())
    .map(([name, s]) => {
      const wr = s.trades > 0 ? ((s.wins / s.trades) * 100).toFixed(0) : '0';
      const avgR = s.trades > 0 ? (s.totalR / s.trades).toFixed(2) : '0';
      return `  - ${name}: ${s.trades} trades, ${wr}% win rate, avg R: ${avgR}`;
    })
    .join('\n');

  // DoW breakdown
  const dowMap = new Map<number, number>();
  const hourMap = new Map<number, number>();
  for (const t of tradeList) {
    const d = new Date(t.entry_datetime);
    const dowParts = new Intl.DateTimeFormat('en-US', { weekday: 'short', timeZone: timezone }).formatToParts(d);
    const dowNames = { Sun: 0, Mon: 1, Tue: 2, Wed: 3, Thu: 4, Fri: 5, Sat: 6 } as Record<string, number>;
    const dow = dowNames[dowParts.find((p) => p.type === 'weekday')?.value ?? 'Sun'] ?? 0;
    const hourParts = new Intl.DateTimeFormat('en-US', { hour: 'numeric', hour12: false, timeZone: timezone }).formatToParts(d);
    const rawHour = parseInt(hourParts.find((p) => p.type === 'hour')?.value ?? '0', 10);
    const hour = rawHour === 24 ? 0 : rawHour;
    dowMap.set(dow, (dowMap.get(dow) ?? 0) + (t.net_pnl ?? 0));
    hourMap.set(hour, (hourMap.get(hour) ?? 0) + (t.net_pnl ?? 0));
  }
  const DOW_NAMES = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  const bestDow = Array.from(dowMap.entries()).sort((a, b) => b[1] - a[1])[0];
  const bestDowLabel = bestDow ? DOW_NAMES[bestDow[0]] : 'N/A';
  const bestHour = Array.from(hourMap.entries()).sort((a, b) => b[1] - a[1])[0];
  const bestHourLabel = bestHour ? `${bestHour[0]}:00\u2013${bestHour[0] + 1}:00` : 'N/A';

  const prompt = `You are a professional trading coach analyzing a trader's recent performance.

Period: ${oldestDate} to ${newestDate} (last ${totalTrades} closed trades)
Summary: ${totalTrades} trades, ${winRate}% win rate, net P&L: $${totalPnl}

Strategy breakdown:
${stratLines || '  (no strategies tagged)'}

Best day of week: ${bestDowLabel}
Best time of day: ${bestHourLabel}

Provide:
1. Top 2-3 pattern observations (bullet points)
2. Which strategy to double down on vs. avoid
3. One behavioral blind spot (timing, overtrading, etc.)
4. A single prioritized recommendation

Be concise and actionable (under 400 words).`;

  try {
    const completion = await groq.chat.completions.create({
      model: 'llama-3.3-70b-versatile',
      messages: [{ role: 'user', content: prompt }],
      max_tokens: 800,
    });

    const analysis = completion.choices[0]?.message?.content ?? '';
    cache.set(cacheKey, { result: analysis, expires: Date.now() + 30 * 60 * 1000 });
    return NextResponse.json({ analysis });
  } finally {
    inFlight.delete(cacheKey);
  }
}
