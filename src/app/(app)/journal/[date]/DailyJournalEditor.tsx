'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createBrowserClient } from '@/lib/supabase/client';
import { Textarea } from '@/components/ui/Textarea';
import { Button } from '@/components/ui/Button';
import { MoodPicker } from '@/components/journal/MoodPicker';
import { formatCurrency, formatDate, pnlColor } from '@/lib/utils/formatters';
import type { DailyJournal, Mood, Trade } from '@/lib/types';

interface Props {
  date: string;
  initial: DailyJournal | null;
  dateTrades: Trade[];
  initialLinkedTradeIds: string[];
}

export function DailyJournalEditor({ date, initial, dateTrades, initialLinkedTradeIds }: Props) {
  const supabase = createBrowserClient();
  const router = useRouter();
  const [content, setContent] = useState(initial?.content ?? '');
  const [mood, setMood] = useState<Mood | null>(initial?.mood ?? null);
  const [linkedTradeIds, setLinkedTradeIds] = useState<string[]>(initialLinkedTradeIds);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [justSaved, setJustSaved] = useState(false);
  const [error, setError] = useState('');

  function toggleTrade(tradeId: string) {
    setLinkedTradeIds((prev) =>
      prev.includes(tradeId) ? prev.filter((id) => id !== tradeId) : [...prev, tradeId]
    );
  }

  async function handleSave() {
    setSaving(true);
    setSaved(false);
    setError('');

    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      setError('Not authenticated');
      setSaving(false);
      return;
    }

    const { data: journalData, error: err } = await supabase
      .from('daily_journal')
      .upsert(
        { user_id: user.id, date, content: content || null, mood },
        { onConflict: 'user_id,date' }
      )
      .select()
      .single();

    if (err || !journalData) {
      setError(err?.message ?? 'Save failed');
      setSaving(false);
      return;
    }

    await supabase.from('daily_journal_trade_links').delete().eq('journal_id', journalData.id);
    if (linkedTradeIds.length > 0) {
      await supabase.from('daily_journal_trade_links').insert(
        linkedTradeIds.map((trade_id) => ({ journal_id: journalData.id, trade_id }))
      );
    }

    setSaving(false);
    setSaved(true);
    setJustSaved(true);
    router.refresh();
  }

  return (
    <div className="space-y-5">
      <div className="flex flex-col gap-2">
        <label className="text-[11px] font-semibold uppercase tracking-wide text-gray-500">How were you feeling today?</label>
        <MoodPicker value={mood} onChange={setMood} />
      </div>

      <Textarea
        label="Journal Entry"
        value={content}
        onChange={(e) => setContent(e.target.value)}
        placeholder="Reflect on the day's trading, market conditions, mindset..."
        rows={12}
      />

      <div className="flex flex-col gap-2">
        <label className="text-[11px] font-semibold uppercase tracking-wide text-gray-500">
          Linked Trades
          <span className="ml-1.5 text-gray-400 font-normal normal-case tracking-normal">(optional)</span>
        </label>
        {dateTrades.length === 0 ? (
          <p className="text-sm text-gray-400">No trades on this date.</p>
        ) : (
          <div className="flex flex-wrap gap-2">
            {dateTrades.map((trade) => (
              <button
                key={trade.id}
                type="button"
                onClick={() => toggleTrade(trade.id)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-sm transition-colors ${
                  linkedTradeIds.includes(trade.id)
                    ? 'border-blue-500 bg-blue-50 text-gray-900'
                    : 'border-gray-200 text-gray-500 hover:border-gray-300 hover:text-gray-700'
                }`}
              >
                <span className="text-gray-400 text-xs">{formatDate(trade.entry_datetime)}</span>
                <span className={trade.direction === 'long' ? 'text-emerald-600' : 'text-red-600'}>
                  <i className={`lni ${trade.direction === 'long' ? 'lni-arrow-upward' : 'lni-arrow-downward'} text-xs`} />
                </span>
                {trade.instrument}
                {trade.net_pnl !== null && (
                  <span className={`font-mono ${pnlColor(trade.net_pnl)}`}>
                    {trade.net_pnl > 0 ? '+' : ''}{formatCurrency(trade.net_pnl)}
                  </span>
                )}
              </button>
            ))}
          </div>
        )}
      </div>

      {error && <p className="text-sm text-red-600">{error}</p>}

      <div className="flex items-center gap-3 flex-wrap">
        <Button onClick={handleSave} loading={saving} type="button">
          {!saving && <i className="lni lni-floppy-disk-1 text-sm" />}Save Entry
        </Button>
        {saved && (
          <span className="text-sm text-emerald-600 flex items-center gap-1">
            <i className="lni lni-check" />Saved!
          </span>
        )}
        {justSaved && (
          <Button variant="ghost" size="sm" onClick={() => router.push('/journal')} type="button">
            <i className="lni lni-arrow-left text-sm" />Back to Journal
          </Button>
        )}
      </div>
    </div>
  );
}
