import { NextResponse } from "next/server";

import { env } from "@/lib/env";
import { passwordResetSchema } from "@/lib/security/validation";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export async function POST(request: Request) {
  const body = await request.json();
  const parsed = passwordResetSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
  }

  const supabase = await createSupabaseServerClient();
  await supabase.auth.resetPasswordForEmail(parsed.data.email, {
    redirectTo: `${env.APP_BASE_URL}/login?reset=1`
  });

  return NextResponse.json({ success: true });
}
