'use client';

import { useState, useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { createBrowserClient } from '@/lib/supabase/client';
import { setActiveAccount } from '@/app/actions/account';
import type { TradingAccount } from '@/lib/types';

interface Props {
  activeAccountId: string | null;
  initialAccounts: TradingAccount[];
}

function StatusDot({ status }: { status: TradingAccount['status'] }) {
  if (status === 'active') return null;
  return (
    <span className={`inline-block w-2 h-2 rounded-full flex-shrink-0 ${
      status === 'breached' ? 'bg-red-500' : status === 'passed' ? 'bg-emerald-500' : 'bg-gray-400'
    }`} />
  );
}

export function MobileAccountBar({ activeAccountId, initialAccounts }: Props) {
  const supabase = createBrowserClient();
  const router = useRouter();
  const pathname = usePathname();
  const [accounts, setAccounts] = useState<TradingAccount[]>(initialAccounts);
  const [open, setOpen] = useState(false);
  const [adding, setAdding] = useState(false);
  const [newName, setNewName] = useState('');
  const [newBalance, setNewBalance] = useState('');
  const [saving, setSaving] = useState(false);
  const [cumulativePnl, setCumulativePnl] = useState<number | null>(null);
  const [totalAdjustments, setTotalAdjustments] = useState<number>(0);

  // Sync when server re-renders with updated accounts (e.g. after Settings creates one)
  useEffect(() => {
    setAccounts(initialAccounts);
  }, [initialAccounts]); // eslint-disable-line react-hooks/exhaustive-deps

  // Re-runs on pathname change so balance updates after a new trade is logged.
  useEffect(() => {
    if (!activeAccountId) { setCumulativePnl(null); setTotalAdjustments(0); return; }

    supabase
      .rpc('get_account_pnl', { p_account_id: activeAccountId })
      .then(({ data }) => setCumulativePnl(data ?? 0));

    supabase
      .from('account_balance_adjustments')
      .select('amount')
      .eq('account_id', activeAccountId)
      .then(({ data }) => {
        if (!data || data.length === 0) { setTotalAdjustments(0); return; }
        setTotalAdjustments(data.reduce((sum, row) => sum + row.amount, 0));
      });
  }, [activeAccountId, pathname]); // eslint-disable-line react-hooks/exhaustive-deps

  async function handleSwitch(id: string | null) {
    await setActiveAccount(id);
    router.refresh();
    setOpen(false);
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
    setOpen(false);
  }

  const activeAccount = accounts.find((a) => a.id === activeAccountId) ?? null;
  const label = activeAccount ? activeAccount.name : 'All accounts';
  // Show active accounts + the currently selected account (even if non-active, so it stays visible)
  const sortedAccounts = accounts.filter((a) => a.status === 'active' || a.id === activeAccountId).sort((a, b) => {
    if (a.id === activeAccountId) return -1;
    if (b.id === activeAccountId) return 1;
    return 0;
  });
  const currentBalance =
    activeAccount && cumulativePnl !== null
      ? activeAccount.initial_balance + cumulativePnl + totalAdjustments
      : null;

  return (
    <div className="md:hidden relative border-b border-gray-200 bg-white z-40">
      {/* Compact bar */}
      <button
        onClick={() => setOpen((v) => !v)}
        className="w-full flex items-center justify-between px-4 py-2 text-sm"
      >
        <div className="flex items-center gap-2 text-gray-600">
          <i className="lni lni-briefcase text-base text-gray-400" />
          <div className="flex items-center gap-1.5">
            {activeAccount && <StatusDot status={activeAccount.status} />}
            <span className={`font-medium ${activeAccount && activeAccount.status !== 'active' ? 'text-gray-500' : 'text-gray-800'}`}>
              {label}
            </span>
          </div>
          {currentBalance !== null && (
            <span className="text-xs text-gray-500">
              ${currentBalance.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </span>
          )}
        </div>
        <i className={`lni lni-chevron-down text-gray-400 text-xs transition-transform ${open ? 'rotate-180' : ''}`} />
      </button>

      {/* Dropdown panel */}
      {open && (
        <div className="absolute top-full left-0 right-0 bg-white border-b border-gray-200 shadow-md px-4 py-3 space-y-2">
          {sortedAccounts.map((a) => (
            <button
              key={a.id}
              onClick={() => handleSwitch(a.id)}
              className={`w-full text-left text-sm px-3 py-2 rounded-lg transition-colors flex items-center gap-2 ${
                a.id === activeAccountId ? 'bg-blue-50 text-blue-600 font-medium' : 'text-gray-700 hover:bg-gray-50'
              }`}
            >
              <StatusDot status={a.status} />
              <span className={a.status !== 'active' ? 'italic' : ''}>{a.name}</span>
              {a.status !== 'active' && (
                <span className={`text-[10px] uppercase font-semibold ml-auto ${
                  a.status === 'breached' ? 'text-red-500' : a.status === 'passed' ? 'text-emerald-600' : 'text-gray-400'
                }`}>
                  {a.status}
                </span>
              )}
            </button>
          ))}

          {/* All accounts option — at bottom */}
          <button
            onClick={() => handleSwitch(null)}
            className={`w-full text-left text-sm px-3 py-2 rounded-lg transition-colors ${
              !activeAccountId ? 'bg-blue-50 text-blue-600 font-medium' : 'text-gray-700 hover:bg-gray-50'
            }`}
          >
            All accounts
          </button>

          {/* Note about withdrawals */}
          <p className="text-xs text-gray-400 px-3 pt-1">
            Manage account status &amp; withdrawals in Settings.
          </p>

          {/* Add account form */}
          {adding ? (
            <div className="space-y-2 pt-1">
              <input
                autoFocus
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                placeholder="Account name"
                className="w-full text-sm border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:border-blue-400"
              />
              <input
                type="number"
                min="0"
                step="any"
                value={newBalance}
                onChange={(e) => setNewBalance(e.target.value)}
                onKeyDown={(e) => { if (e.key === 'Enter') handleCreate(); }}
                placeholder="Initial balance"
                className="w-full text-sm border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:border-blue-400"
              />
              <div className="flex gap-2">
                <button
                  onClick={handleCreate}
                  disabled={saving || !newName.trim() || !newBalance}
                  className="flex-1 text-sm py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-40 font-medium"
                >
                  {saving ? 'Adding…' : 'Add Account'}
                </button>
                <button
                  onClick={() => { setAdding(false); setNewName(''); setNewBalance(''); }}
                  className="text-sm px-3 py-2 text-gray-400 hover:text-gray-600 border border-gray-200 rounded-lg"
                >
                  ✕
                </button>
              </div>
            </div>
          ) : (
            <button
              onClick={() => setAdding(true)}
              className="w-full text-left text-sm text-blue-600 hover:text-blue-700 px-3 py-1.5 font-medium"
            >
              + New account
            </button>
          )}
        </div>
      )}
    </div>
  );
}
