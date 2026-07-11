import { NextRequest } from "next/server";
import { badRequest, json, noContent, notFound } from "@/lib/api";
import { validateCollectedBadgePatchPayload } from "@/lib/validators";
import { getCollectedBadgeById, updateCollectedBadge, deleteCollectedBadge } from "@/lib/queries";

function parseId(id: string | string[] | undefined) {
  if (!id || Array.isArray(id)) return null;
  const value = Number(id);
  return Number.isInteger(value) && value > 0 ? value : null;
}

export async function GET(_request: NextRequest, context: { params: Promise<{ id: string }> }) {
  const { id: rawId } = await context.params;
  const id = parseId(rawId);
  if (!id) {
    return badRequest("Collected badge id must be a positive integer.");
  }

  const collectedBadge = await getCollectedBadgeById(id);
  if (!collectedBadge) {
    return notFound("Collected badge not found.");
  }

  return json(collectedBadge);
}

export async function PATCH(request: NextRequest, context: { params: Promise<{ id: string }> }) {
  const { id: rawId } = await context.params;
  const id = parseId(rawId);
  if (!id) {
    return badRequest("Collected badge id must be a positive integer.");
  }

  const body = await request.json().catch(() => null);
  const validation = validateCollectedBadgePatchPayload(body);
  if ("error" in validation) {
    return badRequest(validation.error);
  }

  const updated = await updateCollectedBadge(id, validation.data);
  if (!updated) {
    return notFound("Collected badge not found.");
  }

  return json(updated);
}

export async function DELETE(_request: NextRequest, context: { params: Promise<{ id: string }> }) {
  const { id: rawId } = await context.params;
  const id = parseId(rawId);
  if (!id) {
    return badRequest("Collected badge id must be a positive integer.");
  }

  const deleted = await deleteCollectedBadge(id);
  if (!deleted) {
    return notFound("Collected badge not found.");
  }

  return noContent();
}
