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

const CollectedStampCreateSchema = z.object({
  passport_id: z.number().int().positive(),
  stamp_id: z.number().int().positive(),
});

const CollectedStampPatchSchema = z.object({
  passport_id: z.number().int().positive().optional(),
  stamp_id: z.number().int().positive().optional(),
});

const ActivityCreateSchema = z.object({
  category: z.enum(["sports", "event", "festival"]),
  representative_image_url: z.string().url().optional(),
  sport_name: z.string().max(100).optional(),
  region: z.string().max(100).optional(),
  place_name: z.string().max(255).optional(),
  latitude: z.number().min(-90).max(90).optional(),
  longitude: z.number().min(-180).max(180).optional(),
});

const ActivityPatchSchema = z.object({
  category: z.enum(["sports", "event", "festival"]).optional(),
  representative_image_url: z.string().url().nullable().optional(),
  sport_name: z.string().max(100).nullable().optional(),
  region: z.string().max(100).nullable().optional(),
  place_name: z.string().max(255).nullable().optional(),
  latitude: z.number().min(-90).max(90).nullable().optional(),
  longitude: z.number().min(-180).max(180).nullable().optional(),
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

export function validateCollectedStampPayload(body: unknown): ValidationResult<{ passport_id: number; stamp_id: number }> {
  const parsed = CollectedStampCreateSchema.safeParse(body);
  if (!parsed.success) {
    return { error: parsed.error.issues.map((issue) => issue.message).join(", ") };
  }

  return { data: parsed.data };
}

export function validateCollectedStampPatchPayload(body: unknown): ValidationResult<{ passport_id?: number; stamp_id?: number }> {
  const parsed = CollectedStampPatchSchema.safeParse(body);
  if (!parsed.success) {
    return { error: parsed.error.issues.map((issue) => issue.message).join(", ") };
  }

  if (Object.keys(parsed.data).length === 0) {
    return { error: "At least one field must be provided to update." };
  }

  return { data: parsed.data };
}

export function validateActivityPayload(body: unknown): ValidationResult<{ category: "sports" | "event" | "festival"; representative_image_url?: string; sport_name?: string; region?: string; place_name?: string; latitude?: number; longitude?: number }> {
  const parsed = ActivityCreateSchema.safeParse(body);
  if (!parsed.success) {
    return { error: parsed.error.issues.map((issue) => issue.message).join(", ") };
  }

  return { data: parsed.data };
}

export function validateActivityPatchPayload(body: unknown): ValidationResult<{ category?: "sports" | "event" | "festival"; representative_image_url?: string | null; sport_name?: string | null; region?: string | null; place_name?: string | null; latitude?: number | null; longitude?: number | null }> {
  const parsed = ActivityPatchSchema.safeParse(body);
  if (!parsed.success) {
    return { error: parsed.error.issues.map((issue) => issue.message).join(", ") };
  }

  if (Object.keys(parsed.data).length === 0) {
    return { error: "At least one field must be provided to update." };
  }

  return { data: parsed.data };
}
