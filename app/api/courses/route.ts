import { NextRequest } from "next/server";
import { badRequest, created, json } from "@/lib/api";
import { validateCoursePayload } from "@/lib/validators";
import { createCourse, getCourses } from "@/lib/queries";

export async function GET() {
  return json(await getCourses());
}

export async function POST(request: NextRequest) {
  const body = await request.json().catch(() => null);
  const validation = validateCoursePayload(body);
  if ("error" in validation) {
    return badRequest(validation.error);
  }

  return created(await createCourse(validation.data));
}
