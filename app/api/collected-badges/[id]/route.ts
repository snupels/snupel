import { NextRequest } from "next/server";
import { badRequest, json, noContent, notFound } from "@/lib/api";
import { validateCollectedBadgePatchPayload } from "@/lib/validators";
import {
  getCollectedBadgeById,
  updateCollectedBadge,
  deleteCollectedBadge,
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
    return badRequest("Collected badge id must be a positive integer.");
  }

  const badge = await getCollectedBadgeById(id);
  if (!badge) {
    return notFound("Collected badge not found.");
  }

  return json(badge);
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const id = parseId(params.id);
  if (!id) {
    return badRequest("Collected badge id must be a positive integer.");
  }

  const body = await request.json().catch(() => null);
  const validation = validateCollectedBadgePatchPayload(body);
  if ("error" in validation) {
    return badRequest(validation.error);
  }

  if (validation.data.passport_id !== undefined) {
    const passportExists = await existsInDb("passports", validation.data.passport_id);
    if (!passportExists) {
      return badRequest("passport_id does not refer to an existing passport.");
    }
  }

  if (validation.data.badge_id !== undefined) {
    const badgeExists = await existsInDb("badges", validation.data.badge_id);
    if (!badgeExists) {
      return badRequest("badge_id does not refer to an existing badge.");
    }
  }

  const updated = await updateCollectedBadge(id, validation.data);
  if (!updated) {
    return notFound("Collected badge not found.");
  }

  return json(updated);
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: { id: string } }
) {
  const id = parseId(params.id);
  if (!id) {
    return badRequest("Collected badge id must be a positive integer.");
  }

  const deleted = await deleteCollectedBadge(id);
  if (!deleted) {
    return notFound("Collected badge not found.");
  }

  return noContent();
}
