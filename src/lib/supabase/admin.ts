import { createClient } from '@supabase/supabase-js';

// Service role client — bypasses RLS. Only import in Server Components and API routes.
export const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);
