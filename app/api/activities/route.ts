import { NextRequest } from "next/server";
import { badRequest, created, json } from "@/lib/api";
import { validateActivityPayload } from "@/lib/validators";
import { getActivities, createActivity } from "@/lib/queries";

export async function GET() {
  return json(await getActivities());
}

export async function POST(request: NextRequest) {
  const body = await request.json().catch(() => null);
  const validation = validateActivityPayload(body);
  if ("error" in validation) {
    return badRequest(validation.error);
  }

  const activity = await createActivity(validation.data);
  return created(activity);
}
