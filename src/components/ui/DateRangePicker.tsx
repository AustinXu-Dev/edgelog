'use client';

import { useRouter, usePathname, useSearchParams } from 'next/navigation';
import { Input } from './Input';
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
    <form onSubmit={handleApply} className="flex items-end gap-2">
      <Input label="From" type="date" name="from" defaultValue={from} className="w-36" />
      <Input label="To" type="date" name="to" defaultValue={to} className="w-36" />
      <Button type="submit" variant="secondary" size="sm">
        Apply
      </Button>
    </form>
  );
}
