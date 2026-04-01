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
          // Futures
          { value: 'NQ', label: 'NQ' },
          { value: 'ES', label: 'ES' },
          { value: 'MNQ', label: 'MNQ' },
          { value: 'MES', label: 'MES' },
          { value: 'YM', label: 'YM' },
          { value: 'MYM', label: 'MYM' },
          { value: 'RTY', label: 'RTY' },
          { value: 'M2K', label: 'M2K' },
          { value: 'GC', label: 'GC' },
          { value: 'MGC', label: 'MGC' },
          { value: 'CL', label: 'CL' },
          { value: 'MCL', label: 'MCL' },
          // Index CFDs
          { value: 'NDX100', label: 'NDX100' },
          { value: 'SPX500', label: 'SPX500' },
          { value: 'US30', label: 'US30' },
          { value: 'GER40', label: 'GER40' },
          // Forex
          { value: 'EURUSD', label: 'EUR/USD' },
          { value: 'GBPUSD', label: 'GBP/USD' },
          { value: 'AUDUSD', label: 'AUD/USD' },
          { value: 'NZDUSD', label: 'NZD/USD' },
          { value: 'USDJPY', label: 'USD/JPY' },
          { value: 'USDCAD', label: 'USD/CAD' },
          // Crypto
          { value: 'BTCUSD', label: 'BTC/USD' },
          { value: 'ETHUSD', label: 'ETH/USD' },
        ]}
        className="w-36"
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
