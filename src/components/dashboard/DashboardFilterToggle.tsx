'use client';

import { useState } from 'react';
import { useRouter, usePathname, useSearchParams } from 'next/navigation';
import { Button } from '@/components/ui/Button';

interface Props {
  from?: string;
  to?: string;
}

export function DashboardFilterToggle({ from, to }: Props) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const isActive = !!searchParams.get('from');
  const [open, setOpen] = useState(isActive);

  function handleApply(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const params = new URLSearchParams(searchParams.toString());
    params.set('from', fd.get('from') as string);
    params.set('to', fd.get('to') as string);
    router.push(`${pathname}?${params.toString()}`);
  }

  function handleClear() {
    const params = new URLSearchParams(searchParams.toString());
    params.delete('from');
    params.delete('to');
    router.push(`${pathname}?${params.toString()}`);
    setOpen(false);
  }

  return (
    <div className="flex items-center gap-2">
      {isActive && (
        <button
          onClick={handleClear}
          className="text-xs text-gray-400 hover:text-gray-700 flex items-center gap-1 transition-colors"
        >
          <i className="lni lni-xmark text-xs" />
          Clear filter
        </button>
      )}
      {open ? (
        <form onSubmit={handleApply} className="flex items-center gap-1.5">
          <span className="text-xs text-gray-500 font-medium">From</span>
          <input
            type="date"
            name="from"
            defaultValue={from}
            className="bg-white border border-gray-300 rounded-md px-2 py-1.5 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 w-36"
          />
          <span className="text-xs text-gray-500 font-medium">To</span>
          <input
            type="date"
            name="to"
            defaultValue={to}
            className="bg-white border border-gray-300 rounded-md px-2 py-1.5 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 w-36"
          />
          <Button type="submit" variant="secondary" size="sm">Apply</Button>
          {!isActive && (
            <Button type="button" variant="ghost" size="sm" onClick={() => setOpen(false)}>
              <i className="lni lni-xmark text-xs" />
            </Button>
          )}
        </form>
      ) : (
        <Button variant="secondary" size="sm" onClick={() => setOpen(true)}>
          <i className="lni lni-calendar text-sm" />Date Range
        </Button>
      )}
    </div>
  );
}
