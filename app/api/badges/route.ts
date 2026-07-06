import { NextRequest } from "next/server";
import { badRequest, created, json } from "@/lib/api";
import { validateBadgePayload } from "@/lib/validators";
import { getBadges, createBadge } from "@/lib/queries";

export async function GET() {
  return json(await getBadges());
}

export async function POST(request: NextRequest) {
  const body = await request.json().catch(() => null);
  const validation = validateBadgePayload(body);
  if ("error" in validation) {
    return badRequest(validation.error);
  }

  const badge = await createBadge(validation.data);
  return created(badge);
}
