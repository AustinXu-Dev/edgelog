'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { createBrowserClient } from '@/lib/supabase/client';
import { setActiveAccount } from '@/app/actions/account';
import type { TradingAccount } from '@/lib/types';

interface Props {
  activeAccountId: string | null;
}

function formatBalance(n: number): string {
  return '$' + n.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

function pnlSign(n: number): string {
  return n > 0 ? '+' : '';
}

export function AccountSwitcher({ activeAccountId }: Props) {
  const supabase = createBrowserClient();
  const router = useRouter();
  const [accounts, setAccounts] = useState<TradingAccount[]>([]);
  const [adding, setAdding] = useState(false);
  const [newName, setNewName] = useState('');
  const [newBalance, setNewBalance] = useState('');
  const [saving, setSaving] = useState(false);
  const [cumulativePnl, setCumulativePnl] = useState<number | null>(null);

  useEffect(() => {
    supabase
      .from('trading_accounts')
      .select('*')
      .order('created_at', { ascending: true })
      .then(({ data }) => setAccounts(data ?? []));
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // Fetch cumulative P&L for the active account via SQL SUM — avoids fetching all rows
  useEffect(() => {
    if (!activeAccountId) { setCumulativePnl(null); return; }

    supabase
      .rpc('get_account_pnl', { p_account_id: activeAccountId })
      .then(({ data }) => setCumulativePnl(data ?? 0));
  }, [activeAccountId]); // eslint-disable-line react-hooks/exhaustive-deps

  async function handleSwitch(id: string | null) {
    await setActiveAccount(id);
    router.refresh();
  }

  async function handleCreate() {
    const name = newName.trim();
    const balance = parseFloat(newBalance);
    if (!name || isNaN(balance) || balance < 0) return;

    setSaving(true);
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) { setSaving(false); return; }

    const { data } = await supabase
      .from('trading_accounts')
      .insert({ user_id: user.id, name, initial_balance: balance })
      .select()
      .single();

    if (data) {
      setAccounts((prev) => [...prev, data]);
      await setActiveAccount(data.id);
      router.refresh();
    }
    setNewName('');
    setNewBalance('');
    setAdding(false);
    setSaving(false);
  }

  const activeAccount = accounts.find((a) => a.id === activeAccountId) ?? null;
  const currentBalance =
    activeAccount && cumulativePnl !== null
      ? activeAccount.initial_balance + cumulativePnl
      : null;

  return (
    <div className="px-3 py-3 border-b border-gray-200 space-y-2">
      <p className="text-[10px] font-semibold uppercase tracking-wide text-gray-400">Account</p>

      <select
        value={activeAccountId ?? ''}
        onChange={(e) => handleSwitch(e.target.value || null)}
        className="w-full text-xs bg-gray-50 border border-gray-200 rounded px-2 py-1.5 text-gray-700 focus:outline-none focus:border-blue-400 cursor-pointer"
      >
        <option value="">All accounts</option>
        {accounts.map((a) => (
          <option key={a.id} value={a.id}>{a.name}</option>
        ))}
      </select>

      {/* Active account balance info */}
      {activeAccount && (
        <div className="bg-gray-50 border border-gray-100 rounded-lg px-2.5 py-2 space-y-1">
          <div className="flex items-center justify-between">
            <span className="text-[10px] text-gray-400">Balance</span>
            <span className="text-xs font-semibold text-gray-800">
              {currentBalance !== null ? formatBalance(currentBalance) : '—'}
            </span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-[10px] text-gray-400">Start</span>
            <span className="text-[11px] text-gray-500">{formatBalance(activeAccount.initial_balance)}</span>
          </div>
          {cumulativePnl !== null && (
            <div className="flex items-center justify-between">
              <span className="text-[10px] text-gray-400">P&amp;L</span>
              <span className={`text-[11px] font-mono font-medium ${cumulativePnl > 0 ? 'text-emerald-600' : cumulativePnl < 0 ? 'text-red-600' : 'text-gray-500'}`}>
                {pnlSign(cumulativePnl)}{formatBalance(cumulativePnl)}
              </span>
            </div>
          )}
        </div>
      )}

      {/* Add account form */}
      {adding ? (
        <div className="space-y-1.5">
          <input
            autoFocus
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            onKeyDown={(e) => { if (e.key === 'Escape') { setAdding(false); setNewName(''); setNewBalance(''); } }}
            placeholder="Account name"
            className="w-full text-xs border border-gray-300 rounded px-2 py-1.5 focus:outline-none focus:border-blue-400"
          />
          <input
            type="number"
            min="0"
            step="any"
            value={newBalance}
            onChange={(e) => setNewBalance(e.target.value)}
            onKeyDown={(e) => { if (e.key === 'Enter') handleCreate(); if (e.key === 'Escape') { setAdding(false); setNewName(''); setNewBalance(''); } }}
            placeholder="Initial balance (e.g. 10000)"
            className="w-full text-xs border border-gray-300 rounded px-2 py-1.5 focus:outline-none focus:border-blue-400"
          />
          <div className="flex gap-1">
            <button
              onClick={handleCreate}
              disabled={saving || !newName.trim() || !newBalance}
              className="flex-1 text-xs py-1.5 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-40 transition-colors font-medium"
            >
              {saving ? 'Adding...' : 'Add Account'}
            </button>
            <button
              onClick={() => { setAdding(false); setNewName(''); setNewBalance(''); }}
              className="text-xs px-2 py-1.5 text-gray-400 hover:text-gray-600 border border-gray-200 rounded"
            >
              ✕
            </button>
          </div>
        </div>
      ) : (
        <button
          onClick={() => setAdding(true)}
          className="text-[11px] text-gray-400 hover:text-blue-600 transition-colors"
        >
          + New account
        </button>
      )}
    </div>
  );
}
