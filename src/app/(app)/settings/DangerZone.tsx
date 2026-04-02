'use client';

import { useState } from 'react';
import { closeEdgelogAccount } from '@/app/actions/account';
import { Button } from '@/components/ui/Button';

export function DangerZone({ userEmail }: { userEmail: string }) {
  const [confirming, setConfirming] = useState(false);
  const [emailInput, setEmailInput] = useState('');
  const [closing, setClosing] = useState(false);
  const [error, setError] = useState('');

  async function handleClose() {
    if (emailInput !== userEmail) return;
    setClosing(true);
    const result = await closeEdgelogAccount();
    if (result?.error) {
      setError(result.error);
      setClosing(false);
    } else {
      window.location.href = '/';
    }
  }

  return (
    <div className="border border-red-200 rounded-xl p-6 space-y-3 bg-white">
      <p className="text-[11px] font-semibold uppercase tracking-wide text-red-600">Danger Zone</p>
      {!confirming ? (
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <p className="text-sm font-medium text-gray-900">Close account</p>
            <p className="text-xs text-gray-500 mt-0.5">
              Permanently delete your Edgelog account and all data.
            </p>
          </div>
          <Button size="sm" variant="danger" onClick={() => setConfirming(true)} className="shrink-0">
            Close account
          </Button>
        </div>
      ) : (
        <div className="space-y-3">
          <p className="text-sm text-gray-700">
            This will permanently delete your account, all trades, journal entries, and data.{' '}
            <strong>This cannot be undone.</strong>
          </p>
          <p className="text-sm text-gray-700">
            Type <span className="font-mono font-medium text-gray-900">{userEmail}</span> to confirm:
          </p>
          <input
            type="email"
            value={emailInput}
            onChange={(e) => setEmailInput(e.target.value)}
            placeholder={userEmail}
            className="w-full text-sm border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-400"
          />
          {error && <p className="text-sm text-red-600">{error}</p>}
          <div className="flex gap-2">
            <Button
              size="sm"
              variant="danger"
              loading={closing}
              disabled={emailInput !== userEmail}
              onClick={handleClose}
            >
              Permanently close account
            </Button>
            <Button
              size="sm"
              variant="ghost"
              onClick={() => { setConfirming(false); setEmailInput(''); setError(''); }}
            >
              Cancel
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
