'use client';

import { useState } from 'react';
import Link from 'next/link';
import { createBrowserClient } from '@/lib/supabase/client';
import type { ChecklistWithItems } from '@/lib/types';

interface Props {
  checklists: ChecklistWithItems[];
  initialCompletedIds: string[];
  today: string;
  streak: number;
}

export function DailyChecklist({ checklists, initialCompletedIds, today, streak }: Props) {
  const supabase = createBrowserClient();
  const [completedIds, setCompletedIds] = useState<Set<string>>(new Set(initialCompletedIds));

  async function toggleItem(itemId: string) {
    const isDone = completedIds.has(itemId);
    setCompletedIds((prev) => {
      const next = new Set(prev);
      if (isDone) next.delete(itemId); else next.add(itemId);
      return next;
    });

    if (isDone) {
      await supabase.from('checklist_completions').delete().eq('item_id', itemId).eq('date', today);
    } else {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) return;
      await supabase.from('checklist_completions').insert({ item_id: itemId, date: today, user_id: user.id });
    }
  }

  if (checklists.length === 0) {
    return (
      <p className="text-sm text-gray-400">
        No checklists yet.{' '}
        <Link href="/checklists" className="text-blue-600 hover:underline">
          Create one
        </Link>{' '}
        to start tracking your daily discipline.
      </p>
    );
  }

  return (
    <div className="space-y-4">
      {streak > 0 && (
        <div className="inline-flex items-center gap-1.5 text-xs font-medium text-amber-700 bg-amber-50 border border-amber-200 rounded-full px-2.5 py-1">
          🔥 {streak} day{streak === 1 ? '' : 's'} streak
        </div>
      )}
      {checklists.map((c) => (
        <div key={c.id}>
          <div className="flex items-center gap-2 mb-1.5">
            <span className="text-xs font-semibold uppercase tracking-wide text-gray-500">{c.name}</span>
            {c.session_time && <span className="text-xs text-gray-400">{c.session_time}</span>}
          </div>
          {c.items.length === 0 ? (
            <p className="text-sm text-gray-400">No items yet.</p>
          ) : (
            <ul className="space-y-1.5">
              {c.items.map((item) => {
                const checked = completedIds.has(item.id);
                return (
                  <li key={item.id}>
                    <label className="flex items-center gap-2 text-sm cursor-pointer">
                      <input
                        type="checkbox"
                        checked={checked}
                        onChange={() => toggleItem(item.id)}
                        className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500/30"
                      />
                      <span className={checked ? 'text-gray-400 line-through' : 'text-gray-700'}>{item.text}</span>
                    </label>
                  </li>
                );
              })}
            </ul>
          )}
        </div>
      ))}
    </div>
  );
}
