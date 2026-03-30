'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

const navItems = [
  { href: '/dashboard', label: 'Home', icon: 'lni-home-2' },
  { href: '/trades', label: 'Trades', icon: 'lni-bar-chart-4' },
  { href: '/journal', label: 'Journal', icon: 'lni-notebook-1' },
  { href: '/settings', label: 'Settings', icon: 'lni-gear-1' },
];

export function BottomNav() {
  const pathname = usePathname();

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-gray-200 flex items-stretch safe-area-bottom">
      {navItems.map((item, idx) => {
        const isActive =
          item.href === '/dashboard'
            ? pathname === '/dashboard'
            : pathname.startsWith(item.href);

        // Insert New Trade button in the middle
        const insertNew = idx === 2;

        return (
          <div key={item.href} className="flex flex-1">
            {insertNew && (
              <Link
                href="/trades/new"
                className="flex-1 flex flex-col items-center justify-center py-1 gap-0.5"
              >
                <div className="w-11 h-11 bg-blue-600 rounded-full flex items-center justify-center shadow-md -mt-5">
                  <i className="lni lni-plus text-white text-xl" />
                </div>
                <span className="text-[10px] font-medium text-blue-600 mt-0.5">New</span>
              </Link>
            )}
            <Link
              href={item.href}
              className="flex-1 flex flex-col items-center justify-center py-2 gap-0.5"
            >
              <i className={`lni ${item.icon} text-2xl ${isActive ? 'text-blue-600' : 'text-gray-400'}`} />
              <span className={`text-[10px] font-medium ${isActive ? 'text-blue-600' : 'text-gray-400'}`}>
                {item.label}
              </span>
            </Link>
          </div>
        );
      })}
    </nav>
  );
}
