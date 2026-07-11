import { NextRequest } from "next/server";
import { badRequest, created, json } from "@/lib/api";
import { validatePassportPayload } from "@/lib/validators";
import { getPassports, createPassport } from "@/lib/queries";

export async function GET() {
  return json(await getPassports());
}

export async function POST(request: NextRequest) {
  const body = await request.json().catch(() => null);
  const validation = validatePassportPayload(body);
  if ("error" in validation) {
    return badRequest(validation.error);
  }

  const passport = await createPassport(validation.data);
  return created(passport);
}
