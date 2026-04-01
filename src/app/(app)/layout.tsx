import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { createServerClient } from '@/lib/supabase/server';
import { Sidebar } from '@/components/layout/Sidebar';
import { BottomNav } from '@/components/layout/BottomNav';
import { MobileAccountBar } from '@/components/layout/MobileAccountBar';

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const supabase = createServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect('/login');
  }

  const activeAccountId = cookies().get('active_account_id')?.value ?? null;

  return (
    <div className="flex min-h-screen bg-gray-50">
      {/* Sidebar — desktop only */}
      <div className="hidden md:flex">
        <Sidebar userEmail={user.email ?? null} activeAccountId={activeAccountId} />
      </div>

      {/* Main content */}
      <main className="flex-1 flex flex-col overflow-hidden page-enter pb-16 md:pb-0">
        <MobileAccountBar activeAccountId={activeAccountId} />
        {children}
      </main>

      {/* Bottom nav — mobile only */}
      <BottomNav />
    </div>
  );
}
