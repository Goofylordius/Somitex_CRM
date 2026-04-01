import "server-only";

import { createClient } from "@supabase/supabase-js";

import { getAdminSupabaseEnv } from "@/lib/env";

export function createSupabaseAdminClient() {
  const env = getAdminSupabaseEnv();

  return createClient(env.NEXT_PUBLIC_SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY, {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  });
}

