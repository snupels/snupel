import { eq } from "drizzle-orm";

import { db } from "../db";
import { courses } from "../db/schema";
import { CourseCreate, CoursePatch } from "./dto";

const values = (input: CourseCreate | CoursePatch) => ({
  ...(input.recommended_companion !== undefined
    ? { recommendedCompanion: input.recommended_companion }
    : {}),
  ...(input.representative_image_url !== undefined
    ? { representativeImageUrl: input.representative_image_url }
    : {}),
  ...(input.estimated_duration_minutes !== undefined
    ? { estimatedDurationMinutes: input.estimated_duration_minutes }
    : {}),
  ...(input.theme !== undefined ? { theme: input.theme } : {}),
});

export const courseRepository = {
  list: () => db.select().from(courses).orderBy(courses.id),
  async create(input: CourseCreate) {
    const [inserted] = await db
      .insert(courses)
      .values({ ...values(input), theme: input.theme })
      .$returningId();
    return this.get(inserted.id);
  },
  async get(id: number) {
    const [row] = await db.select().from(courses).where(eq(courses.id, id)).limit(1);
    return row ?? null;
  },
  async update(id: number, input: CoursePatch) {
    await db.update(courses).set(values(input)).where(eq(courses.id, id));
    return this.get(id);
  },
  remove: (id: number) => db.delete(courses).where(eq(courses.id, id)),
};
