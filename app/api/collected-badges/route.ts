import { NextRequest } from "next/server";
import { badRequest, created, json } from "@/lib/api";
import { validateCollectedBadgePayload } from "@/lib/validators";
import {
  getCollectedBadges,
  createCollectedBadge,
  exists as existsInDb,
} from "@/lib/queries";

export async function GET() {
  return json(await getCollectedBadges());
}

export async function POST(request: NextRequest) {
  const body = await request.json().catch(() => null);
  const validation = validateCollectedBadgePayload(body);
  if ("error" in validation) {
    return badRequest(validation.error);
  }

  const { passport_id, badge_id } = validation.data;
  const passportExists = await existsInDb("passports", passport_id);
  if (!passportExists) {
    return badRequest("passport_id does not refer to an existing passport.");
  }

  const badgeExists = await existsInDb("badges", badge_id);
  if (!badgeExists) {
    return badRequest("badge_id does not refer to an existing badge.");
  }

  const badge = await createCollectedBadge(validation.data);
  return created(badge);
}
