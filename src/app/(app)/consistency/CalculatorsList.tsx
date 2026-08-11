'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { createBrowserClient } from '@/lib/supabase/client';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import type { ConsistencyCalculator, ConsistencyTemplate } from '@/lib/types';

interface Props {
  initialCalculators: ConsistencyCalculator[];
  templates: ConsistencyTemplate[];
}

const NO_TEMPLATE = '__none__';

export function CalculatorsList({ initialCalculators, templates }: Props) {
  const supabase = createBrowserClient();
  const router = useRouter();
  const calculators = initialCalculators;
  const [name, setName] = useState('');
  const [templateId, setTemplateId] = useState(NO_TEMPLATE);
  const [consistencyPercent, setConsistencyPercent] = useState('');
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState('');

  function handleTemplateChange(value: string) {
    setTemplateId(value);
    const template = templates.find((t) => t.id === value);
    if (template) setConsistencyPercent(String(template.default_consistency_percent));
  }

  async function handleCreate() {
    if (!name.trim() || !consistencyPercent) return;
    setCreating(true);
    setError('');

    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) { setCreating(false); return; }

    const { data: calculator, error: err } = await supabase
      .from('consistency_calculators')
      .insert({ name: name.trim(), consistency_percent: parseFloat(consistencyPercent), user_id: user.id })
      .select()
      .single();

    if (err || !calculator) {
      setError(err?.message ?? 'Failed to create calculator');
      setCreating(false);
      return;
    }

    await supabase.from('consistency_calculator_days').insert(
      Array.from({ length: 5 }, (_, i) => ({
        calculator_id: calculator.id,
        user_id: user.id,
        day_number: i + 1,
        value: null,
      }))
    );

    router.push(`/consistency/${calculator.id}`);
  }

  return (
    <div className="space-y-6">
      {calculators.length === 0 ? (
        <p className="text-sm text-gray-400">No calculators yet. Create one below.</p>
      ) : (
        <div className="space-y-2">
          {calculators.map((c) => (
            <Link
              key={c.id}
              href={`/consistency/${c.id}`}
              className="flex items-center justify-between gap-3 py-2 border-b border-gray-100 last:border-0 hover:bg-gray-50 -mx-2 px-2 rounded transition-colors"
            >
              <span className="text-sm text-gray-900">{c.name}</span>
              <span className="text-xs text-gray-500">
                {c.consistency_percent}% {c.target_profit ? `· target $${c.target_profit}` : ''}
              </span>
            </Link>
          ))}
        </div>
      )}

      <div className="border-t border-gray-200 pt-4 space-y-3">
        <h4 className="text-xs font-semibold uppercase tracking-wide text-gray-500">New Calculator</h4>
        <div className="flex flex-wrap gap-3 items-end">
          <Input
            label="Name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g. Eval Attempt 1"
            className="w-48"
          />
          <Select
            label="Template (optional)"
            value={templateId}
            onChange={(e) => handleTemplateChange(e.target.value)}
            options={[{ value: NO_TEMPLATE, label: 'None' }, ...templates.map((t) => ({ value: t.id, label: t.name }))]}
            className="w-40"
          />
          <Input
            label="Consistency %"
            type="number"
            step="any"
            value={consistencyPercent}
            onChange={(e) => setConsistencyPercent(e.target.value)}
            placeholder="20"
            className="w-32"
          />
          <Button size="sm" onClick={handleCreate} loading={creating} type="button">
            {!creating && <i className="lni lni-plus text-sm" />}Create
          </Button>
        </div>
        {error && <p className="text-sm text-red-600">{error}</p>}
      </div>
    </div>
  );
}
