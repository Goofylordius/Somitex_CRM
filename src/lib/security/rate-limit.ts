import "server-only";

import { createHmac } from "node:crypto";

import { env } from "@/lib/env";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";

const MAX_ATTEMPTS = 5;
const LOCKOUT_MINUTES = 15;

function hashIdentifier(value: string): string {
  return createHmac("sha256", env.RATE_LIMIT_SALT).update(value.trim().toLowerCase()).digest("hex");
}

export async function assertLoginAllowed(email: string, ipAddress: string): Promise<void> {
  const supabase = createSupabaseAdminClient();
  const emailHash = hashIdentifier(email);
  const ipHash = hashIdentifier(ipAddress);

  const { data, error } = await supabase
    .schema("security")
    .from("login_attempts")
    .select("attempts, locked_until")
    .eq("email_hash", emailHash)
    .eq("ip_hash", ipHash)
    .maybeSingle();

  if (error) {
    throw new Error("Rate-limit state could not be verified.");
  }

  if (data?.locked_until && new Date(data.locked_until).getTime() > Date.now()) {
    throw new Error("Konto temporaer gesperrt. Bitte spaeter erneut versuchen.");
  }
}

export async function registerLoginFailure(email: string, ipAddress: string): Promise<void> {
  const supabase = createSupabaseAdminClient();
  const emailHash = hashIdentifier(email);
  const ipHash = hashIdentifier(ipAddress);
  const { data } = await supabase
    .schema("security")
    .from("login_attempts")
    .select("attempts")
    .eq("email_hash", emailHash)
    .eq("ip_hash", ipHash)
    .maybeSingle();

  const attempts = (data?.attempts ?? 0) + 1;
  const lockedUntil =
    attempts >= MAX_ATTEMPTS ? new Date(Date.now() + LOCKOUT_MINUTES * 60 * 1000).toISOString() : null;

  await supabase.schema("security").from("login_attempts").upsert(
    {
      email_hash: emailHash,
      ip_hash: ipHash,
      attempts,
      locked_until: lockedUntil,
      last_attempt_at: new Date().toISOString()
    },
    {
      onConflict: "email_hash,ip_hash"
    }
  );
}

export async function clearLoginFailures(email: string, ipAddress: string): Promise<void> {
  const supabase = createSupabaseAdminClient();

  await supabase
    .schema("security")
    .from("login_attempts")
    .delete()
    .eq("email_hash", hashIdentifier(email))
    .eq("ip_hash", hashIdentifier(ipAddress));
}

