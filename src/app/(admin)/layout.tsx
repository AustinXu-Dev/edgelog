import Link from 'next/link';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b border-gray-200 px-6 py-3 flex items-center gap-6">
        <span className="font-semibold text-gray-900">Edgelog Admin</span>
        <nav className="flex items-center gap-4 text-sm">
          <Link href="/admin" className="text-gray-600 hover:text-gray-900">
            Users
          </Link>
        </nav>
        <div className="ml-auto">
          <Link href="/dashboard" className="text-sm text-gray-500 hover:text-gray-900">
            Back to App
          </Link>
        </div>
      </header>
      <main className="p-6">{children}</main>
    </div>
  );
}
