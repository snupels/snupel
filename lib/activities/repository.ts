import { eq } from "drizzle-orm";

import { db } from "../db";
import { activities } from "../db/schema";
import { ActivityCreate, ActivityPatch } from "./dto";

const values = (input: ActivityCreate | ActivityPatch) => ({
  ...(input.category !== undefined ? { category: input.category } : {}),
  ...(input.representative_image_url !== undefined
    ? { representativeImageUrl: input.representative_image_url }
    : {}),
  ...(input.sport_name !== undefined ? { sportName: input.sport_name } : {}),
  ...(input.region !== undefined ? { region: input.region } : {}),
  ...(input.place_name !== undefined ? { placeName: input.place_name } : {}),
  ...(input.latitude !== undefined ? { latitude: input.latitude } : {}),
  ...(input.longitude !== undefined ? { longitude: input.longitude } : {}),
});

export const activityRepository = {
  list: () => db.select().from(activities).orderBy(activities.id),
  async create(input: ActivityCreate) {
    const [inserted] = await db
      .insert(activities)
      .values({ ...values(input), category: input.category })
      .$returningId();
    return this.get(inserted.id);
  },
  async get(id: number) {
    const [row] = await db
      .select()
      .from(activities)
      .where(eq(activities.id, id))
      .limit(1);
    return row ?? null;
  },
  async update(id: number, input: ActivityPatch) {
    await db.update(activities).set(values(input)).where(eq(activities.id, id));
    return this.get(id);
  },
  remove: (id: number) => db.delete(activities).where(eq(activities.id, id)),
};
