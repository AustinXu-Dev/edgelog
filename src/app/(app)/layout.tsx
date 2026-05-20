import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { createServerClient } from '@/lib/supabase/server';
import { getAccounts } from '@/lib/db/accounts';
import { Sidebar } from '@/components/layout/Sidebar';
import { BottomNav } from '@/components/layout/BottomNav';
import { MobileAccountBar } from '@/components/layout/MobileAccountBar';
import { NoAccountBanner } from '@/components/layout/NoAccountBanner';
import { HelpGuide } from '@/components/layout/HelpGuide';
import { InactivityLogout } from '@/components/layout/InactivityLogout';

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const supabase = createServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect('/login');
  }

  const [accounts] = await Promise.all([getAccounts()]);
  const hasAccounts = accounts.length > 0;
  const activeAccountId = cookies().get('active_account_id')?.value ?? null;

  return (
    <div className="flex h-screen overflow-hidden bg-gray-50">
      {/* Sidebar — desktop only */}
      <div className="hidden md:flex">
        <Sidebar userEmail={user.email ?? null} activeAccountId={activeAccountId} accounts={accounts} />
      </div>

      {/* Main content */}
      <main className="flex-1 flex flex-col overflow-hidden page-enter pb-16 md:pb-0">
        <MobileAccountBar activeAccountId={activeAccountId} initialAccounts={accounts} />
        {!hasAccounts && <NoAccountBanner />}
        {children}
      </main>

      {/* Bottom nav — mobile only */}
      <BottomNav />

      {/* Floating help button — mobile only */}
      <HelpGuide variant="floating" />

      {/* Auto sign-out after 30 min inactivity */}
      <InactivityLogout />
    </div>
  );
}
