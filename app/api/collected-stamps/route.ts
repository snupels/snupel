import { NextRequest } from "next/server";
import { badRequest, created, json } from "@/lib/api";
import { validateCollectedStampPayload } from "@/lib/validators";
import {
  getCollectedStamps,
  createCollectedStamp,
  exists as existsInDb,
} from "@/lib/queries";

export async function GET() {
  return json(await getCollectedStamps());
}

export async function POST(request: NextRequest) {
  const body = await request.json().catch(() => null);
  const validation = validateCollectedStampPayload(body);
  if ("error" in validation) {
    return badRequest(validation.error);
  }

  const { passport_id, stamp_id } = validation.data;
  const passportExists = await existsInDb("passports", passport_id);
  if (!passportExists) {
    return badRequest("passport_id does not refer to an existing passport.");
  }

  const stampExists = await existsInDb("stamps", stamp_id);
  if (!stampExists) {
    return badRequest("stamp_id does not refer to an existing stamp.");
  }

  const stamp = await createCollectedStamp(validation.data);
  return created(stamp);
}
