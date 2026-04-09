'use client';

import { useState } from 'react';
import { createBrowserClient } from '@/lib/supabase/client';
import { Button } from '@/components/ui/Button';
import { Textarea } from '@/components/ui/Textarea';
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
        <label className="text-[11px] font-semibold uppercase tracking-wide text-gray-500">Rating</label>
        <StarRating value={rating} onChange={setRating} />
      </div>

      <Textarea
        label="Notes & Reflection"
        value={notes}
        onChange={(e) => setNotes(e.target.value)}
        placeholder="What went well? What would you do differently?"
        rows={6}
      />

      {error && <p className="text-sm text-red-600">{error}</p>}

      <div className="flex items-center gap-3">
        <Button onClick={handleSave} loading={saving} type="button">
          {!saving && <i className="lni lni-floppy-disk-1 text-sm" />}Save Notes
        </Button>
        {saved && <span className="text-sm text-emerald-600 flex items-center gap-1"><i className="lni lni-check" />Saved!</span>}
      </div>
    </div>
  );
}
