'use client';

import { useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { createBrowserClient } from '@/lib/supabase/client';

// Sign out after 30 minutes of no user activity
const TIMEOUT_MS = 30 * 60 * 1000;

export function InactivityLogout() {
  const router = useRouter();
  const supabase = createBrowserClient();
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    function resetTimer() {
      if (timerRef.current) clearTimeout(timerRef.current);
      timerRef.current = setTimeout(async () => {
        await supabase.auth.signOut();
        router.push('/login');
        router.refresh();
      }, TIMEOUT_MS);
    }

    const events = ['mousemove', 'mousedown', 'keydown', 'touchstart', 'scroll', 'click'] as const;
    events.forEach((e) => window.addEventListener(e, resetTimer, { passive: true }));
    resetTimer(); // start the timer immediately on mount

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
      events.forEach((e) => window.removeEventListener(e, resetTimer));
    };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  return null;
}
