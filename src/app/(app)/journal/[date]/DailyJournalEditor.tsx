'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createBrowserClient } from '@/lib/supabase/client';
import { Textarea } from '@/components/ui/Textarea';
import { Button } from '@/components/ui/Button';
import { MoodPicker } from '@/components/journal/MoodPicker';
import type { DailyJournal, Mood } from '@/lib/types';

interface Props {
  date: string;
  initial: DailyJournal | null;
}

export function DailyJournalEditor({ date, initial }: Props) {
  const supabase = createBrowserClient();
  const router = useRouter();
  const [content, setContent] = useState(initial?.content ?? '');
  const [mood, setMood] = useState<Mood | null>(initial?.mood ?? null);
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

    const { error: err } = await supabase.from('daily_journal').upsert(
      {
        user_id: user.id,
        date,
        content: content || null,
        mood: mood,
      },
      { onConflict: 'user_id,date' }
    );

    setSaving(false);
    if (err) {
      setError(err.message);
    } else {
      setSaved(true);
      router.refresh();
      setTimeout(() => setSaved(false), 2000);
    }
  }

  return (
    <div className="space-y-5">
      <div className="flex flex-col gap-2">
        <label className="text-sm font-medium text-gray-300">How were you feeling today?</label>
        <MoodPicker value={mood} onChange={setMood} />
      </div>

      <Textarea
        label="Journal Entry"
        value={content}
        onChange={(e) => setContent(e.target.value)}
        placeholder="Reflect on the day's trading, market conditions, mindset..."
        rows={12}
      />

      {error && <p className="text-sm text-red-400">{error}</p>}

      <div className="flex items-center gap-3">
        <Button onClick={handleSave} loading={saving} type="button">
          Save Entry
        </Button>
        {saved && <span className="text-sm text-emerald-400">Saved!</span>}
      </div>
    </div>
  );
}
