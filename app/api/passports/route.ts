import { NextRequest } from "next/server";
import { created, badRequest, json } from "@/lib/api";
import { validatePassportPayload } from "@/lib/validators";
import { createPassport, getPassports, exists as existsInDb } from "@/lib/queries";

export async function GET() {
  return json(await getPassports());
}

export async function POST(request: NextRequest) {
  const body = await request.json().catch(() => null);
  const validation = validatePassportPayload(body);
  if ("error" in validation) {
    return badRequest(validation.error);
  }

  const userExists = await existsInDb("users", validation.data.user_id);
  if (!userExists) {
    return badRequest("user_id does not refer to an existing user.");
  }

  const passport = await createPassport(validation.data.user_id);
  return created(passport);
}
