'use client';

import { useState, useRef, useEffect } from 'react';
import { useRouter, usePathname, useSearchParams } from 'next/navigation';
import { Button } from '@/components/ui/Button';
import type { TradingAccount } from '@/lib/types';

interface Props {
  accounts: TradingAccount[];
  selectedIds: string[]; // [] means "all accounts", [id,...] means specific accounts
}

export function DashboardAccountPicker({ accounts, selectedIds }: Props) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const ref = useRef<HTMLDivElement>(null);
  const [open, setOpen] = useState(false);
  // null = "all accounts" mode; string[] = specific account IDs
  const [local, setLocal] = useState<string[] | null>(null);

  function handleOpen() {
    // selectedIds empty (all accounts) → null; otherwise the specific IDs
    setLocal(selectedIds.length === 0 ? null : [...selectedIds]);
    setOpen(true);
  }

  useEffect(() => {
    function onMouseDown(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener('mousedown', onMouseDown);
    return () => document.removeEventListener('mousedown', onMouseDown);
  }, []);

  function handleApply() {
    const params = new URLSearchParams(searchParams.toString());
    if (local === null || local.length === 0) {
      // Explicit "all accounts"
      params.set('accs', 'all');
    } else {
      params.set('accs', local.join(','));
    }
    router.push(`${pathname}?${params.toString()}`);
    setOpen(false);
  }

  function handleClear() {
    // Remove ?accs → dashboard falls back to the global active account
    const params = new URLSearchParams(searchParams.toString());
    params.delete('accs');
    router.push(`${pathname}?${params.toString()}`);
    setOpen(false);
  }

  const isFiltered = searchParams.has('accs');
  const isAllAccounts = local === null || local.length === 0;

  // Button label always reflects what is actually being shown
  const label =
    selectedIds.length === 0
      ? 'All Accounts'
      : selectedIds.length === 1
      ? (accounts.find((a) => a.id === selectedIds[0])?.name ?? 'Account')
      : `${selectedIds.length} Accounts`;

  return (
    <div className="relative" ref={ref}>
      <Button
        variant={isFiltered ? 'primary' : 'secondary'}
        size="sm"
        onClick={() => (open ? setOpen(false) : handleOpen())}
      >
        <i className="lni lni-briefcase text-sm" />
        {label}
      </Button>

      {open && (
        <div className="absolute right-0 top-full mt-1.5 bg-white border border-gray-200 rounded-xl shadow-lg z-50 w-56 overflow-hidden">
          <div className="max-h-64 overflow-y-auto py-1">
            {/* All accounts option */}
            <label className="flex items-center gap-2.5 px-3 py-2 hover:bg-gray-50 cursor-pointer border-b border-gray-100">
              <input
                type="checkbox"
                checked={isAllAccounts}
                onChange={() => setLocal(null)}
                className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
              <span className="text-sm font-medium text-gray-800">All accounts</span>
            </label>

            {/* Individual accounts */}
            {accounts.map((a) => (
              <label
                key={a.id}
                className="flex items-center gap-2.5 px-3 py-2 hover:bg-gray-50 cursor-pointer"
              >
                <input
                  type="checkbox"
                  checked={!isAllAccounts && (local ?? []).includes(a.id)}
                  onChange={() => {
                    // Selecting an individual account exits "all" mode
                    setLocal((prev) => {
                      const current = prev ?? [];
                      return current.includes(a.id)
                        ? current.filter((x) => x !== a.id)
                        : [...current, a.id];
                    });
                  }}
                  className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                <span className="text-sm text-gray-800 flex-1 truncate">{a.name}</span>
                {a.status !== 'active' && (
                  <span className={`text-[10px] uppercase font-semibold flex-shrink-0 ${
                    a.status === 'breached' ? 'text-red-500'
                    : a.status === 'passed' ? 'text-emerald-600'
                    : 'text-gray-400'
                  }`}>
                    {a.status}
                  </span>
                )}
              </label>
            ))}
          </div>

          <div className="flex gap-2 px-3 py-2.5 border-t border-gray-100 bg-gray-50">
            <Button size="sm" onClick={handleApply} className="flex-1">
              Apply
            </Button>
            {isFiltered && (
              <Button size="sm" variant="ghost" onClick={handleClear}>
                Reset
              </Button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
