import { createHash } from "node:crypto";

import { z } from "zod";

const publicSupabaseEnvSchema = z.object({
  NEXT_PUBLIC_SUPABASE_URL: z.string().url(),
  NEXT_PUBLIC_SUPABASE_ANON_KEY: z.string().min(1)
});

const adminSupabaseEnvSchema = publicSupabaseEnvSchema.extend({
  SUPABASE_SERVICE_ROLE_KEY: z.string().min(1),
  SUPABASE_JWT_SECRET: z.string().min(1)
});

const cryptoEnvSchema = z.object({
  PII_ENCRYPTION_KEY: z.string().min(32),
  PII_HASH_SALT: z.string().min(16)
});

const rateLimitEnvSchema = z.object({
  RATE_LIMIT_SALT: z.string().min(16).optional(),
  SUPABASE_JWT_SECRET: z.string().min(16).optional()
});

const appUrlEnvSchema = z.object({
  APP_BASE_URL: z.string().url(),
  TRUSTED_ORIGIN: z.string().url()
});

const observabilityEnvSchema = z.object({
  SENTRY_DSN: z.string().optional()
});

export type PublicSupabaseEnv = z.infer<typeof publicSupabaseEnvSchema>;
export type AdminSupabaseEnv = z.infer<typeof adminSupabaseEnvSchema>;
export type CryptoEnv = z.infer<typeof cryptoEnvSchema>;
export interface RateLimitEnv {
  RATE_LIMIT_SALT: string;
}
export type AppUrlEnv = z.infer<typeof appUrlEnvSchema>;
export type ObservabilityEnv = z.infer<typeof observabilityEnvSchema>;

let cachedPublicSupabaseEnv: PublicSupabaseEnv | null = null;
let cachedAdminSupabaseEnv: AdminSupabaseEnv | null = null;
let cachedCryptoEnv: CryptoEnv | null = null;
let cachedRateLimitEnv: RateLimitEnv | null = null;
let cachedAppUrlEnv: AppUrlEnv | null = null;
let cachedObservabilityEnv: ObservabilityEnv | null = null;

function parseEnv<T>(schema: z.ZodSchema<T>): T {
  const parsed = schema.safeParse(process.env);

  if (!parsed.success) {
    const flattened = parsed.error.flatten().fieldErrors;
    throw new Error(`Invalid environment configuration: ${JSON.stringify(flattened)}`);
  }

  return parsed.data;
}

export function getPublicSupabaseEnv(): PublicSupabaseEnv {
  if (!cachedPublicSupabaseEnv) {
    cachedPublicSupabaseEnv = parseEnv(publicSupabaseEnvSchema);
  }

  return cachedPublicSupabaseEnv;
}

export function getAdminSupabaseEnv(): AdminSupabaseEnv {
  if (!cachedAdminSupabaseEnv) {
    cachedAdminSupabaseEnv = parseEnv(adminSupabaseEnvSchema);
  }

  return cachedAdminSupabaseEnv;
}

export function getCryptoEnv(): CryptoEnv {
  if (!cachedCryptoEnv) {
    cachedCryptoEnv = parseEnv(cryptoEnvSchema);
  }

  return cachedCryptoEnv;
}

export function getRateLimitEnv(): RateLimitEnv {
  if (!cachedRateLimitEnv) {
    const parsed = parseEnv(rateLimitEnvSchema);
    const directSalt = parsed.RATE_LIMIT_SALT?.trim();

    if (directSalt) {
      cachedRateLimitEnv = {
        RATE_LIMIT_SALT: directSalt
      };
      return cachedRateLimitEnv;
    }

    const jwtSecret = parsed.SUPABASE_JWT_SECRET?.trim();

    if (!jwtSecret) {
      throw new Error('Invalid environment configuration: {"RATE_LIMIT_SALT":["Required"]}');
    }

    cachedRateLimitEnv = {
      RATE_LIMIT_SALT: createHash("sha256").update(`rate-limit:${jwtSecret}`).digest("hex")
    };
  }

  return cachedRateLimitEnv;
}

export function getAppUrlEnv(): AppUrlEnv {
  if (!cachedAppUrlEnv) {
    cachedAppUrlEnv = parseEnv(appUrlEnvSchema);
  }

  return cachedAppUrlEnv;
}

export function getObservabilityEnv(): ObservabilityEnv {
  if (!cachedObservabilityEnv) {
    cachedObservabilityEnv = parseEnv(observabilityEnvSchema);
  }

  return cachedObservabilityEnv;
}
