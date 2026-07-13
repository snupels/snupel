import { eq } from "drizzle-orm";

import { db } from "../db";
import { badges } from "../db/schema";
import { BadgeCreate, BadgePatch } from "./dto";

export const badgeRepository = {
  list: () => db.select().from(badges).orderBy(badges.id),
  async create(input: BadgeCreate) {
    const [inserted] = await db
      .insert(badges)
      .values({
        imageUrl: input.image_url ?? null,
        description: input.description ?? null,
      })
      .$returningId();
    return this.get(inserted.id);
  },
  async get(id: number) {
    const [row] = await db.select().from(badges).where(eq(badges.id, id)).limit(1);
    return row ?? null;
  },
  async update(id: number, input: BadgePatch) {
    await db
      .update(badges)
      .set({
        ...(input.image_url !== undefined ? { imageUrl: input.image_url } : {}),
        ...(input.description !== undefined
          ? { description: input.description }
          : {}),
      })
      .where(eq(badges.id, id));
    return this.get(id);
  },
  remove: (id: number) => db.delete(badges).where(eq(badges.id, id)),
};
