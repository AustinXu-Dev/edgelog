'use client';

import { useRouter, usePathname, useSearchParams } from 'next/navigation';
import { Select } from '@/components/ui/Select';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';

export function TradeFilters() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const params = new URLSearchParams();
    fd.forEach((v, k) => { if (v) params.set(k, v as string); });
    router.push(`${pathname}?${params.toString()}`);
  }

  function handleReset() {
    router.push(pathname);
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-wrap items-end gap-3">
      <Select
        label="Instrument"
        name="instrument"
        defaultValue={searchParams.get('instrument') ?? ''}
        options={[
          { value: '', label: 'All' },
          { value: 'NDX100', label: 'NDX100' },
          { value: 'SPX500', label: 'SPX500' },
          { value: 'NQ', label: 'NQ' },
          { value: 'ES', label: 'ES' },
        ]}
        className="w-32"
      />
      <Select
        label="Direction"
        name="direction"
        defaultValue={searchParams.get('direction') ?? ''}
        options={[
          { value: '', label: 'All' },
          { value: 'long', label: 'Long' },
          { value: 'short', label: 'Short' },
        ]}
        className="w-28"
      />
      <Select
        label="Status"
        name="status"
        defaultValue={searchParams.get('status') ?? ''}
        options={[
          { value: '', label: 'All' },
          { value: 'closed', label: 'Closed' },
          { value: 'open', label: 'Open' },
        ]}
        className="w-28"
      />
      <Input label="From" type="date" name="from" defaultValue={searchParams.get('from') ?? ''} className="w-36" />
      <Input label="To" type="date" name="to" defaultValue={searchParams.get('to') ?? ''} className="w-36" />
      <div className="flex gap-2">
        <Button type="submit" variant="secondary" size="sm">Filter</Button>
        <Button type="button" variant="ghost" size="sm" onClick={handleReset}>Reset</Button>
      </div>
    </form>
  );
}
