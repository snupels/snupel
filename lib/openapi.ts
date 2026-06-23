import {
  OpenAPIRegistry,
  OpenApiGeneratorV31,
} from "@asteasolutions/zod-to-openapi";
import { HealthResponseSchema } from "@/schemas/health";

const registry = new OpenAPIRegistry();

registry.register("HealthResponse", HealthResponseSchema);

registry.registerPath({
  method: "get",
  path: "/api/health",
  summary: "Health check",
  description: "Returns the current service health status.",
  tags: ["System"],
  responses: {
    200: {
      description: "The service is healthy.",
      content: {
        "application/json": {
          schema: HealthResponseSchema,
        },
      },
    },
  },
});

export function generateOpenApiDocument() {
  const generator = new OpenApiGeneratorV31(registry.definitions);

  return generator.generateDocument({
    openapi: "3.1.0",
    info: {
      title: "Snupel API",
      version: "1.0.0",
    },
    tags: [
      {
        name: "System",
        description: "Operational endpoints.",
      },
    ],
  });
}
