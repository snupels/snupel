import type { HealthResponse } from "@/schemas/health";

export async function GET() {
  const response: HealthResponse = { status: "ok" };

  return Response.json(response);
}
