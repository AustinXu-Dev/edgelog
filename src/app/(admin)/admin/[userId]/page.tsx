import { getAdminUserDetail } from '@/lib/db/admin';
import { Card } from '@/components/ui/Card';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { DeleteUserButton } from './DeleteUserButton';

function fmt(dateStr: string | null) {
  if (!dateStr) return '—';
  return new Date(dateStr).toLocaleString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

function fmtCurrency(val: number | null) {
  if (val == null) return '—';
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(val);
}

export default async function AdminUserDetailPage({ params }: { params: { userId: string } }) {
  const user = await getAdminUserDetail(params.userId);
  if (!user) notFound();

  return (
    <div className="max-w-3xl">
      <div className="mb-6">
        <Link href="/admin" className="text-sm text-gray-500 hover:text-gray-800">
          ← Users
        </Link>
        <h1 className="text-xl font-semibold text-gray-900 mt-2">{user.email}</h1>
        {user.display_name && <p className="text-sm text-gray-500">{user.display_name}</p>}
      </div>

      <div className="grid grid-cols-2 gap-4 mb-6">
        <Card title="Profile">
          <dl className="space-y-2 text-sm">
            <div className="flex justify-between">
              <dt className="text-gray-500">Email</dt>
              <dd className="text-gray-900">{user.email}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-gray-500">Display Name</dt>
              <dd className="text-gray-900">{user.display_name ?? '—'}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-gray-500">Timezone</dt>
              <dd className="text-gray-900">{user.timezone}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-gray-500">Joined</dt>
              <dd className="text-gray-900">{fmt(user.created_at)}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-gray-500">Last Sign In</dt>
              <dd className="text-gray-900">{fmt(user.last_sign_in_at)}</dd>
            </div>
          </dl>
        </Card>

        <Card title="Activity">
          <dl className="space-y-2 text-sm">
            <div className="flex justify-between">
              <dt className="text-gray-500">Total Trades</dt>
              <dd className="text-gray-900 font-medium">{user.total_trades}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-gray-500">Total P&L</dt>
              <dd
                className={`font-medium ${
                  user.total_pnl == null
                    ? 'text-gray-900'
                    : user.total_pnl >= 0
                    ? 'text-green-600'
                    : 'text-red-600'
                }`}
              >
                {fmtCurrency(user.total_pnl)}
              </dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-gray-500">Accounts</dt>
              <dd className="text-gray-900">{user.accounts.length}</dd>
            </div>
          </dl>
        </Card>
      </div>

      {user.accounts.length > 0 && (
        <Card title="Trading Accounts" className="mb-6">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-xs text-gray-500 border-b border-gray-100">
                <th className="pb-2 text-left font-medium">Name</th>
                <th className="pb-2 text-left font-medium">Broker</th>
                <th className="pb-2 text-right font-medium">Initial Balance</th>
                <th className="pb-2 text-right font-medium">Trades</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {user.accounts.map((a) => (
                <tr key={a.id}>
                  <td className="py-2 text-gray-900">{a.name}</td>
                  <td className="py-2 text-gray-500">{a.broker ?? '—'}</td>
                  <td className="py-2 text-right text-gray-900">{fmtCurrency(a.initial_balance)}</td>
                  <td className="py-2 text-right text-gray-600">{a.trade_count}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </Card>
      )}

      <Card title="Danger Zone" className="border-red-200">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-900">Delete this user</p>
            <p className="text-xs text-gray-500 mt-0.5">
              Permanently deletes the account and all associated data. This cannot be undone.
            </p>
          </div>
          <DeleteUserButton userId={user.id} email={user.email} />
        </div>
      </Card>
    </div>
  );
}
