import { NextRequest } from "next/server";
import { badRequest, created, json } from "@/lib/api";
import { validateCollectedBadgePayload } from "@/lib/validators";
import { getCollectedBadges, createCollectedBadge } from "@/lib/queries";

export async function GET() {
  return json(await getCollectedBadges());
}

export async function POST(request: NextRequest) {
  const body = await request.json().catch(() => null);
  const validation = validateCollectedBadgePayload(body);
  if ("error" in validation) {
    return badRequest(validation.error);
  }

  const collectedBadge = await createCollectedBadge(validation.data);
  return created(collectedBadge);
}
