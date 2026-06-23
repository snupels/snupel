import { extendZodWithOpenApi } from "@asteasolutions/zod-to-openapi";
import { z } from "zod";

extendZodWithOpenApi(z);

export const HealthResponseSchema = z
  .object({
    status: z.literal("ok").meta({
      description: "Current service health status.",
      example: "ok",
    }),
  })
  .meta({
    id: "HealthResponse",
    description: "Response returned by the health check endpoint.",
  });

export type HealthResponse = z.infer<typeof HealthResponseSchema>;
