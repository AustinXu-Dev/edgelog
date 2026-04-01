'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { createBrowserClient } from '@/lib/supabase/client';
import { setActiveAccount } from '@/app/actions/account';
import type { TradingAccount } from '@/lib/types';

interface Props {
  activeAccountId: string | null;
}

export function MobileAccountBar({ activeAccountId }: Props) {
  const supabase = createBrowserClient();
  const router = useRouter();
  const [accounts, setAccounts] = useState<TradingAccount[]>([]);
  const [open, setOpen] = useState(false);
  const [adding, setAdding] = useState(false);
  const [newName, setNewName] = useState('');
  const [newBalance, setNewBalance] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    supabase
      .from('trading_accounts')
      .select('*')
      .order('created_at', { ascending: true })
      .then(({ data }) => setAccounts(data ?? []));
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

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

  return (
    <div className="md:hidden relative border-b border-gray-200 bg-white z-40">
      {/* Compact bar */}
      <button
        onClick={() => setOpen((v) => !v)}
        className="w-full flex items-center justify-between px-4 py-2 text-sm"
      >
        <div className="flex items-center gap-2 text-gray-600">
          <i className="lni lni-briefcase text-base text-gray-400" />
          <span className="font-medium text-gray-800">{label}</span>
        </div>
        <i className={`lni lni-chevron-down text-gray-400 text-xs transition-transform ${open ? 'rotate-180' : ''}`} />
      </button>

      {/* Dropdown panel */}
      {open && (
        <div className="absolute top-full left-0 right-0 bg-white border-b border-gray-200 shadow-md px-4 py-3 space-y-2">
          {/* All accounts option */}
          <button
            onClick={() => handleSwitch(null)}
            className={`w-full text-left text-sm px-3 py-2 rounded-lg transition-colors ${
              !activeAccountId ? 'bg-blue-50 text-blue-600 font-medium' : 'text-gray-700 hover:bg-gray-50'
            }`}
          >
            All accounts
          </button>

          {accounts.map((a) => (
            <button
              key={a.id}
              onClick={() => handleSwitch(a.id)}
              className={`w-full text-left text-sm px-3 py-2 rounded-lg transition-colors ${
                a.id === activeAccountId ? 'bg-blue-50 text-blue-600 font-medium' : 'text-gray-700 hover:bg-gray-50'
              }`}
            >
              {a.name}
            </button>
          ))}

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
