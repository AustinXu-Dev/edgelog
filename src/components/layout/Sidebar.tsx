'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { createBrowserClient } from '@/lib/supabase/client';
import { AccountSwitcher } from './AccountSwitcher';

const navItems = [
  { href: '/dashboard', label: 'Dashboard', icon: 'lni-home-2' },
  { href: '/trades', label: 'Trades', icon: 'lni-bar-chart-4' },
  { href: '/journal', label: 'Journal', icon: 'lni-notebook-1' },
  { href: '/settings', label: 'Settings', icon: 'lni-gear-1' },
];

interface SidebarProps {
  userEmail: string | null;
  activeAccountId: string | null;
}

export function Sidebar({ userEmail, activeAccountId }: SidebarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const supabase = createBrowserClient();

  async function handleSignOut() {
    await supabase.auth.signOut();
    router.push('/login');
    router.refresh();
  }

  return (
    <aside className="flex flex-col w-60 min-h-screen bg-white border-r border-gray-200">
      {/* Logo */}
      <div className="px-5 py-5 border-b border-gray-200">
        <span className="text-lg font-bold text-gray-900 tracking-tight">Edgelog</span>
      </div>

      {/* Account Switcher */}
      <AccountSwitcher activeAccountId={activeAccountId} />

      {/* Nav */}
      <nav className="flex-1 px-3 py-4 flex flex-col gap-1">
        {navItems.map((item) => {
          const isActive =
            item.href === '/dashboard'
              ? pathname === '/dashboard'
              : pathname.startsWith(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                isActive
                  ? 'bg-blue-50 text-blue-600'
                  : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
              }`}
            >
              <i className={`lni ${item.icon} text-base w-4 text-center`} />
              {item.label}
            </Link>
          );
        })}

        <div className="mt-4 border-t border-gray-200 pt-4">
          <Link
            href="/trades/new"
            className="flex items-center justify-center gap-2 w-full px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium transition-colors"
          >
            <i className="lni lni-plus text-base" />
            New Trade
          </Link>
        </div>
      </nav>

      {/* User */}
      <div className="px-4 py-4 border-t border-gray-200">
        <p className="text-xs text-gray-500 truncate mb-2">{userEmail}</p>
        <button
          onClick={handleSignOut}
          className="flex items-center gap-1.5 text-xs text-gray-500 hover:text-gray-700 transition-colors"
        >
          <i className="lni lni-exit text-sm" />
          Sign out
        </button>
      </div>
    </aside>
  );
}
