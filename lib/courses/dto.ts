import { z } from "zod";

const fields = {
  recommended_companion: z.string().max(100).nullable().optional(),
  representative_image_url: z.url().nullable().optional(),
  estimated_duration_minutes: z.number().int().positive().nullable().optional(),
  theme: z.enum(["healing", "thrill", "photo_spot", "stamp"]),
};

export const CourseCreateSchema = z.object({
  ...fields,
  recommended_companion: z.string().max(100).optional(),
  representative_image_url: z.url().optional(),
  estimated_duration_minutes: z.number().int().positive().optional(),
});

export const CoursePatchSchema = z
  .object({ ...fields, theme: fields.theme.optional() })
  .refine((value) => Object.keys(value).length > 0);

export const CourseResponseSchema = z.object({
  id: z.number().int().positive(),
  recommendedCompanion: z.string().nullable(),
  representativeImageUrl: z.url().nullable(),
  estimatedDurationMinutes: z.number().int().positive().nullable(),
  theme: fields.theme,
  createdAt: z.iso.datetime(),
  updatedAt: z.iso.datetime(),
});

export type CourseCreate = z.infer<typeof CourseCreateSchema>;
export type CoursePatch = z.infer<typeof CoursePatchSchema>;
