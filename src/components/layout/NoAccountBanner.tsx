'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createAccountAndActivate } from '@/app/actions/account';

export function NoAccountBanner() {
  const router = useRouter();
  const [adding, setAdding] = useState(false);
  const [name, setName] = useState('');
  const [balance, setBalance] = useState('');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  async function handleCreate() {
    setError('');
    const bal = parseFloat(balance);
    if (!name.trim()) return setError('Name required');
    if (isNaN(bal) || bal < 0) return setError('Invalid balance');

    setSaving(true);
    const result = await createAccountAndActivate(name, bal);
    if ('error' in result) {
      setError(result.error);
      setSaving(false);
    } else {
      router.refresh();
    }
  }

  return (
    <div className="bg-amber-50 border-b border-amber-200 px-4 py-3">
      {!adding ? (
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className="text-amber-500 text-sm font-semibold">!</span>
            <p className="text-sm text-amber-800">
              No trading account set up yet — create one to start tracking trades.
            </p>
          </div>
          <button
            onClick={() => setAdding(true)}
            className="shrink-0 text-xs font-medium text-amber-700 underline hover:text-amber-900"
          >
            Create account
          </button>
        </div>
      ) : (
        <div className="space-y-2">
          <p className="text-sm font-medium text-amber-800">Create your first trading account</p>
          <div className="flex flex-col sm:flex-row gap-2">
            <input
              type="text"
              placeholder="Account name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="flex-1 text-sm border border-amber-300 rounded px-3 py-1.5 focus:outline-none focus:border-blue-400 bg-white"
            />
            <input
              type="number"
              placeholder="Initial balance"
              value={balance}
              onChange={(e) => setBalance(e.target.value)}
              min="0"
              step="0.01"
              className="flex-1 text-sm border border-amber-300 rounded px-3 py-1.5 focus:outline-none focus:border-blue-400 bg-white"
            />
            <button
              onClick={handleCreate}
              disabled={saving || !name.trim() || !balance}
              className="text-sm px-4 py-1.5 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-40 font-medium"
            >
              {saving ? 'Creating...' : 'Create'}
            </button>
            <button
              onClick={() => { setAdding(false); setError(''); }}
              className="text-sm px-2 py-1.5 text-gray-500 hover:text-gray-700"
            >
              Cancel
            </button>
          </div>
          {error && <p className="text-xs text-red-600">{error}</p>}
        </div>
      )}
    </div>
  );
}
