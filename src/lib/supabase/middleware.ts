import { createServerClient, type CookieOptions } from "@supabase/ssr";
import type { User } from "@supabase/supabase-js";
import { NextResponse, type NextRequest } from "next/server";

import { getPublicSupabaseEnv } from "@/lib/env";

type CookieToSet = {
  name: string;
  value: string;
  options: CookieOptions;
};

export interface MiddlewareSessionState {
  response: NextResponse;
  user: User | null;
  assuranceLevel: string | null;
}

export async function updateSession(request: NextRequest): Promise<MiddlewareSessionState> {
  const env = getPublicSupabaseEnv();
  let response = NextResponse.next({
    request
  });

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

  const {
    data: { user }
  } = await supabase.auth.getUser();

  let assuranceLevel: string | null = null;

  if (user) {
    try {
      const aal = await supabase.auth.mfa.getAuthenticatorAssuranceLevel();
      assuranceLevel = aal.data?.currentLevel ?? null;
    } catch {
      assuranceLevel = null;
    }
  }

  return {
    response,
    user,
    assuranceLevel
  };
}
