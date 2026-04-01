import { createServerClient, type CookieOptions } from "@supabase/ssr";
import type { User } from "@supabase/supabase-js";
import { NextResponse, type NextRequest } from "next/server";

import { getPublicSupabaseEnv } from "@/lib/env";

type CookieToSet = {
  name: string;
  value: string;
  options: CookieOptions;
};

interface UpdateSessionResult {
  response: NextResponse;
  user: User | null;
  assuranceLevel: "aal1" | "aal2" | null;
}

export async function updateSession(request: NextRequest): Promise<UpdateSessionResult> {
  let response = NextResponse.next({
    request
  });
  const env = getPublicSupabaseEnv();

  const supabase = createServerClient(env.NEXT_PUBLIC_SUPABASE_URL, env.NEXT_PUBLIC_SUPABASE_ANON_KEY, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet: CookieToSet[]) {
        cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
        response = NextResponse.next({
          request
        });
        cookiesToSet.forEach(({ name, value, options }) => response.cookies.set(name, value, options));
      }
    }
  });

  const [{ data: userData }, assurance] = await Promise.all([
    supabase.auth.getUser(),
    supabase.auth.mfa.getAuthenticatorAssuranceLevel()
  ]);

  const user = userData.user;
  const assuranceLevel = assurance.data?.currentLevel === "aal2" ? "aal2" : user ? "aal1" : null;

  return {
    response,
    user,
    assuranceLevel
  };
}
