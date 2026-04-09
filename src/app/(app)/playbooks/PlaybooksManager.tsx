'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createBrowserClient } from '@/lib/supabase/client';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Badge } from '@/components/ui/Badge';
import type { TradingStrategy } from '@/lib/types';

const STRATEGY_COLORS = ['#2563eb', '#059669', '#d97706', '#dc2626', '#7c3aed', '#db2777', '#0891b2'];

interface Props {
  initialStrategies: TradingStrategy[];
}

export function PlaybooksManager({ initialStrategies }: Props) {
  const supabase = createBrowserClient();
  const router = useRouter();
  const [strategies, setStrategies] = useState<TradingStrategy[]>(initialStrategies);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [color, setColor] = useState(STRATEGY_COLORS[0]);
  const [creating, setCreating] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [error, setError] = useState('');

  async function handleCreate() {
    if (!name.trim()) return;
    setCreating(true);
    setError('');

    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) { setCreating(false); return; }

    const { data, error: err } = await supabase
      .from('trading_strategies')
      .insert({ name: name.trim(), description: description.trim() || null, color, user_id: user.id })
      .select()
      .single();

    if (err) {
      setError(err.message);
    } else if (data) {
      setStrategies((prev) => [...prev, data].sort((a, b) => a.name.localeCompare(b.name)));
      setName('');
      setDescription('');
      setColor(STRATEGY_COLORS[0]);
      router.refresh();
    }
    setCreating(false);
  }

  async function handleDelete(id: string) {
    setDeletingId(id);
    await supabase.from('trading_strategies').delete().eq('id', id);
    setStrategies((prev) => prev.filter((s) => s.id !== id));
    setDeletingId(null);
    router.refresh();
  }

  return (
    <div className="space-y-6">
      {/* Existing strategies */}
      {strategies.length === 0 ? (
        <p className="text-sm text-gray-400">No playbooks yet. Create one below.</p>
      ) : (
        <div className="space-y-2">
          {strategies.map((s) => (
            <div key={s.id} className="flex items-center justify-between gap-3 py-2 border-b border-gray-100 last:border-0">
              <div className="flex items-center gap-3 min-w-0">
                <Badge label={s.name} color={s.color} />
                {s.description && (
                  <span className="text-sm text-gray-500 truncate">{s.description}</span>
                )}
              </div>
              <button
                type="button"
                onClick={() => handleDelete(s.id)}
                disabled={deletingId === s.id}
                className="text-xs text-red-500 hover:text-red-700 transition-colors flex-shrink-0 disabled:opacity-50"
              >
                {deletingId === s.id ? 'Deleting...' : 'Delete'}
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Create form */}
      <div className="border-t border-gray-200 pt-4 space-y-3">
        <h4 className="text-xs font-semibold uppercase tracking-wide text-gray-500">Add Playbook</h4>
        <div className="flex flex-wrap gap-3 items-end">
          <Input
            label="Name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g. Breakout"
            className="w-40"
          />
          <Input
            label="Description (optional)"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="e.g. Momentum breakout above resistance"
            className="w-64"
          />
          <div className="flex flex-col gap-1">
            <label className="text-[11px] font-semibold uppercase tracking-wide text-gray-500">Color</label>
            <div className="flex gap-1">
              {STRATEGY_COLORS.map((c) => (
                <button
                  key={c}
                  type="button"
                  onClick={() => setColor(c)}
                  className={`w-5 h-5 rounded-full transition-transform ${color === c ? 'ring-2 ring-gray-400 scale-110' : ''}`}
                  style={{ backgroundColor: c }}
                />
              ))}
            </div>
          </div>
          <Button size="sm" onClick={handleCreate} loading={creating} type="button">
            {!creating && <i className="lni lni-plus text-sm" />}Add Playbook
          </Button>
        </div>
        {error && <p className="text-sm text-red-600">{error}</p>}
      </div>
    </div>
  );
}
