import { z } from "zod";

export const PassportCreateSchema = z.object({
  user_id: z.number().int().positive(),
});

export const PassportPatchSchema = PassportCreateSchema;

export const PassportResponseSchema = z.object({
  id: z.number().int().positive(),
  userId: z.number().int().positive(),
  createdAt: z.iso.datetime(),
  updatedAt: z.iso.datetime(),
});

export type PassportCreate = z.infer<typeof PassportCreateSchema>;
export type PassportPatch = z.infer<typeof PassportPatchSchema>;
