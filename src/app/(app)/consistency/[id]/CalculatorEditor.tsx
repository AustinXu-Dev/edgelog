'use client';

import { useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { createBrowserClient } from '@/lib/supabase/client';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { calcConsistency } from '@/lib/utils/consistency';
import { formatCurrency, formatPercent } from '@/lib/utils/formatters';
import type { ConsistencyCalculatorWithDays, TradingAccount } from '@/lib/types';

interface Props {
  calculator: ConsistencyCalculatorWithDays;
  accounts: TradingAccount[];
  linkedAccountBalance: number | null;
}

interface DayRow {
  day_number: number;
  value: string;
}

export function CalculatorEditor({ calculator, accounts, linkedAccountBalance }: Props) {
  const supabase = createBrowserClient();
  const router = useRouter();

  const [name, setName] = useState(calculator.name);
  const [consistencyPercent, setConsistencyPercent] = useState(String(calculator.consistency_percent));
  const [accountMode, setAccountMode] = useState<'custom' | 'linked'>(calculator.account_id ? 'linked' : 'custom');
  const [accountId, setAccountId] = useState(calculator.account_id ?? '');
  const [customAccountSize, setCustomAccountSize] = useState(
    calculator.custom_account_size !== null ? String(calculator.custom_account_size) : ''
  );
  const [targetProfit, setTargetProfit] = useState(
    calculator.target_profit !== null ? String(calculator.target_profit) : ''
  );
  const [days, setDays] = useState<DayRow[]>(
    calculator.days.map((d) => ({ day_number: d.day_number, value: d.value !== null ? String(d.value) : '' }))
  );
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [confirmingDelete, setConfirmingDelete] = useState(false);
  const [error, setError] = useState('');

  const result = useMemo(() => {
    const parsedDays = days.map((d) => ({ day_number: d.day_number, value: d.value === '' ? null : parseFloat(d.value) }));
    const percent = parseFloat(consistencyPercent) || 0;
    const target = targetProfit === '' ? null : parseFloat(targetProfit);
    return calcConsistency(parsedDays, percent, target);
  }, [days, consistencyPercent, targetProfit]);

  function addDay() {
    const nextNumber = days.length > 0 ? Math.max(...days.map((d) => d.day_number)) + 1 : 1;
    setDays((prev) => [...prev, { day_number: nextNumber, value: '' }]);
  }

  function removeDay(dayNumber: number) {
    setDays((prev) => prev.filter((d) => d.day_number !== dayNumber));
  }

  function updateDayValue(dayNumber: number, value: string) {
    setDays((prev) => prev.map((d) => (d.day_number === dayNumber ? { ...d, value } : d)));
  }

  async function handleSave() {
    setSaving(true);
    setError('');

    const { error: updateError } = await supabase
      .from('consistency_calculators')
      .update({
        name: name.trim(),
        consistency_percent: parseFloat(consistencyPercent) || 0,
        account_id: accountMode === 'linked' ? (accountId || null) : null,
        custom_account_size: accountMode === 'custom' && customAccountSize !== '' ? parseFloat(customAccountSize) : null,
        target_profit: targetProfit === '' ? null : parseFloat(targetProfit),
      })
      .eq('id', calculator.id);

    if (updateError) {
      setError(updateError.message);
      setSaving(false);
      return;
    }

    await supabase.from('consistency_calculator_days').delete().eq('calculator_id', calculator.id);

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (days.length > 0 && user) {
      await supabase.from('consistency_calculator_days').insert(
        days.map((d) => ({
          calculator_id: calculator.id,
          user_id: user.id,
          day_number: d.day_number,
          value: d.value === '' ? null : parseFloat(d.value),
        }))
      );
    }

    router.refresh();
    setSaving(false);
  }

  async function handleDelete() {
    setDeleting(true);
    await supabase.from('consistency_calculators').delete().eq('id', calculator.id);
    router.push('/consistency');
    router.refresh();
  }

  return (
    <div className="space-y-6 max-w-2xl">
      <div className="grid grid-cols-2 gap-4">
        <Input label="Name" value={name} onChange={(e) => setName(e.target.value)} />
        <Input
          label="Consistency %"
          type="number"
          step="any"
          value={consistencyPercent}
          onChange={(e) => setConsistencyPercent(e.target.value)}
          placeholder="20"
        />
      </div>

      <div className="space-y-2">
        <label className="text-[11px] font-semibold uppercase tracking-wide text-gray-500">Account</label>
        <div className="flex gap-2">
          <Button
            type="button"
            size="sm"
            variant={accountMode === 'custom' ? 'primary' : 'secondary'}
            onClick={() => setAccountMode('custom')}
          >
            Custom amount
          </Button>
          <Button
            type="button"
            size="sm"
            variant={accountMode === 'linked' ? 'primary' : 'secondary'}
            onClick={() => setAccountMode('linked')}
            disabled={accounts.length === 0}
          >
            Existing account
          </Button>
        </div>

        {accountMode === 'custom' ? (
          <Input
            type="number"
            step="any"
            value={customAccountSize}
            onChange={(e) => setCustomAccountSize(e.target.value)}
            placeholder="e.g. 50000"
            className="w-48"
          />
        ) : (
          <div className="space-y-1">
            <select
              value={accountId}
              onChange={(e) => setAccountId(e.target.value)}
              className="bg-white border border-gray-300 rounded-md px-3 py-2 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 w-56"
            >
              <option value="">Select an account</option>
              {accounts.map((a) => (
                <option key={a.id} value={a.id}>{a.name}</option>
              ))}
            </select>
            {accountId === calculator.account_id && linkedAccountBalance !== null && (
              <p className="text-xs text-gray-500">Current balance: {formatCurrency(linkedAccountBalance)}</p>
            )}
            {accountId !== calculator.account_id && accountId && (
              <p className="text-xs text-gray-400">Balance will show after saving.</p>
            )}
          </div>
        )}
      </div>

      <Input
        label="Target Profit (optional)"
        type="number"
        step="any"
        value={targetProfit}
        onChange={(e) => setTargetProfit(e.target.value)}
        placeholder="Leave blank to use sum of days"
        className="w-56"
      />

      <div className="space-y-2">
        <label className="text-[11px] font-semibold uppercase tracking-wide text-gray-500">Days</label>
        <div className="space-y-2">
          {days.map((d) => {
            const breached = result.breachedDayNumbers.includes(d.day_number);
            const dayPercent = result.dayPercents.find((p) => p.day_number === d.day_number)?.percent;
            return (
              <div key={d.day_number} className="flex items-center gap-2">
                <span className="text-sm text-gray-500 w-14 flex-shrink-0">Day {d.day_number}</span>
                <input
                  type="number"
                  step="any"
                  value={d.value}
                  onChange={(e) => updateDayValue(d.day_number, e.target.value)}
                  placeholder="0.00"
                  className={`bg-white border rounded-md px-3 py-2 text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 w-40 ${breached ? 'border-red-400' : 'border-gray-300'}`}
                />
                {dayPercent !== undefined && (
                  <span className={`text-xs font-medium ${breached ? 'text-red-600' : 'text-gray-500'}`}>
                    {formatPercent(dayPercent)} of basis
                  </span>
                )}
                <button
                  type="button"
                  onClick={() => removeDay(d.day_number)}
                  className="text-xs text-red-500 hover:text-red-700 transition-colors ml-auto"
                >
                  Remove
                </button>
              </div>
            );
          })}
        </div>
        <Button type="button" size="sm" variant="secondary" onClick={addDay}>
          <i className="lni lni-plus text-sm" />Add Day
        </Button>
      </div>

      <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 grid grid-cols-2 gap-y-2 text-sm">
        <span className="text-gray-500">Current consistency</span>
        <span className={`font-mono text-right font-semibold ${result.currentConsistencyPercent > (parseFloat(consistencyPercent) || 0) ? 'text-red-600' : 'text-emerald-600'}`}>
          {formatPercent(result.currentConsistencyPercent)}
        </span>
        <span className="text-gray-500">Target consistency</span>
        <span className="text-gray-900 font-mono text-right">{consistencyPercent ? formatPercent(parseFloat(consistencyPercent)) : '—'}</span>
        <span className="text-gray-500">Basis</span>
        <span className="text-gray-900 font-mono text-right">{formatCurrency(result.basis)}</span>
        <span className="text-gray-500">Max per day</span>
        <span className="text-gray-900 font-mono text-right">{formatCurrency(result.maxPerDay)}</span>
        <span className="text-gray-500">Total so far</span>
        <span className="text-gray-900 font-mono text-right">{formatCurrency(result.totalSoFar)}</span>
        {result.remainingToTarget !== null && (
          <>
            <span className="text-gray-500">Remaining to target</span>
            <span className="text-gray-900 font-mono text-right">{formatCurrency(result.remainingToTarget)}</span>
          </>
        )}
      </div>

      {error && <p className="text-sm text-red-600">{error}</p>}

      <div className="flex items-center justify-between">
        <Button type="button" onClick={handleSave} loading={saving}>
          {!saving && <i className="lni lni-floppy-disk-1 text-sm" />}Save
        </Button>

        {confirmingDelete ? (
          <div className="flex items-center gap-2">
            <span className="text-xs text-gray-400">Delete this calculator?</span>
            <Button variant="danger" size="sm" onClick={handleDelete} loading={deleting}>Yes</Button>
            <Button variant="ghost" size="sm" onClick={() => setConfirmingDelete(false)}>No</Button>
          </div>
        ) : (
          <Button variant="danger" size="sm" type="button" onClick={() => setConfirmingDelete(true)}>
            <i className="lni lni-trash-3 text-sm" />Delete
          </Button>
        )}
      </div>
    </div>
  );
}
