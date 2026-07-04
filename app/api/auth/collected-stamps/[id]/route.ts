import { NextRequest } from "next/server";
import { badRequest, json, noContent, notFound } from "@/lib/api";
import { validateCollectedStampPatchPayload } from "@/lib/validators";
import {
  getCollectedStampById,
  updateCollectedStamp,
  deleteCollectedStamp,
  exists as existsInDb,
} from "@/lib/queries";

function parseId(id: string | string[] | undefined) {
  if (!id || Array.isArray(id)) return null;
  const value = Number(id);
  return Number.isInteger(value) && value > 0 ? value : null;
}

export async function GET(
  _request: NextRequest,
  { params }: { params: { id: string } }
) {
  const id = parseId(params.id);
  if (!id) {
    return badRequest("Collected stamp id must be a positive integer.");
  }

  const stamp = await getCollectedStampById(id);
  if (!stamp) {
    return notFound("Collected stamp not found.");
  }

  return json(stamp);
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const id = parseId(params.id);
  if (!id) {
    return badRequest("Collected stamp id must be a positive integer.");
  }

  const body = await request.json().catch(() => null);
  const validation = validateCollectedStampPatchPayload(body);
  if ("error" in validation) {
    return badRequest(validation.error);
  }

  if (validation.data.passport_id !== undefined) {
    const passportExists = await existsInDb("passports", validation.data.passport_id);
    if (!passportExists) {
      return badRequest("passport_id does not refer to an existing passport.");
    }
  }

  if (validation.data.stamp_id !== undefined) {
    const stampExists = await existsInDb("stamps", validation.data.stamp_id);
    if (!stampExists) {
      return badRequest("stamp_id does not refer to an existing stamp.");
    }
  }

  const updated = await updateCollectedStamp(id, validation.data);
  if (!updated) {
    return notFound("Collected stamp not found.");
  }

  return json(updated);
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: { id: string } }
) {
  const id = parseId(params.id);
  if (!id) {
    return badRequest("Collected stamp id must be a positive integer.");
  }

  const deleted = await deleteCollectedStamp(id);
  if (!deleted) {
    return notFound("Collected stamp not found.");
  }

  return noContent();
}
