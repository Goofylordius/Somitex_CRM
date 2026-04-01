import "server-only";

import { createHmac } from "node:crypto";

import { getRateLimitEnv } from "@/lib/env";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";

const MAX_ATTEMPTS = 5;
const LOCKOUT_MINUTES = 15;

function hashIdentifier(value: string): string {
  return createHmac("sha256", getRateLimitEnv().RATE_LIMIT_SALT)
    .update(value.trim().toLowerCase())
    .digest("hex");
}

type LoginAttemptState = {
  attempts: number | null;
  locked_until: string | null;
};

async function readLoginAttemptState(
  emailHash: string,
  ipHash: string
): Promise<LoginAttemptState | null> {
  const supabase = createSupabaseAdminClient();

  const rpcResult = await supabase.rpc("get_login_attempt_state", {
    input_email_hash: emailHash,
    input_ip_hash: ipHash
  });

  if (!rpcResult.error) {
    const row = Array.isArray(rpcResult.data) ? (rpcResult.data[0] as LoginAttemptState | undefined) : null;
    return row ?? null;
  }

  const queryResult = await supabase
    .schema("security")
    .from("login_attempts")
    .select("attempts, locked_until")
    .eq("email_hash", emailHash)
    .eq("ip_hash", ipHash)
    .maybeSingle();

  if (queryResult.error) {
    throw new Error("login_attempt_state_unavailable");
  }

  return (queryResult.data as LoginAttemptState | null) ?? null;
}

async function writeLoginAttemptState(
  emailHash: string,
  ipHash: string,
  attempts: number,
  lockedUntil: string | null
): Promise<void> {
  const supabase = createSupabaseAdminClient();
  const timestamp = new Date().toISOString();

  const rpcResult = await supabase.rpc("upsert_login_attempt_state", {
    input_email_hash: emailHash,
    input_ip_hash: ipHash,
    input_attempts: attempts,
    input_locked_until: lockedUntil,
    input_last_attempt_at: timestamp
  });

  if (!rpcResult.error) {
    return;
  }

  const queryResult = await supabase.schema("security").from("login_attempts").upsert(
    {
      email_hash: emailHash,
      ip_hash: ipHash,
      attempts,
      locked_until: lockedUntil,
      last_attempt_at: timestamp
    },
    {
      onConflict: "email_hash,ip_hash"
    }
  );

  if (queryResult.error) {
    throw new Error("login_attempt_write_unavailable");
  }
}

async function removeLoginAttemptState(emailHash: string, ipHash: string): Promise<void> {
  const supabase = createSupabaseAdminClient();

  const rpcResult = await supabase.rpc("clear_login_attempt_state", {
    input_email_hash: emailHash,
    input_ip_hash: ipHash
  });

  if (!rpcResult.error) {
    return;
  }

  const queryResult = await supabase
    .schema("security")
    .from("login_attempts")
    .delete()
    .eq("email_hash", emailHash)
    .eq("ip_hash", ipHash);

  if (queryResult.error) {
    throw new Error("login_attempt_clear_unavailable");
  }
}

export async function assertLoginAllowed(email: string, ipAddress: string): Promise<void> {
  const emailHash = hashIdentifier(email);
  const ipHash = hashIdentifier(ipAddress);

  try {
    const data = await readLoginAttemptState(emailHash, ipHash);

    if (data?.locked_until && new Date(data.locked_until).getTime() > Date.now()) {
      throw new Error("Konto temporaer gesperrt. Bitte spaeter erneut versuchen.");
    }
  } catch (error) {
    if (error instanceof Error && error.message === "Konto temporaer gesperrt. Bitte spaeter erneut versuchen.") {
      throw error;
    }

    console.error("Rate-limit state could not be verified.", error);
  }
}

export async function registerLoginFailure(email: string, ipAddress: string): Promise<void> {
  const emailHash = hashIdentifier(email);
  const ipHash = hashIdentifier(ipAddress);

  try {
    const data = await readLoginAttemptState(emailHash, ipHash);
    const attempts = (data?.attempts ?? 0) + 1;
    const lockedUntil =
      attempts >= MAX_ATTEMPTS ? new Date(Date.now() + LOCKOUT_MINUTES * 60 * 1000).toISOString() : null;

    await writeLoginAttemptState(emailHash, ipHash, attempts, lockedUntil);
  } catch (error) {
    console.error("Login failure could not be registered.", error);
  }
}

export async function clearLoginFailures(email: string, ipAddress: string): Promise<void> {
  try {
    await removeLoginAttemptState(hashIdentifier(email), hashIdentifier(ipAddress));
  } catch (error) {
    console.error("Login failure state could not be cleared.", error);
  }
}

