import { z } from "zod";

const fields = {
  category: z.enum(["sports", "event", "festival"]),
  representative_image_url: z.url().nullable().optional(),
  sport_name: z.string().max(100).nullable().optional(),
  region: z.string().max(100).nullable().optional(),
  place_name: z.string().max(255).nullable().optional(),
  latitude: z.number().min(-90).max(90).nullable().optional(),
  longitude: z.number().min(-180).max(180).nullable().optional(),
};

export const ActivityCreateSchema = z.object({
  ...fields,
  representative_image_url: z.url().optional(),
  sport_name: z.string().max(100).optional(),
  region: z.string().max(100).optional(),
  place_name: z.string().max(255).optional(),
  latitude: z.number().min(-90).max(90).optional(),
  longitude: z.number().min(-180).max(180).optional(),
});

export const ActivityPatchSchema = z
  .object({ ...fields, category: fields.category.optional() })
  .refine((value) => Object.keys(value).length > 0);

export const ActivityResponseSchema = z.object({
  id: z.number().int().positive(),
  category: fields.category,
  representativeImageUrl: z.url().nullable(),
  sportName: z.string().nullable(),
  region: z.string().nullable(),
  placeName: z.string().nullable(),
  latitude: z.number().nullable(),
  longitude: z.number().nullable(),
  createdAt: z.iso.datetime(),
  updatedAt: z.iso.datetime(),
});

export type ActivityCreate = z.infer<typeof ActivityCreateSchema>;
export type ActivityPatch = z.infer<typeof ActivityPatchSchema>;
