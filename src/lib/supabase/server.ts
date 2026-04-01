import "server-only";

import { createServerClient, type CookieOptions } from "@supabase/ssr";
import { cookies } from "next/headers";

import { getPublicSupabaseEnv } from "@/lib/env";

type CookieToSet = {
  name: string;
  value: string;
  options: CookieOptions;
};

async function createClientWithCookieMode(mode: "read-mostly" | "mutable") {
  const cookieStore = await cookies();
  const env = getPublicSupabaseEnv();

  return createServerClient(env.NEXT_PUBLIC_SUPABASE_URL, env.NEXT_PUBLIC_SUPABASE_ANON_KEY, {
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll(cookiesToSet: CookieToSet[]) {
        if (mode === "read-mostly") {
          try {
            cookiesToSet.forEach(({ name, value, options }) => cookieStore.set(name, value, options));
          } catch {
            // Server Components cannot always mutate cookies during render.
          }

          return;
        }

        cookiesToSet.forEach(({ name, value, options }) => cookieStore.set(name, value, options));
      }
    }
  });
}

export async function createSupabaseServerClient() {
  return createClientWithCookieMode("read-mostly");
}

export async function createSupabaseMutableServerClient() {
  return createClientWithCookieMode("mutable");
}
