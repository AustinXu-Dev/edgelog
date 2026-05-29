'use client';

import { useState, useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { createBrowserClient } from '@/lib/supabase/client';
import { setActiveAccount, recordWithdrawalAction } from '@/app/actions/account';
import type { TradingAccount } from '@/lib/types';

interface Props {
  activeAccountId: string | null;
  initialAccounts: TradingAccount[];
}

function formatBalance(n: number): string {
  return '$' + n.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

function pnlSign(n: number): string {
  return n > 0 ? '+' : '';
}

function StatusBadge({ status }: { status: TradingAccount['status'] }) {
  if (status === 'active') return null;
  return (
    <span className={`text-[9px] font-semibold uppercase tracking-wide px-1 py-0.5 rounded ${
      status === 'breached' ? 'bg-red-100 text-red-600' : status === 'passed' ? 'bg-emerald-100 text-emerald-600' : 'bg-gray-100 text-gray-500'
    }`}>
      {status}
    </span>
  );
}

export function AccountSwitcher({ activeAccountId, initialAccounts }: Props) {
  const supabase = createBrowserClient();
  const router = useRouter();
  const pathname = usePathname();
  const [accounts, setAccounts] = useState<TradingAccount[]>(initialAccounts);
  const [adding, setAdding] = useState(false);
  const [newName, setNewName] = useState('');
  const [newBalance, setNewBalance] = useState('');
  const [saving, setSaving] = useState(false);
  const [cumulativePnl, setCumulativePnl] = useState<number | null>(null);
  const [totalAdjustments, setTotalAdjustments] = useState<number>(0);
  const [showWithdraw, setShowWithdraw] = useState(false);
  const [withdrawAmount, setWithdrawAmount] = useState('');
  const [withdrawNote, setWithdrawNote] = useState('');
  const [withdrawing, setWithdrawing] = useState(false);
  const [withdrawError, setWithdrawError] = useState('');

  // Sync when server re-renders with updated accounts (e.g. after Settings creates one)
  useEffect(() => {
    setAccounts(initialAccounts);
  }, [initialAccounts]); // eslint-disable-line react-hooks/exhaustive-deps

  // Fetch cumulative P&L and total adjustments for the active account.
  // Re-runs on pathname change so balance updates after a new trade is logged.
  useEffect(() => {
    if (!activeAccountId) { setCumulativePnl(null); setTotalAdjustments(0); return; }

    Promise.all([
      supabase.rpc('get_account_pnl', { p_account_id: activeAccountId }),
      supabase.from('account_balance_adjustments').select('amount').eq('account_id', activeAccountId),
    ]).then(([{ data: pnlData }, { data: adjData }]) => {
      setCumulativePnl(pnlData ?? 0);
      setTotalAdjustments(adjData && adjData.length > 0 ? adjData.reduce((sum, row) => sum + row.amount, 0) : 0);
    });
  }, [activeAccountId, pathname]); // eslint-disable-line react-hooks/exhaustive-deps

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

  async function handleWithdraw() {
    const amount = parseFloat(withdrawAmount);
    if (isNaN(amount) || amount <= 0) { setWithdrawError('Enter a valid amount'); return; }
    if (!activeAccountId) return;

    setWithdrawing(true);
    setWithdrawError('');
    const result = await recordWithdrawalAction(activeAccountId, amount, withdrawNote || undefined);
    if (result.error) {
      setWithdrawError(result.error);
      setWithdrawing(false);
      return;
    }
    setTotalAdjustments((prev) => prev - amount);
    setWithdrawAmount('');
    setWithdrawNote('');
    setShowWithdraw(false);
    setWithdrawing(false);
    router.refresh();
  }

  const activeAccount = accounts.find((a) => a.id === activeAccountId) ?? null;
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
    <div className="px-3 py-3 border-b border-gray-200 space-y-2">
      <p className="text-[10px] font-semibold uppercase tracking-wide text-gray-400">Account</p>

      <select
        value={activeAccountId ?? ''}
        onChange={(e) => handleSwitch(e.target.value || null)}
        className="w-full text-xs bg-gray-50 border border-gray-200 rounded px-2 py-1.5 text-gray-700 focus:outline-none focus:border-blue-400 cursor-pointer"
      >
        {sortedAccounts.map((a) => (
          <option key={a.id} value={a.id}>
            {a.name}{a.status !== 'active' ? ` (${a.status})` : ''}
          </option>
        ))}
        <option value="">All accounts</option>
      </select>

      {/* Active account balance info */}
      {activeAccount && (
        <div className="bg-gray-50 border border-gray-100 rounded-lg px-2.5 py-2 space-y-1">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1">
              <span className="text-[10px] text-gray-400">Balance</span>
              <StatusBadge status={activeAccount.status} />
            </div>
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
          {totalAdjustments !== 0 && (
            <div className="flex items-center justify-between">
              <span className="text-[10px] text-gray-400">{totalAdjustments < 0 ? 'Withdrawn' : 'Deposited'}</span>
              <span className={`text-[11px] font-mono ${totalAdjustments < 0 ? 'text-orange-600' : 'text-emerald-600'}`}>
                {totalAdjustments < 0 ? '-' : '+'}{formatBalance(Math.abs(totalAdjustments))}
              </span>
            </div>
          )}

          {/* Withdraw button — only for active accounts */}
          {activeAccount.status === 'active' && (
            <div className="pt-1">
              {showWithdraw ? (
                <div className="space-y-1.5">
                  <input
                    autoFocus
                    type="number"
                    min="0.01"
                    step="any"
                    value={withdrawAmount}
                    onChange={(e) => setWithdrawAmount(e.target.value)}
                    onKeyDown={(e) => { if (e.key === 'Enter') handleWithdraw(); if (e.key === 'Escape') setShowWithdraw(false); }}
                    placeholder="Amount to withdraw"
                    className="w-full text-xs border border-gray-300 rounded px-2 py-1.5 focus:outline-none focus:border-blue-400"
                  />
                  <input
                    type="text"
                    value={withdrawNote}
                    onChange={(e) => setWithdrawNote(e.target.value)}
                    placeholder="Note (optional)"
                    className="w-full text-xs border border-gray-300 rounded px-2 py-1.5 focus:outline-none focus:border-blue-400"
                  />
                  {withdrawError && <p className="text-[10px] text-red-500">{withdrawError}</p>}
                  <div className="flex gap-1">
                    <button
                      onClick={handleWithdraw}
                      disabled={withdrawing || !withdrawAmount}
                      className="flex-1 text-xs py-1.5 bg-orange-500 text-white rounded hover:bg-orange-600 disabled:opacity-40 transition-colors font-medium"
                    >
                      {withdrawing ? 'Saving...' : 'Record'}
                    </button>
                    <button
                      onClick={() => { setShowWithdraw(false); setWithdrawAmount(''); setWithdrawNote(''); setWithdrawError(''); }}
                      className="text-xs px-2 py-1.5 text-gray-400 hover:text-gray-600 border border-gray-200 rounded"
                    >
                      ✕
                    </button>
                  </div>
                </div>
              ) : (
                <button
                  onClick={() => setShowWithdraw(true)}
                  className="text-[11px] text-orange-500 hover:text-orange-600 transition-colors"
                >
                  − Withdraw profit
                </button>
              )}
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
