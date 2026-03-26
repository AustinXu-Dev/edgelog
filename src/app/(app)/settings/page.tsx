import { createServerClient } from '@/lib/supabase/server';
import { Topbar } from '@/components/layout/Topbar';
import { SettingsForm } from './SettingsForm';

export default async function SettingsPage() {
  const supabase = createServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;

  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single();

  return (
    <div className="flex flex-col h-full">
      <Topbar title="Settings" />
      <div className="flex-1 overflow-y-auto p-6">
        <div className="bg-gray-900 border border-gray-800 rounded-xl p-6 max-w-lg space-y-6">
          <div>
            <p className="text-xs text-gray-500 mb-1">Account</p>
            <p className="text-sm text-gray-300">{user.email}</p>
          </div>
          <SettingsForm
            userId={user.id}
            initialDisplayName={profile?.display_name ?? ''}
            initialTimezone={profile?.timezone ?? 'UTC'}
          />
        </div>
      </div>
    </div>
  );
}
