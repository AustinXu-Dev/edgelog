import { redirect } from 'next/navigation';
import { createServerClient } from '@/lib/supabase/server';

export default async function OnboardingLayout({ children }: { children: React.ReactNode }) {
  const supabase = createServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect('/login');

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="w-full max-w-sm">
        <div className="mb-8 text-center">
          <h1 className="text-2xl font-bold text-gray-900">Edgelog</h1>
          <p className="text-sm text-gray-500 mt-1">Your personal trading journal</p>
        </div>
        {children}
      </div>
    </div>
  );
}
