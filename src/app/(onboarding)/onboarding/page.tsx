import { redirect } from 'next/navigation';
import { getAccounts } from '@/lib/db/accounts';
import { OnboardingClient } from './OnboardingClient';

export default async function OnboardingPage() {
  const accounts = await getAccounts();
  if (accounts.length > 0) redirect('/dashboard');
  return <OnboardingClient />;
}
