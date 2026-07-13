import { z } from "zod";

export const CollectedStampCreateSchema = z.object({
  passport_id: z.number().int().positive(),
  stamp_id: z.number().int().positive(),
});

export const CollectedStampPatchSchema = CollectedStampCreateSchema.partial().refine(
  (value) => Object.keys(value).length > 0,
);

export const CollectedStampResponseSchema = z.object({
  id: z.number().int().positive(),
  passportId: z.number().int().positive(),
  stampId: z.number().int().positive(),
  collectedAt: z.iso.datetime(),
});

export type CollectedStampCreate = z.infer<typeof CollectedStampCreateSchema>;
export type CollectedStampPatch = z.infer<typeof CollectedStampPatchSchema>;
