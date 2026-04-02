'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { deleteAccountAction, createAccountAction } from '@/app/actions/account';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import type { TradingAccount } from '@/lib/types';

interface Props {
  accounts: TradingAccount[];
  activeAccountId: string | null;
}

type DeleteMode = 'keep' | 'delete';

export function AccountsTab({ accounts, activeAccountId }: Props) {
  const router = useRouter();
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null);
  const [deleteMode, setDeleteMode] = useState<DeleteMode>('keep');
  const [deleting, setDeleting] = useState<string | null>(null);
  const [adding, setAdding] = useState(false);
  const [newName, setNewName] = useState('');
  const [newBalance, setNewBalance] = useState('');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

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

  return (
    <div className="space-y-4">
      {error && !confirmDelete && <p className="text-sm text-red-600">{error}</p>}

      {accounts.length === 0 ? (
        <p className="text-sm text-gray-500">No trading accounts yet.</p>
      ) : (
        <div className="space-y-2">
          {accounts.map((account) => (
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
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <div className="flex items-center gap-2">
                      <p className="text-sm font-medium text-gray-900">{account.name}</p>
                      {account.id === activeAccountId && (
                        <span className="text-[10px] font-semibold uppercase tracking-wide text-blue-600 bg-blue-50 px-1.5 py-0.5 rounded">
                          Active
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-gray-500 mt-0.5">
                      Starting balance: ${account.initial_balance.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      {account.broker ? ` · ${account.broker}` : ''}
                    </p>
                  </div>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => openConfirm(account.id)}
                    className="text-red-500 hover:text-red-600 hover:bg-red-50"
                  >
                    Delete
                  </Button>
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
