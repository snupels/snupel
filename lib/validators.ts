import { z } from "zod";

const BadgeCreateSchema = z.object({
  image_url: z.string().url().optional(),
  description: z.string().optional(),
});

const BadgePatchSchema = z.object({
  image_url: z.string().url().nullable().optional(),
  description: z.string().nullable().optional(),
});

type ValidationResult<T> = { data: T } | { error: string };

const PassportCreateSchema = z.object({
  user_id: z.number().int().positive(),
});

const PassportPatchSchema = z.object({
  user_id: z.number().int().positive().optional(),
});

const CollectedBadgeCreateSchema = z.object({
  passport_id: z.number().int().positive(),
  badge_id: z.number().int().positive(),
});

const CollectedBadgePatchSchema = z.object({
  passport_id: z.number().int().positive().optional(),
  badge_id: z.number().int().positive().optional(),
});

export function validateBadgePayload(body: unknown): ValidationResult<{ image_url?: string; description?: string }> {
  const parsed = BadgeCreateSchema.safeParse(body);
  if (!parsed.success) {
    return { error: parsed.error.issues.map((issue) => issue.message).join(", ") };
  }

  if (!parsed.data.image_url && !parsed.data.description) {
    return { error: "Either image_url or description must be provided." };
  }

  return { data: parsed.data };
}

export function validateBadgePatchPayload(body: unknown): ValidationResult<{ image_url?: string | null; description?: string | null }> {
  const parsed = BadgePatchSchema.safeParse(body);
  if (!parsed.success) {
    return { error: parsed.error.issues.map((issue) => issue.message).join(", ") };
  }

  if (Object.keys(parsed.data).length === 0) {
    return { error: "At least one field must be provided to update." };
  }

  return { data: parsed.data };
}

export function validatePassportPayload(body: unknown): ValidationResult<{ user_id: number }> {
  const parsed = PassportCreateSchema.safeParse(body);
  if (!parsed.success) {
    return { error: parsed.error.issues.map((issue) => issue.message).join(", ") };
  }

  return { data: parsed.data };
}

export function validatePassportPatchPayload(body: unknown): ValidationResult<{ user_id?: number }> {
  const parsed = PassportPatchSchema.safeParse(body);
  if (!parsed.success) {
    return { error: parsed.error.issues.map((issue) => issue.message).join(", ") };
  }

  if (Object.keys(parsed.data).length === 0) {
    return { error: "At least one field must be provided to update." };
  }

  return { data: parsed.data };
}

export function validateCollectedBadgePayload(body: unknown): ValidationResult<{ passport_id: number; badge_id: number }> {
  const parsed = CollectedBadgeCreateSchema.safeParse(body);
  if (!parsed.success) {
    return { error: parsed.error.issues.map((issue) => issue.message).join(", ") };
  }

  return { data: parsed.data };
}

export function validateCollectedBadgePatchPayload(body: unknown): ValidationResult<{ passport_id?: number; badge_id?: number }> {
  const parsed = CollectedBadgePatchSchema.safeParse(body);
  if (!parsed.success) {
    return { error: parsed.error.issues.map((issue) => issue.message).join(", ") };
  }

  if (Object.keys(parsed.data).length === 0) {
    return { error: "At least one field must be provided to update." };
  }

  return { data: parsed.data };
}
