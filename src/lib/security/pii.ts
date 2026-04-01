import "server-only";

import { createCipheriv, createDecipheriv, createHash, createHmac, randomBytes } from "node:crypto";

import { env } from "@/lib/env";

const ENCRYPTION_KEY = createHash("sha256").update(env.PII_ENCRYPTION_KEY).digest();

function normalizeLookupValue(value: string): string {
  return value.trim().toLowerCase();
}

export function encryptPii(value: string): string {
  const iv = randomBytes(12);
  const cipher = createCipheriv("aes-256-gcm", ENCRYPTION_KEY, iv);
  const encrypted = Buffer.concat([cipher.update(value, "utf8"), cipher.final()]);
  const authTag = cipher.getAuthTag();

  return Buffer.concat([iv, authTag, encrypted]).toString("base64url");
}

export function decryptPii(payload: string | null): string | null {
  if (!payload) {
    return null;
  }

  const buffer = Buffer.from(payload, "base64url");
  const iv = buffer.subarray(0, 12);
  const authTag = buffer.subarray(12, 28);
  const encrypted = buffer.subarray(28);
  const decipher = createDecipheriv("aes-256-gcm", ENCRYPTION_KEY, iv);
  decipher.setAuthTag(authTag);

  return Buffer.concat([decipher.update(encrypted), decipher.final()]).toString("utf8");
}

export function piiLookupHash(value: string | null | undefined): string | null {
  if (!value) {
    return null;
  }

  return createHmac("sha256", env.PII_HASH_SALT).update(normalizeLookupValue(value)).digest("hex");
}

export function maskEmail(email: string | null): string | null {
  if (!email) {
    return null;
  }

  const [local, domain] = email.split("@");
  if (!local || !domain) {
    return "***";
  }

  return `${local.slice(0, 2)}***@${domain}`;
}

export function maskPhone(phone: string | null): string | null {
  if (!phone) {
    return null;
  }

  return `${phone.slice(0, 4)}***${phone.slice(-2)}`;
}

