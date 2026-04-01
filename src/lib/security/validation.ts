import { z } from "zod";

const strongPassword = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z\d]).{12,}$/;

export const loginSchema = z.object({
  email: z.string().email().max(254),
  password: z.string().min(12).max(128)
});

export const passwordResetSchema = z.object({
  email: z.string().email().max(254)
});

export const signupPasswordSchema = z
  .string()
  .regex(strongPassword, "Passwoerter muessen 12+ Zeichen, Gross-/Kleinbuchstaben, Zahl und Sonderzeichen enthalten.");

export const contactSchema = z.object({
  companyId: z.string().uuid(),
  fullName: z.string().trim().min(2).max(120),
  jobTitle: z.string().trim().max(120).nullable().optional(),
  email: z.string().email().max(254).nullable().optional(),
  phone: z.string().trim().max(40).nullable().optional(),
  city: z.string().trim().max(120).nullable().optional(),
  countryCode: z.string().trim().length(2).optional().default("DE"),
  lawfulBasis: z.enum(["contract_preparation", "contract", "legal_obligation", "consent", "legitimate_interest"]),
  purposeCode: z.string().trim().min(3).max(80),
  retentionPolicyId: z.string().uuid()
});

export const consentSchema = z.object({
  contactId: z.string().uuid(),
  purposeCode: z.string().trim().min(3).max(80),
  lawfulBasis: z.enum(["consent"]),
  status: z.enum(["granted", "withdrawn"]),
  source: z.enum(["web_form", "email", "phone", "paper", "import"]),
  policyVersion: z.string().trim().min(1).max(30),
  proofReference: z.string().trim().min(4).max(255)
});

export const dsarExportQuerySchema = z.object({
  contactId: z.string().uuid()
});
