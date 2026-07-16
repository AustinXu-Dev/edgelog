'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createBrowserClient } from '@/lib/supabase/client';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import type { ChecklistWithItems } from '@/lib/types';

interface Props {
  initialChecklists: ChecklistWithItems[];
}

export function ChecklistsManager({ initialChecklists }: Props) {
  const supabase = createBrowserClient();
  const router = useRouter();
  const [checklists, setChecklists] = useState<ChecklistWithItems[]>(initialChecklists);
  const [name, setName] = useState('');
  const [sessionTime, setSessionTime] = useState('');
  const [creating, setCreating] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [itemDrafts, setItemDrafts] = useState<Record<string, string>>({});
  const [addingItemFor, setAddingItemFor] = useState<string | null>(null);
  const [error, setError] = useState('');

  async function handleCreateChecklist() {
    if (!name.trim()) return;
    setCreating(true);
    setError('');

    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) { setCreating(false); return; }

    const { data, error: err } = await supabase
      .from('checklists')
      .insert({ name: name.trim(), session_time: sessionTime.trim() || null, user_id: user.id })
      .select()
      .single();

    if (err) {
      setError(err.message);
    } else if (data) {
      setChecklists((prev) => [...prev, { ...data, items: [] }]);
      setName('');
      setSessionTime('');
      router.refresh();
    }
    setCreating(false);
  }

  async function handleDeleteChecklist(id: string) {
    setDeletingId(id);
    await supabase.from('checklists').delete().eq('id', id);
    setChecklists((prev) => prev.filter((c) => c.id !== id));
    setDeletingId(null);
    router.refresh();
  }

  async function handleAddItem(checklistId: string) {
    const text = (itemDrafts[checklistId] ?? '').trim();
    if (!text) return;
    setAddingItemFor(checklistId);

    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) { setAddingItemFor(null); return; }

    const checklist = checklists.find((c) => c.id === checklistId);
    const sortOrder = checklist?.items.length ?? 0;

    const { data, error: err } = await supabase
      .from('checklist_items')
      .insert({ checklist_id: checklistId, text, sort_order: sortOrder, user_id: user.id })
      .select()
      .single();

    if (!err && data) {
      setChecklists((prev) =>
        prev.map((c) => (c.id === checklistId ? { ...c, items: [...c.items, data] } : c))
      );
      setItemDrafts((prev) => ({ ...prev, [checklistId]: '' }));
      router.refresh();
    }
    setAddingItemFor(null);
  }

  async function handleDeleteItem(checklistId: string, itemId: string) {
    await supabase.from('checklist_items').delete().eq('id', itemId);
    setChecklists((prev) =>
      prev.map((c) => (c.id === checklistId ? { ...c, items: c.items.filter((i) => i.id !== itemId) } : c))
    );
    router.refresh();
  }

  return (
    <div className="space-y-6">
      {checklists.length === 0 ? (
        <p className="text-sm text-gray-400">No checklists yet. Create one below.</p>
      ) : (
        <div className="space-y-5">
          {checklists.map((c) => (
            <div key={c.id} className="border border-gray-100 rounded-lg p-3 space-y-3">
              <div className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-2 min-w-0">
                  <span className="font-medium text-sm text-gray-900 truncate">{c.name}</span>
                  {c.session_time && (
                    <span className="text-xs text-gray-400">{c.session_time}</span>
                  )}
                </div>
                <button
                  type="button"
                  onClick={() => handleDeleteChecklist(c.id)}
                  disabled={deletingId === c.id}
                  className="text-xs text-red-500 hover:text-red-700 transition-colors flex-shrink-0 disabled:opacity-50"
                >
                  {deletingId === c.id ? 'Deleting...' : 'Delete'}
                </button>
              </div>

              {c.items.length > 0 && (
                <ul className="space-y-1">
                  {c.items.map((item) => (
                    <li key={item.id} className="flex items-center justify-between gap-2 text-sm text-gray-600 py-1">
                      <span className="truncate">{item.text}</span>
                      <button
                        type="button"
                        onClick={() => handleDeleteItem(c.id, item.id)}
                        className="text-xs text-red-500 hover:text-red-700 transition-colors flex-shrink-0"
                      >
                        Remove
                      </button>
                    </li>
                  ))}
                </ul>
              )}

              <div className="flex gap-2 items-center">
                <Input
                  value={itemDrafts[c.id] ?? ''}
                  onChange={(e) => setItemDrafts((prev) => ({ ...prev, [c.id]: e.target.value }))}
                  placeholder="Add an item..."
                  className="flex-1 text-sm"
                />
                <Button
                  size="sm"
                  variant="secondary"
                  onClick={() => handleAddItem(c.id)}
                  loading={addingItemFor === c.id}
                  type="button"
                >
                  Add
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}

      <div className="border-t border-gray-200 pt-4 space-y-3">
        <h4 className="text-xs font-semibold uppercase tracking-wide text-gray-500">New Checklist</h4>
        <div className="flex flex-wrap gap-3 items-end">
          <Input
            label="Name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g. Pre-Market"
            className="w-40"
          />
          <Input
            label="Session Time (optional)"
            value={sessionTime}
            onChange={(e) => setSessionTime(e.target.value)}
            placeholder="e.g. 09:15 AM ET"
            className="w-48"
          />
          <Button size="sm" onClick={handleCreateChecklist} loading={creating} type="button">
            {!creating && <i className="lni lni-plus text-sm" />}Add Checklist
          </Button>
        </div>
        {error && <p className="text-sm text-red-600">{error}</p>}
      </div>
    </div>
  );
}
