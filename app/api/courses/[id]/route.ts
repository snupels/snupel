import { NextRequest } from "next/server";
import { badRequest, json, noContent, notFound } from "@/lib/api";
import { validateCoursePatchPayload } from "@/lib/validators";
import {
  deleteCourse,
  getCourseById,
  updateCourse,
} from "@/lib/queries";

function parseId(id: string | string[] | undefined) {
  if (!id || Array.isArray(id)) return null;
  const value = Number(id);
  return Number.isInteger(value) && value > 0 ? value : null;
}

export async function GET(
  _request: NextRequest,
  context: { params: Promise<{ id: string }> },
) {
  const { id: rawId } = await context.params;
  const id = parseId(rawId);
  if (!id) return badRequest("Course id must be a positive integer.");

  const course = await getCourseById(id);
  if (!course) return notFound("Course not found.");

  return json(course);
}

export async function PATCH(
  request: NextRequest,
  context: { params: Promise<{ id: string }> },
) {
  const { id: rawId } = await context.params;
  const id = parseId(rawId);
  if (!id) return badRequest("Course id must be a positive integer.");

  const body = await request.json().catch(() => null);
  const validation = validateCoursePatchPayload(body);
  if ("error" in validation) return badRequest(validation.error);

  const course = await updateCourse(id, validation.data);
  if (!course) return notFound("Course not found.");

  return json(course);
}

export async function DELETE(
  _request: NextRequest,
  context: { params: Promise<{ id: string }> },
) {
  const { id: rawId } = await context.params;
  const id = parseId(rawId);
  if (!id) return badRequest("Course id must be a positive integer.");

  if (!(await deleteCourse(id))) return notFound("Course not found.");

  return noContent();
}
