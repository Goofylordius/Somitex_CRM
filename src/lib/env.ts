import { createHash } from "node:crypto";

import { z } from "zod";

const publicSupabaseEnvSchema = z.object({
  NEXT_PUBLIC_SUPABASE_URL: z.string().url(),
  NEXT_PUBLIC_SUPABASE_ANON_KEY: z.string().min(1)
});

const adminSupabaseEnvSchema = publicSupabaseEnvSchema.extend({
  SUPABASE_SERVICE_ROLE_KEY: z.string().min(1)
});

const cryptoEnvSchema = z.object({
  PII_ENCRYPTION_KEY: z.string().min(32),
  PII_HASH_SALT: z.string().min(16)
});

const rateLimitEnvSchema = z.object({
  RATE_LIMIT_SALT: z.string().min(16).optional(),
  SUPABASE_JWT_SECRET: z.string().min(1).optional()
});

const appUrlEnvSchema = z.object({
  APP_BASE_URL: z.string().url(),
  TRUSTED_ORIGIN: z.string().url()
});

const observabilityEnvSchema = z.object({
  SENTRY_DSN: z.string().optional()
});

type PublicSupabaseEnv = z.infer<typeof publicSupabaseEnvSchema>;
type AdminSupabaseEnv = z.infer<typeof adminSupabaseEnvSchema>;
type CryptoEnv = z.infer<typeof cryptoEnvSchema>;
type AppUrlEnv = z.infer<typeof appUrlEnvSchema>;
type ObservabilityEnv = z.infer<typeof observabilityEnvSchema>;

let publicSupabaseEnvCache: PublicSupabaseEnv | null = null;
let adminSupabaseEnvCache: AdminSupabaseEnv | null = null;
let cryptoEnvCache: CryptoEnv | null = null;
let rateLimitEnvCache: { RATE_LIMIT_SALT: string } | null = null;
let appUrlEnvCache: AppUrlEnv | null = null;
let observabilityEnvCache: ObservabilityEnv | null = null;

function formatEnvError(flattened: Record<string, string[] | undefined>) {
  return `Invalid environment configuration: ${JSON.stringify(flattened)}`;
}

function parseEnv<T>(schema: z.ZodType<T>): T {
  const parsed = schema.safeParse(process.env);

  if (!parsed.success) {
    throw new Error(formatEnvError(parsed.error.flatten().fieldErrors));
  }

  return parsed.data;
}

export function getPublicSupabaseEnv(): PublicSupabaseEnv {
  if (!publicSupabaseEnvCache) {
    publicSupabaseEnvCache = parseEnv(publicSupabaseEnvSchema);
  }

  return publicSupabaseEnvCache;
}

export function getAdminSupabaseEnv(): AdminSupabaseEnv {
  if (!adminSupabaseEnvCache) {
    adminSupabaseEnvCache = parseEnv(adminSupabaseEnvSchema);
  }

  return adminSupabaseEnvCache;
}

export function getCryptoEnv(): CryptoEnv {
  if (!cryptoEnvCache) {
    cryptoEnvCache = parseEnv(cryptoEnvSchema);
  }

  return cryptoEnvCache;
}

export function getRateLimitEnv(): { RATE_LIMIT_SALT: string } {
  if (rateLimitEnvCache) {
    return rateLimitEnvCache;
  }

  const parsed = parseEnv(rateLimitEnvSchema);

  if (parsed.RATE_LIMIT_SALT) {
    rateLimitEnvCache = {
      RATE_LIMIT_SALT: parsed.RATE_LIMIT_SALT
    };
    return rateLimitEnvCache;
  }

  if (parsed.SUPABASE_JWT_SECRET) {
    rateLimitEnvCache = {
      RATE_LIMIT_SALT: createHash("sha256")
        .update(`rate-limit:${parsed.SUPABASE_JWT_SECRET}`)
        .digest("hex")
    };
    return rateLimitEnvCache;
  }

  throw new Error(formatEnvError({ RATE_LIMIT_SALT: ["Required"] }));
}

export function getAppUrlEnv(): AppUrlEnv {
  if (!appUrlEnvCache) {
    appUrlEnvCache = parseEnv(appUrlEnvSchema);
  }

  return appUrlEnvCache;
}

export function getObservabilityEnv(): ObservabilityEnv {
  if (!observabilityEnvCache) {
    observabilityEnvCache = parseEnv(observabilityEnvSchema);
  }

  return observabilityEnvCache;
}
