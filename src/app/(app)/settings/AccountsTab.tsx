'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { createBrowserClient } from '@/lib/supabase/client';
import { deleteAccountAction, createAccountAction, updateAccountStatusAction, recordWithdrawalAction, recordDepositAction } from '@/app/actions/account';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import type { TradingAccount, BalanceAdjustment } from '@/lib/types';

interface Props {
  accounts: TradingAccount[];
  activeAccountId: string | null;
}

type DeleteMode = 'keep' | 'delete';

function StatusBadge({ status }: { status: TradingAccount['status'] }) {
  if (status === 'active') return null;
  const styles: Record<TradingAccount['status'], string> = {
    active: '',
    breached: 'bg-red-50 text-red-600',
    archived: 'bg-gray-100 text-gray-500',
  };
  return (
    <span className={`text-[10px] font-semibold uppercase tracking-wide px-1.5 py-0.5 rounded ${styles[status]}`}>
      {status}
    </span>
  );
}

function AccountBalanceRow({ accountId, initialBalance }: { accountId: string; initialBalance: number }) {
  const supabase = createBrowserClient();
  const [pnl, setPnl] = useState<number | null>(null);
  const [adjustments, setAdjustments] = useState<number>(0);

  useEffect(() => {
    Promise.all([
      supabase.rpc('get_account_pnl', { p_account_id: accountId }),
      supabase.from('account_balance_adjustments').select('amount').eq('account_id', accountId),
    ]).then(([{ data: pnlData }, { data: adjData }]) => {
      setPnl(pnlData ?? 0);
      setAdjustments(adjData && adjData.length > 0 ? adjData.reduce((sum, r) => sum + r.amount, 0) : 0);
    });
  }, [accountId]); // eslint-disable-line react-hooks/exhaustive-deps

  const balance = pnl !== null ? initialBalance + pnl + adjustments : null;

  return (
    <div className="flex items-center gap-4 mt-1.5 text-xs text-gray-500">
      <span>
        Balance:{' '}
        <span className="font-medium text-gray-800">
          {balance !== null
            ? '$' + balance.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
            : '—'}
        </span>
      </span>
      {pnl !== null && (
        <span>
          P&amp;L:{' '}
          <span className={`font-medium font-mono ${pnl > 0 ? 'text-emerald-600' : pnl < 0 ? 'text-red-600' : 'text-gray-500'}`}>
            {pnl >= 0 ? '+' : ''}${pnl.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </span>
        </span>
      )}
    </div>
  );
}

function AdjustmentHistory({ accountId }: { accountId: string }) {
  const supabase = createBrowserClient();
  const [items, setItems] = useState<BalanceAdjustment[] | null>(null);
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);

  async function load() {
    setLoading(true);
    const { data } = await supabase
      .from('account_balance_adjustments')
      .select('*')
      .eq('account_id', accountId)
      .order('created_at', { ascending: false });
    setItems(data ?? []);
    setLoading(false);
  }

  function toggle() {
    if (!open && items === null) load();
    setOpen((v) => !v);
  }

  return (
    <div className="mt-2">
      <button
        onClick={toggle}
        className="text-xs text-gray-500 hover:text-gray-700 flex items-center gap-1"
      >
        <span>{open ? '▾' : '▸'}</span>
        <span>History</span>
      </button>
      {open && (
        <div className="mt-2 border border-gray-100 rounded-lg overflow-hidden">
          {loading ? (
            <p className="text-xs text-gray-400 px-3 py-2">Loading…</p>
          ) : items && items.length === 0 ? (
            <p className="text-xs text-gray-400 px-3 py-2">No adjustments yet.</p>
          ) : (
            <table className="w-full text-xs">
              <thead className="bg-gray-50">
                <tr>
                  <th className="text-left px-3 py-1.5 font-medium text-gray-500">Date</th>
                  <th className="text-left px-3 py-1.5 font-medium text-gray-500">Type</th>
                  <th className="text-right px-3 py-1.5 font-medium text-gray-500">Amount</th>
                  <th className="text-left px-3 py-1.5 font-medium text-gray-500">Note</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {items?.map((item) => (
                  <tr key={item.id}>
                    <td className="px-3 py-1.5 text-gray-600">
                      {new Date(item.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                    </td>
                    <td className="px-3 py-1.5">
                      <span className={`font-medium ${item.type === 'withdrawal' ? 'text-orange-600' : 'text-emerald-600'}`}>
                        {item.type}
                      </span>
                    </td>
                    <td className={`px-3 py-1.5 text-right font-mono ${item.amount < 0 ? 'text-orange-600' : 'text-emerald-600'}`}>
                      {item.amount < 0 ? '-' : '+'}${Math.abs(item.amount).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </td>
                    <td className="px-3 py-1.5 text-gray-500">{item.note ?? '—'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      )}
    </div>
  );
}

function WithdrawDepositForm({ accountId, onDone }: { accountId: string; onDone: () => void }) {
  const [mode, setMode] = useState<'withdrawal' | 'deposit'>('withdrawal');
  const [amount, setAmount] = useState('');
  const [note, setNote] = useState('');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const val = parseFloat(amount);
    if (isNaN(val) || val <= 0) { setError('Enter a valid positive amount'); return; }

    setSaving(true);
    setError('');
    const action = mode === 'withdrawal' ? recordWithdrawalAction : recordDepositAction;
    const result = await action(accountId, val, note || undefined);
    if (result.error) {
      setError(result.error);
      setSaving(false);
      return;
    }
    setSaving(false);
    onDone();
  }

  return (
    <form onSubmit={handleSubmit} className="mt-3 border border-gray-200 rounded-lg p-3 space-y-2 bg-gray-50">
      <div className="flex gap-2">
        <button
          type="button"
          onClick={() => setMode('withdrawal')}
          className={`text-xs px-2.5 py-1 rounded font-medium transition-colors ${mode === 'withdrawal' ? 'bg-orange-500 text-white' : 'bg-white text-gray-600 border border-gray-300'}`}
        >
          Withdrawal
        </button>
        <button
          type="button"
          onClick={() => setMode('deposit')}
          className={`text-xs px-2.5 py-1 rounded font-medium transition-colors ${mode === 'deposit' ? 'bg-emerald-600 text-white' : 'bg-white text-gray-600 border border-gray-300'}`}
        >
          Deposit
        </button>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
        <Input
          label="Amount ($)"
          type="number"
          min="0.01"
          step="any"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          placeholder="e.g. 5000"
          required
        />
        <Input
          label="Note (optional)"
          value={note}
          onChange={(e) => setNote(e.target.value)}
          placeholder="e.g. Monthly profit pull"
        />
      </div>
      {error && <p className="text-xs text-red-600">{error}</p>}
      <div className="flex gap-2">
        <Button type="submit" size="sm" loading={saving}>
          Record {mode}
        </Button>
        <Button type="button" size="sm" variant="ghost" onClick={onDone}>
          Cancel
        </Button>
      </div>
    </form>
  );
}

export function AccountsTab({ accounts: initialAccounts, activeAccountId }: Props) {
  const router = useRouter();
  const [accounts, setAccounts] = useState<TradingAccount[]>(initialAccounts);
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null);
  const [deleteMode, setDeleteMode] = useState<DeleteMode>('keep');
  const [deleting, setDeleting] = useState<string | null>(null);
  const [adding, setAdding] = useState(false);
  const [newName, setNewName] = useState('');
  const [newBalance, setNewBalance] = useState('');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [showAdjustForm, setShowAdjustForm] = useState<string | null>(null);
  const [updatingStatus, setUpdatingStatus] = useState<string | null>(null);
  const [hideInactive, setHideInactive] = useState(false);

  function openConfirm(id: string) {
    setConfirmDelete(id);
    setDeleteMode('keep');
    setError('');
  }

  function closeConfirm() {
    setConfirmDelete(null);
    setError('');
  }

  async function handleDelete(id: string) {
    setDeleting(id);
    const result = await deleteAccountAction(id, deleteMode === 'delete');
    if (result.error) {
      setError(result.error);
      setDeleting(null);
    } else {
      setConfirmDelete(null);
      setDeleting(null);
      router.refresh();
    }
  }

  async function handleStatusChange(id: string, status: TradingAccount['status']) {
    setUpdatingStatus(id);
    await updateAccountStatusAction(id, status);
    setAccounts((prev) => prev.map((a) => a.id === id ? { ...a, status } : a));
    setUpdatingStatus(null);
    router.refresh();
  }

  async function handleAdd(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    const bal = parseFloat(newBalance);
    if (!newName.trim()) return setError('Account name is required');
    if (isNaN(bal) || bal < 0) return setError('Enter a valid initial balance');

    setSaving(true);
    const result = await createAccountAction(newName, bal);
    if ('error' in result) {
      setError(result.error);
    } else {
      setAdding(false);
      setNewName('');
      setNewBalance('');
      router.refresh();
    }
    setSaving(false);
  }

  const inactiveCount = accounts.filter((a) => a.status !== 'active').length;
  const visibleAccounts = hideInactive ? accounts.filter((a) => a.status === 'active') : accounts;

  return (
    <div className="space-y-4">
      {error && !confirmDelete && <p className="text-sm text-red-600">{error}</p>}

      {/* Filter toggle */}
      {inactiveCount > 0 && (
        <div className="flex justify-end">
          <button
            onClick={() => setHideInactive((v) => !v)}
            className="text-xs text-gray-500 hover:text-gray-700 flex items-center gap-1.5"
          >
            <span className={`w-7 h-4 rounded-full transition-colors flex-shrink-0 ${hideInactive ? 'bg-blue-500' : 'bg-gray-300'}`}>
              <span className={`block w-3 h-3 bg-white rounded-full shadow mt-0.5 transition-transform ${hideInactive ? 'translate-x-3.5' : 'translate-x-0.5'}`} />
            </span>
            Hide breached / archived ({inactiveCount})
          </button>
        </div>
      )}

      {accounts.length === 0 ? (
        <p className="text-sm text-gray-500">No trading accounts yet.</p>
      ) : (
        <div className="space-y-3">
          {visibleAccounts.map((account) => (
            <div key={account.id} className="border border-gray-200 rounded-lg p-4">
              {confirmDelete === account.id ? (
                <div className="space-y-3">
                  <p className="text-sm font-medium text-gray-900">
                    Delete &ldquo;{account.name}&rdquo;?
                  </p>

                  {/* Options */}
                  <div className="space-y-2">
                    <label className="flex items-start gap-3 cursor-pointer">
                      <input
                        type="radio"
                        name={`delete-mode-${account.id}`}
                        value="keep"
                        checked={deleteMode === 'keep'}
                        onChange={() => setDeleteMode('keep')}
                        className="mt-0.5"
                      />
                      <div>
                        <p className="text-sm text-gray-800 font-medium">Keep trades</p>
                        <p className="text-xs text-gray-500">Trades will be unassigned but not deleted.</p>
                      </div>
                    </label>
                    <label className="flex items-start gap-3 cursor-pointer">
                      <input
                        type="radio"
                        name={`delete-mode-${account.id}`}
                        value="delete"
                        checked={deleteMode === 'delete'}
                        onChange={() => setDeleteMode('delete')}
                        className="mt-0.5"
                      />
                      <div>
                        <p className="text-sm text-gray-800 font-medium">Delete trades and journals</p>
                        <p className="text-xs text-gray-500">
                          All trades, trade journal notes, and tags for this account will be permanently deleted.
                        </p>
                      </div>
                    </label>
                  </div>

                  {error && <p className="text-xs text-red-600">{error}</p>}

                  <div className="flex gap-2 pt-1">
                    <Button
                      size="sm"
                      variant="danger"
                      loading={deleting === account.id}
                      onClick={() => handleDelete(account.id)}
                    >
                      Confirm delete
                    </Button>
                    <Button size="sm" variant="ghost" onClick={closeConfirm}>
                      Cancel
                    </Button>
                  </div>
                </div>
              ) : (
                <div>
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <p className={`text-sm font-medium ${account.status !== 'active' ? 'text-gray-500 italic' : 'text-gray-900'}`}>
                          {account.name}
                        </p>
                        {account.id === activeAccountId && (
                          <span className="text-[10px] font-semibold uppercase tracking-wide text-blue-600 bg-blue-50 px-1.5 py-0.5 rounded">
                            Active
                          </span>
                        )}
                        <StatusBadge status={account.status} />
                      </div>
                      <p className="text-xs text-gray-500 mt-0.5">
                        Start: ${account.initial_balance.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                        {account.broker ? ` · ${account.broker}` : ''}
                      </p>
                      <AccountBalanceRow accountId={account.id} initialBalance={account.initial_balance} />
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-2 flex-shrink-0">
                      {/* Status dropdown */}
                      <select
                        value={account.status}
                        disabled={updatingStatus === account.id}
                        onChange={(e) => handleStatusChange(account.id, e.target.value as TradingAccount['status'])}
                        className="text-xs border border-gray-200 rounded px-2 py-1 bg-white text-gray-600 focus:outline-none focus:border-blue-400 disabled:opacity-50 cursor-pointer"
                      >
                        <option value="active">Active</option>
                        <option value="breached">Breached</option>
                        <option value="archived">Archived</option>
                      </select>

                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => openConfirm(account.id)}
                        className="text-red-500 hover:text-red-600 hover:bg-red-50"
                      >
                        Delete
                      </Button>
                    </div>
                  </div>

                  {/* Withdraw / Deposit */}
                  {account.status === 'active' && (
                    <div className="mt-2">
                      {showAdjustForm === account.id ? (
                        <WithdrawDepositForm
                          accountId={account.id}
                          onDone={() => { setShowAdjustForm(null); router.refresh(); }}
                        />
                      ) : (
                        <button
                          onClick={() => setShowAdjustForm(account.id)}
                          className="text-xs text-orange-500 hover:text-orange-600 font-medium"
                        >
                          + Withdraw / Deposit
                        </button>
                      )}
                    </div>
                  )}

                  {/* Adjustment history */}
                  <AdjustmentHistory accountId={account.id} />
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {adding ? (
        <form onSubmit={handleAdd} className="border border-gray-200 rounded-lg p-4 space-y-3">
          <p className="text-sm font-medium text-gray-700">New account</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <Input
              label="Account name"
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              placeholder="e.g. Apex Funded"
              required
            />
            <Input
              label="Initial balance ($)"
              type="number"
              value={newBalance}
              onChange={(e) => setNewBalance(e.target.value)}
              placeholder="e.g. 50000"
              min="0"
              step="0.01"
              required
            />
          </div>
          <div className="flex gap-2">
            <Button type="submit" size="sm" loading={saving}>Add account</Button>
            <Button
              type="button"
              size="sm"
              variant="ghost"
              onClick={() => { setAdding(false); setError(''); }}
            >
              Cancel
            </Button>
          </div>
        </form>
      ) : (
        <button
          onClick={() => setAdding(true)}
          className="text-sm text-blue-600 hover:text-blue-700 font-medium"
        >
          + Add account
        </button>
      )}
    </div>
  );
}
