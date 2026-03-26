'use client';

import { useState } from 'react';
import { createBrowserClient } from '@/lib/supabase/client';
import { Button } from '@/components/ui/Button';
import { Textarea } from '@/components/ui/Textarea';
import { Input } from '@/components/ui/Input';
import { StarRating } from '@/components/ui/StarRating';
import type { TradeJournalEntry } from '@/lib/types';

interface Props {
  tradeId: string;
  initial?: TradeJournalEntry | null;
}

export function JournalEditor({ tradeId, initial }: Props) {
  const supabase = createBrowserClient();
  const [notes, setNotes] = useState(initial?.notes ?? '');
  const [rating, setRating] = useState<number | null>(initial?.rating ?? null);
  const [strategy, setStrategy] = useState(initial?.strategy ?? '');
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState('');

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

    const { error: err } = await supabase.from('trade_journal_entries').upsert(
      {
        trade_id: tradeId,
        user_id: user.id,
        notes: notes || null,
        rating: rating,
        strategy: strategy || null,
      },
      { onConflict: 'trade_id' }
    );

    setSaving(false);
    if (err) {
      setError(err.message);
    } else {
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-1">
        <label className="text-sm font-medium text-gray-300">Rating</label>
        <StarRating value={rating} onChange={setRating} />
      </div>

      <Input
        label="Strategy / Playbook"
        value={strategy}
        onChange={(e) => setStrategy(e.target.value)}
        placeholder="e.g. Breakout, VWAP reclaim..."
      />

      <Textarea
        label="Notes & Reflection"
        value={notes}
        onChange={(e) => setNotes(e.target.value)}
        placeholder="What went well? What would you do differently?"
        rows={6}
      />

      {error && <p className="text-sm text-red-400">{error}</p>}

      <div className="flex items-center gap-3">
        <Button onClick={handleSave} loading={saving} type="button">
          Save Notes
        </Button>
        {saved && <span className="text-sm text-emerald-400">Saved!</span>}
      </div>
    </div>
  );
}
