'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { createBrowserClient } from '@/lib/supabase/client';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { calcPnl, calcRMultiple, getInstrumentType, INSTRUMENT_DEFINITIONS } from '@/lib/utils/csv';
import { Badge } from '@/components/ui/Badge';
import type { Trade, Instrument, Direction, TradeStatus, TradeTag, TradingAccount } from '@/lib/types';
import { revalidateDashboard } from '@/app/actions/dashboard';

interface TradeFormProps {
  initialValues?: Partial<Trade>;
  tradeId?: string;
  allTags?: TradeTag[];
  initialAccountId?: string | null;
}

const INSTRUMENTS = INSTRUMENT_DEFINITIONS.map(({ value, label }) => ({ value, label }));

const DIRECTIONS = [
  { value: 'long', label: 'Long' },
  { value: 'short', label: 'Short' },
];

const STATUSES = [
  { value: 'closed', label: 'Closed' },
  { value: 'open', label: 'Open' },
];

function toLocalDatetime(iso: string) {
  const d = new Date(iso);
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

export function TradeForm({ initialValues, tradeId, allTags, initialAccountId }: TradeFormProps) {
  const router = useRouter();
  const supabase = createBrowserClient();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [selectedTagIds, setSelectedTagIds] = useState<string[]>([]);
  const [accounts, setAccounts] = useState<TradingAccount[]>([]);
  const [accountId, setAccountId] = useState<string | null>(initialValues?.account_id ?? initialAccountId ?? null);

  useEffect(() => {
    supabase
      .from('trading_accounts')
      .select('*')
      .order('created_at', { ascending: true })
      .then(({ data }) => setAccounts(data ?? []));
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  function toggleTag(tagId: string) {
    setSelectedTagIds((prev) =>
      prev.includes(tagId) ? prev.filter((id) => id !== tagId) : [...prev, tagId]
    );
  }

  const [form, setForm] = useState({
    instrument: initialValues?.instrument ?? 'NQ',
    instrument_type: initialValues?.instrument_type ?? 'futures',
    direction: initialValues?.direction ?? 'long',
    entry_price: initialValues?.entry_price?.toString() ?? '',
    exit_price: initialValues?.exit_price?.toString() ?? '',
    position_size: initialValues?.position_size?.toString() ?? '',
    entry_datetime: initialValues?.entry_datetime ? toLocalDatetime(initialValues.entry_datetime) : '',
    exit_datetime: initialValues?.exit_datetime ? toLocalDatetime(initialValues.exit_datetime) : '',
    stop_loss_planned: initialValues?.stop_loss_planned?.toString() ?? '',
    take_profit_planned: initialValues?.take_profit_planned?.toString() ?? '',
    commission: initialValues?.commission?.toString() ?? '0',
    status: initialValues?.status ?? 'closed',
  });

  function updateField(key: string, value: string) {
    setForm((prev) => {
      const next = { ...prev, [key]: value };
      // Auto-update instrument_type when instrument changes
      if (key === 'instrument') {
        next.instrument_type = getInstrumentType(value);
      }
      return next;
    });
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setLoading(true);

    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      setError('Not authenticated');
      setLoading(false);
      return;
    }

    const entry_price = parseFloat(form.entry_price);
    const exit_price = form.exit_price ? parseFloat(form.exit_price) : null;
    const position_size = parseFloat(form.position_size);
    const commission = parseFloat(form.commission) || 0;
    const stop_loss_planned = form.stop_loss_planned ? parseFloat(form.stop_loss_planned) : null;
    const take_profit_planned = form.take_profit_planned ? parseFloat(form.take_profit_planned) : null;

    let gross_pnl = null;
    let net_pnl = null;
    let r_multiple = null;

    if (form.status === 'closed' && exit_price !== null) {
      const pnl = calcPnl(form.direction as Direction, entry_price, exit_price, position_size, commission, form.instrument);
      gross_pnl = pnl.gross_pnl;
      net_pnl = pnl.net_pnl;
      r_multiple = calcRMultiple(form.direction as Direction, entry_price, stop_loss_planned, net_pnl, position_size, form.instrument);
    }

    const payload = {
      user_id: user.id,
      account_id: accountId,
      instrument: form.instrument as Instrument,
      instrument_type: form.instrument_type,
      direction: form.direction as Direction,
      entry_price,
      exit_price,
      position_size,
      entry_datetime: new Date(form.entry_datetime).toISOString(),
      exit_datetime: form.exit_datetime ? new Date(form.exit_datetime).toISOString() : null,
      stop_loss_planned,
      take_profit_planned,
      commission,
      gross_pnl,
      net_pnl,
      r_multiple,
      status: form.status as TradeStatus,
    };

    let result;
    if (tradeId) {
      const { data, error: err } = await supabase
        .from('trades')
        .update(payload)
        .eq('id', tradeId)
        .eq('user_id', user.id)
        .select()
        .single();
      result = { data, error: err };
    } else {
      const { data, error: err } = await supabase.from('trades').insert(payload).select().single();
      result = { data, error: err };
    }

    if (result.error) {
      setError(result.error.message);
      setLoading(false);
    } else {
      // Save tag links for new trades
      if (!tradeId && selectedTagIds.length > 0) {
        await supabase.from('trade_tag_links').insert(
          selectedTagIds.map((tag_id) => ({ trade_id: result.data.id, tag_id }))
        );
      }
      await revalidateDashboard();
      router.push(`/trades/${result.data.id}`);
      router.refresh();
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6 max-w-2xl">
      {/* Instrument & Direction */}
      <div className="grid grid-cols-2 gap-4">
        <Select
          label="Instrument"
          options={INSTRUMENTS}
          value={form.instrument}
          onChange={(e) => updateField('instrument', e.target.value)}
        />
        <Select
          label="Direction"
          options={DIRECTIONS}
          value={form.direction}
          onChange={(e) => updateField('direction', e.target.value)}
        />
      </div>

      {/* Prices */}
      <div className="grid grid-cols-3 gap-4">
        <Input
          label="Entry Price"
          type="number"
          step="any"
          value={form.entry_price}
          onChange={(e) => updateField('entry_price', e.target.value)}
          required
          placeholder="0.00"
        />
        <Input
          label="Exit Price"
          type="number"
          step="any"
          value={form.exit_price}
          onChange={(e) => updateField('exit_price', e.target.value)}
          required={form.status === 'closed'}
          placeholder="0.00"
        />
        <Input
          label="Position Size"
          type="number"
          step="any"
          value={form.position_size}
          onChange={(e) => updateField('position_size', e.target.value)}
          required
          placeholder="1"
        />
      </div>

      {/* Datetimes */}
      <div className="grid grid-cols-2 gap-4">
        <Input
          label="Entry Date & Time"
          type="datetime-local"
          value={form.entry_datetime}
          onChange={(e) => updateField('entry_datetime', e.target.value)}
          required
        />
        <Input
          label="Exit Date & Time"
          type="datetime-local"
          value={form.exit_datetime}
          onChange={(e) => updateField('exit_datetime', e.target.value)}
          required={form.status === 'closed'}
        />
      </div>

      {/* SL / TP / Commission */}
      <div className="grid grid-cols-3 gap-4">
        <Input
          label="Stop Loss (planned)"
          type="number"
          step="any"
          value={form.stop_loss_planned}
          onChange={(e) => updateField('stop_loss_planned', e.target.value)}
          required
          placeholder="0.00"
        />
        <Input
          label="Take Profit (planned)"
          type="number"
          step="any"
          value={form.take_profit_planned}
          onChange={(e) => updateField('take_profit_planned', e.target.value)}
          required
          placeholder="0.00"
        />
        <Input
          label="Commission"
          type="number"
          step="any"
          value={form.commission}
          onChange={(e) => updateField('commission', e.target.value)}
          placeholder="0"
        />
      </div>

      {/* Status */}
      <Select
        label="Status"
        options={STATUSES}
        value={form.status}
        onChange={(e) => updateField('status', e.target.value)}
        className="w-40"
      />

      {accounts.length > 0 && (
        <div className="flex flex-col gap-1">
          <label className="text-[11px] font-semibold uppercase tracking-wide text-gray-500">
            Trading Account
            <span className="ml-1.5 text-gray-400 font-normal normal-case tracking-normal">(optional)</span>
          </label>
          <select
            value={accountId ?? ''}
            onChange={(e) => setAccountId(e.target.value || null)}
            className="bg-white border border-gray-300 rounded-md px-3 py-2 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 w-56"
          >
            <option value="">No account</option>
            {accounts.map((a) => (
              <option key={a.id} value={a.id}>{a.name}</option>
            ))}
          </select>
        </div>
      )}

      {!tradeId && allTags !== undefined && (
        <div className="flex flex-col gap-2">
          <label className="text-[11px] font-semibold uppercase tracking-wide text-gray-500">
            Tags
            <span className="ml-1.5 text-gray-400 font-normal normal-case tracking-normal">(optional)</span>
          </label>
          {allTags.length === 0 ? (
            <p className="text-sm text-gray-400">No tags yet. Create tags from a trade&apos;s detail page.</p>
          ) : (
            <div className="flex flex-wrap gap-2">
              {allTags.map((tag) => (
                <button
                  key={tag.id}
                  type="button"
                  onClick={() => toggleTag(tag.id)}
                  className={`transition-opacity ${selectedTagIds.includes(tag.id) ? 'opacity-100' : 'opacity-40 hover:opacity-70'}`}
                >
                  <Badge label={tag.name} color={tag.color} />
                </button>
              ))}
            </div>
          )}
        </div>
      )}

      {error && <p className="text-sm text-red-600">{error}</p>}

      <div className="flex gap-3">
        <Button type="submit" loading={loading}>
          {!loading && <i className={`lni ${tradeId ? 'lni-floppy-disk-1' : 'lni-plus'} text-sm`} />}
          {tradeId ? 'Update Trade' : 'Log Trade'}
        </Button>
        <Button type="button" variant="ghost" onClick={() => router.back()}>
          <i className="lni lni-xmark text-sm" />Cancel
        </Button>
      </div>
    </form>
  );
}
