import { NextRequest } from "next/server";
import { badRequest, json, noContent, notFound } from "@/lib/api";
import { validateBadgePatchPayload } from "@/lib/validators";
import { getBadgeById, updateBadge, deleteBadge } from "@/lib/queries";

function parseId(id: string | string[] | undefined) {
  if (!id || Array.isArray(id)) return null;
  const value = Number(id);
  return Number.isInteger(value) && value > 0 ? value : null;
}

export async function GET(_request: NextRequest, context: { params: Promise<{ id: string }> }) {
  const { id: rawId } = await context.params;
  const id = parseId(rawId);
  if (!id) {
    return badRequest("Badge id must be a positive integer.");
  }

  const badge = await getBadgeById(id);
  if (!badge) {
    return notFound("Badge not found.");
  }

  return json(badge);
}

export async function PATCH(request: NextRequest, context: { params: Promise<{ id: string }> }) {
  const { id: rawId } = await context.params;
  const id = parseId(rawId);
  if (!id) {
    return badRequest("Badge id must be a positive integer.");
  }

  const body = await request.json().catch(() => null);
  const validation = validateBadgePatchPayload(body);
  if ("error" in validation) {
    return badRequest(validation.error);
  }

  const updated = await updateBadge(id, validation.data);
  if (!updated) {
    return notFound("Badge not found.");
  }

  return json(updated);
}

export async function DELETE(_request: NextRequest, context: { params: Promise<{ id: string }> }) {
  const { id: rawId } = await context.params;
  const id = parseId(rawId);
  if (!id) {
    return badRequest("Badge id must be a positive integer.");
  }

  const deleted = await deleteBadge(id);
  if (!deleted) {
    return notFound("Badge not found.");
  }

  return noContent();
}
