import { NextRequest } from "next/server";
import { badRequest, json, noContent, notFound } from "@/lib/api";
import { validateActivityPatchPayload } from "@/lib/validators";
import { getActivityById, updateActivity, deleteActivity } from "@/lib/queries";

function parseId(id: string | string[] | undefined) {
  if (!id || Array.isArray(id)) return null;
  const value = Number(id);
  return Number.isInteger(value) && value > 0 ? value : null;
}

export async function GET(_request: NextRequest, context: { params: Promise<{ id: string }> }) {
  const { id: rawId } = await context.params;
  const id = parseId(rawId);
  if (!id) {
    return badRequest("Activity id must be a positive integer.");
  }

  const activity = await getActivityById(id);
  if (!activity) {
    return notFound("Activity not found.");
  }

  return json(activity);
}

export async function PATCH(request: NextRequest, context: { params: Promise<{ id: string }> }) {
  const { id: rawId } = await context.params;
  const id = parseId(rawId);
  if (!id) {
    return badRequest("Activity id must be a positive integer.");
  }

  const body = await request.json().catch(() => null);
  const validation = validateActivityPatchPayload(body);
  if ("error" in validation) {
    return badRequest(validation.error);
  }

  const updated = await updateActivity(id, validation.data);
  if (!updated) {
    return notFound("Activity not found.");
  }

  return json(updated);
}

export async function DELETE(_request: NextRequest, context: { params: Promise<{ id: string }> }) {
  const { id: rawId } = await context.params;
  const id = parseId(rawId);
  if (!id) {
    return badRequest("Activity id must be a positive integer.");
  }

  const deleted = await deleteActivity(id);
  if (!deleted) {
    return notFound("Activity not found.");
  }

  return noContent();
}
