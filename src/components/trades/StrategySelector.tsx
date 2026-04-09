'use client';

import { useState } from 'react';
import { createBrowserClient } from '@/lib/supabase/client';
import { Badge } from '@/components/ui/Badge';
import type { TradingStrategy } from '@/lib/types';

interface Props {
  tradeId: string;
  allStrategies: TradingStrategy[];
  selectedStrategyIds: string[];
}

export function StrategySelector({ tradeId, allStrategies, selectedStrategyIds: initialSelected }: Props) {
  const supabase = createBrowserClient();
  const [selected, setSelected] = useState<string[]>(initialSelected);
  const [saving, setSaving] = useState(false);

  async function toggleStrategy(strategyId: string) {
    const next = selected.includes(strategyId)
      ? selected.filter((id) => id !== strategyId)
      : [...selected, strategyId];
    setSelected(next);
    setSaving(true);
    await supabase.from('trade_strategy_links').delete().eq('trade_id', tradeId);
    if (next.length > 0) {
      await supabase.from('trade_strategy_links').insert(
        next.map((strategy_id) => ({ trade_id: tradeId, strategy_id }))
      );
    }
    setSaving(false);
  }

  if (allStrategies.length === 0) {
    return (
      <p className="text-sm text-gray-400">
        No playbooks yet.{' '}
        <a href="/playbooks" className="text-blue-600 hover:underline">Create one</a> to tag this trade.
      </p>
    );
  }

  return (
    <div className="space-y-2">
      <div className="flex flex-wrap gap-2">
        {allStrategies.map((strategy) => {
          const isSelected = selected.includes(strategy.id);
          return (
            <button
              key={strategy.id}
              type="button"
              onClick={() => toggleStrategy(strategy.id)}
              className={`transition-opacity ${isSelected ? 'opacity-100' : 'opacity-40 hover:opacity-70'}`}
            >
              <Badge label={strategy.name} color={strategy.color} />
            </button>
          );
        })}
      </div>
      {saving && <p className="text-xs text-gray-400">Saving...</p>}
    </div>
  );
}
