import { generateOpenApiDocument } from "@/lib/openapi";

export async function GET() {
  return Response.json(generateOpenApiDocument());
}
