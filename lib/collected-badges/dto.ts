import { z } from "zod";

export const CollectedBadgeCreateSchema = z.object({
  passport_id: z.number().int().positive(),
  badge_id: z.number().int().positive(),
});

export const CollectedBadgePatchSchema = CollectedBadgeCreateSchema.partial().refine(
  (value) => Object.keys(value).length > 0,
);

export const CollectedBadgeResponseSchema = z.object({
  id: z.number().int().positive(),
  passportId: z.number().int().positive(),
  badgeId: z.number().int().positive(),
  collectedAt: z.iso.datetime(),
});

export type CollectedBadgeCreate = z.infer<typeof CollectedBadgeCreateSchema>;
export type CollectedBadgePatch = z.infer<typeof CollectedBadgePatchSchema>;
