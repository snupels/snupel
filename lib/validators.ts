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
