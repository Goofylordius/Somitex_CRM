import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function POST() {
  const { createSupabaseMutableServerClient } = await import("@/lib/supabase/server");
  const supabase = await createSupabaseMutableServerClient();

  await supabase.auth.signOut();

  return NextResponse.json({ success: true });
}

