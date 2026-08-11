'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createBrowserClient } from '@/lib/supabase/client';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import type { ConsistencyTemplate } from '@/lib/types';

interface Props {
  initialTemplates: ConsistencyTemplate[];
}

export function TemplatesManager({ initialTemplates }: Props) {
  const supabase = createBrowserClient();
  const router = useRouter();
  const [templates, setTemplates] = useState<ConsistencyTemplate[]>(initialTemplates);
  const [name, setName] = useState('');
  const [defaultPercent, setDefaultPercent] = useState('');
  const [creating, setCreating] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [error, setError] = useState('');

  async function handleCreate() {
    if (!name.trim() || !defaultPercent) return;
    setCreating(true);
    setError('');

    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) { setCreating(false); return; }

    const { data, error: err } = await supabase
      .from('consistency_templates')
      .insert({ name: name.trim(), default_consistency_percent: parseFloat(defaultPercent), user_id: user.id })
      .select()
      .single();

    if (err) {
      setError(err.message);
    } else if (data) {
      setTemplates((prev) => [...prev, data].sort((a, b) => a.name.localeCompare(b.name)));
      setName('');
      setDefaultPercent('');
      router.refresh();
    }
    setCreating(false);
  }

  async function handleDelete(id: string) {
    setDeletingId(id);
    await supabase.from('consistency_templates').delete().eq('id', id);
    setTemplates((prev) => prev.filter((t) => t.id !== id));
    setDeletingId(null);
    router.refresh();
  }

  return (
    <div className="space-y-6">
      {templates.length === 0 ? (
        <p className="text-sm text-gray-400">No templates yet. Create one below.</p>
      ) : (
        <div className="space-y-2">
          {templates.map((t) => (
            <div key={t.id} className="flex items-center justify-between gap-3 py-2 border-b border-gray-100 last:border-0">
              <span className="text-sm text-gray-900">
                {t.name} <span className="text-gray-400">— {t.default_consistency_percent}%</span>
              </span>
              <button
                type="button"
                onClick={() => handleDelete(t.id)}
                disabled={deletingId === t.id}
                className="text-xs text-red-500 hover:text-red-700 transition-colors flex-shrink-0 disabled:opacity-50"
              >
                {deletingId === t.id ? 'Deleting...' : 'Delete'}
              </button>
            </div>
          ))}
        </div>
      )}

      <div className="border-t border-gray-200 pt-4 space-y-3">
        <h4 className="text-xs font-semibold uppercase tracking-wide text-gray-500">Add Template</h4>
        <div className="flex flex-wrap gap-3 items-end">
          <Input
            label="Name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g. PropFirmX"
            className="w-40"
          />
          <Input
            label="Default Consistency %"
            type="number"
            step="any"
            value={defaultPercent}
            onChange={(e) => setDefaultPercent(e.target.value)}
            placeholder="20"
            className="w-40"
          />
          <Button size="sm" onClick={handleCreate} loading={creating} type="button">
            {!creating && <i className="lni lni-plus text-sm" />}Add Template
          </Button>
        </div>
        {error && <p className="text-sm text-red-600">{error}</p>}
      </div>
    </div>
  );
}
