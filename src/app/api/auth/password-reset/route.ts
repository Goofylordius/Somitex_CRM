import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function POST(request: Request) {
  const [{ getAppUrlEnv }, { passwordResetSchema }, { createSupabaseServerClient }] = await Promise.all([
    import("@/lib/env"),
    import("@/lib/security/validation"),
    import("@/lib/supabase/server")
  ]);

  const body = await request.json();
  const parsed = passwordResetSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
  }

  const supabase = await createSupabaseServerClient();
  await supabase.auth.resetPasswordForEmail(parsed.data.email, {
    redirectTo: `${getAppUrlEnv().APP_BASE_URL}/login?reset=1`
  });

  return NextResponse.json({ success: true });
}
