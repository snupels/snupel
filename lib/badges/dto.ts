import { z } from "zod";

export const BadgeCreateSchema = z
  .object({
    image_url: z.url().optional(),
    description: z.string().min(1).optional(),
  })
  .refine((value) => value.image_url || value.description);

export const BadgePatchSchema = z
  .object({
    image_url: z.url().nullable().optional(),
    description: z.string().min(1).nullable().optional(),
  })
  .refine((value) => Object.keys(value).length > 0);

export const BadgeResponseSchema = z.object({
  id: z.number().int().positive(),
  imageUrl: z.url().nullable(),
  description: z.string().nullable(),
  createdAt: z.iso.datetime(),
  updatedAt: z.iso.datetime(),
});

export type BadgeCreate = z.infer<typeof BadgeCreateSchema>;
export type BadgePatch = z.infer<typeof BadgePatchSchema>;
