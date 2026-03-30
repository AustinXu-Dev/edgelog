'use client';

import { useRouter, usePathname, useSearchParams } from 'next/navigation';
import { Button } from './Button';

interface DateRangePickerProps {
  from: string;
  to: string;
}

export function DateRangePicker({ from, to }: DateRangePickerProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  function handleApply(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const params = new URLSearchParams(searchParams.toString());
    params.set('from', fd.get('from') as string);
    params.set('to', fd.get('to') as string);
    router.push(`${pathname}?${params.toString()}`);
  }

  return (
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
      <Button type="submit" variant="secondary" size="sm">
        Apply
      </Button>
    </form>
  );
}
