import { NextRequest } from "next/server";
import { badRequest, json, notFound } from "@/lib/api";
import { getCollectedBadgesByPassportId, exists as existsInDb } from "@/lib/queries";

function parseId(id: string | string[] | undefined) {
  if (!id || Array.isArray(id)) return null;
  const value = Number(id);
  return Number.isInteger(value) && value > 0 ? value : null;
}

export async function GET(
  _request: NextRequest,
  { params }: { params: { passportId: string } }
) {
  const passportId = parseId(params.passportId);
  if (!passportId) {
    return badRequest("Passport id must be a positive integer.");
  }

  const passportExists = await existsInDb("passports", passportId);
  if (!passportExists) {
    return notFound("Passport not found.");
  }

  return json(await getCollectedBadgesByPassportId(passportId));
}
