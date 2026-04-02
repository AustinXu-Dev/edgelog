'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createAccountAndActivate } from '@/app/actions/account';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';

export function OnboardingClient() {
  const router = useRouter();
  const [name, setName] = useState('');
  const [balance, setBalance] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    const bal = parseFloat(balance);
    if (!name.trim()) return setError('Account name is required');
    if (isNaN(bal) || bal < 0) return setError('Enter a valid initial balance');

    setLoading(true);
    const result = await createAccountAndActivate(name, bal);
    if ('error' in result) {
      setError(result.error);
      setLoading(false);
    } else {
      router.push('/dashboard');
    }
  }

  return (
    <div className="bg-white border border-gray-200 rounded-xl shadow-sm p-8">
      <div className="mb-6">
        <h2 className="text-lg font-semibold text-gray-900">Set up your trading account</h2>
        <p className="text-sm text-gray-500 mt-1">
          Create an account to start tracking your trades and P&amp;L.
        </p>
      </div>
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <Input
          label="Account name"
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="e.g. Apex Funded, Personal Account"
          required
        />
        <Input
          label="Initial balance ($)"
          type="number"
          value={balance}
          onChange={(e) => setBalance(e.target.value)}
          placeholder="e.g. 50000"
          min="0"
          step="0.01"
          required
        />
        {error && <p className="text-sm text-red-600">{error}</p>}
        <Button type="submit" loading={loading} className="w-full mt-2">
          Get started
        </Button>
      </form>
    </div>
  );
}
