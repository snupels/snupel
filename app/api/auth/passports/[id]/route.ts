import { NextRequest } from "next/server";
import { badRequest, json, created, noContent, notFound } from "@/lib/api";
import { validatePassportPatchPayload } from "@/lib/validators";
import { getPassportById, updatePassport, deletePassport, exists as existsInDb } from "@/lib/queries";

function parseId(id: string | string[] | undefined) {
  if (!id || Array.isArray(id)) return null;
  const value = Number(id);
  return Number.isInteger(value) && value > 0 ? value : null;
}

export async function GET(
  _request: NextRequest,
  { params }: { params: { id: string } }
) {
  const passportId = parseId(params.id);
  if (!passportId) {
    return badRequest("Passport id must be a positive integer.");
  }

  const passport = await getPassportById(passportId);
  if (!passport) {
    return notFound("Passport not found.");
  }

  return json(passport);
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const passportId = parseId(params.id);
  if (!passportId) {
    return badRequest("Passport id must be a positive integer.");
  }

  const body = await request.json().catch(() => null);
  const validation = validatePassportPatchPayload(body);
  if ("error" in validation) {
    return badRequest(validation.error);
  }

  if (validation.data.user_id !== undefined) {
    const userExists = await existsInDb("users", validation.data.user_id);
    if (!userExists) {
      return badRequest("user_id does not refer to an existing user.");
    }
  }

  const updated = await updatePassport(passportId, validation.data);
  if (!updated) {
    return notFound("Passport not found.");
  }

  return json(updated);
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: { id: string } }
) {
  const passportId = parseId(params.id);
  if (!passportId) {
    return badRequest("Passport id must be a positive integer.");
  }

  const deleted = await deletePassport(passportId);
  if (!deleted) {
    return notFound("Passport not found.");
  }

  return noContent();
}
