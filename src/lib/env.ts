import { z } from "zod";

const envSchema = z.object({
  NEXT_PUBLIC_SUPABASE_URL: z.string().url(),
  NEXT_PUBLIC_SUPABASE_ANON_KEY: z.string().min(1),
  SUPABASE_SERVICE_ROLE_KEY: z.string().min(1),
  SUPABASE_JWT_SECRET: z.string().min(1),
  PII_ENCRYPTION_KEY: z.string().min(32),
  PII_HASH_SALT: z.string().min(16),
  RATE_LIMIT_SALT: z.string().min(16),
  APP_BASE_URL: z.string().url(),
  TRUSTED_ORIGIN: z.string().url(),
  SENTRY_DSN: z.string().optional()
});

const parsed = envSchema.safeParse(process.env);

if (!parsed.success) {
  const flattened = parsed.error.flatten().fieldErrors;
  throw new Error(`Invalid environment configuration: ${JSON.stringify(flattened)}`);
}

export const env = parsed.data;
