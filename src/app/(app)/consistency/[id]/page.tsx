import { notFound } from 'next/navigation';
import { getCalculatorWithDays } from '@/lib/db/consistency';
import { getAccounts, getAccountCurrentBalance } from '@/lib/db/accounts';
import { Topbar } from '@/components/layout/Topbar';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import Link from 'next/link';
import { CalculatorEditor } from './CalculatorEditor';

interface PageProps {
  params: { id: string };
}

export default async function ConsistencyCalculatorPage({ params }: PageProps) {
  const calculator = await getCalculatorWithDays(params.id);
  if (!calculator) notFound();

  const accounts = await getAccounts();
  const linkedAccountBalance = calculator.account_id
    ? await getAccountCurrentBalance(calculator.account_id)
    : null;

  return (
    <div className="flex flex-col h-full">
      <Topbar
        title={calculator.name}
        actions={
          <Link href="/consistency">
            <Button variant="ghost" size="sm">Back</Button>
          </Link>
        }
      />
      <div className="flex-1 overflow-y-auto p-4 md:p-6">
        <Card>
          <CalculatorEditor
            calculator={calculator}
            accounts={accounts}
            linkedAccountBalance={linkedAccountBalance}
          />
        </Card>
      </div>
    </div>
  );
}
