import { NextRequest } from "next/server";
import { badRequest, json, noContent, notFound } from "@/lib/api";
import { validateCollectedStampPatchPayload } from "@/lib/validators";
import { getCollectedStampById, updateCollectedStamp, deleteCollectedStamp } from "@/lib/queries";

function parseId(id: string | string[] | undefined) {
  if (!id || Array.isArray(id)) return null;
  const value = Number(id);
  return Number.isInteger(value) && value > 0 ? value : null;
}

export async function GET(_request: NextRequest, context: { params: Promise<{ id: string }> }) {
  const { id: rawId } = await context.params;
  const id = parseId(rawId);
  if (!id) {
    return badRequest("Collected stamp id must be a positive integer.");
  }

  const collectedStamp = await getCollectedStampById(id);
  if (!collectedStamp) {
    return notFound("Collected stamp not found.");
  }

  return json(collectedStamp);
}

export async function PATCH(request: NextRequest, context: { params: Promise<{ id: string }> }) {
  const { id: rawId } = await context.params;
  const id = parseId(rawId);
  if (!id) {
    return badRequest("Collected stamp id must be a positive integer.");
  }

  const body = await request.json().catch(() => null);
  const validation = validateCollectedStampPatchPayload(body);
  if ("error" in validation) {
    return badRequest(validation.error);
  }

  const updated = await updateCollectedStamp(id, validation.data);
  if (!updated) {
    return notFound("Collected stamp not found.");
  }

  return json(updated);
}

export async function DELETE(_request: NextRequest, context: { params: Promise<{ id: string }> }) {
  const { id: rawId } = await context.params;
  const id = parseId(rawId);
  if (!id) {
    return badRequest("Collected stamp id must be a positive integer.");
  }

  const deleted = await deleteCollectedStamp(id);
  if (!deleted) {
    return notFound("Collected stamp not found.");
  }

  return noContent();
}
