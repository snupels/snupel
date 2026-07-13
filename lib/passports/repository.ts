import { and, eq } from "drizzle-orm";

import { db } from "../db";
import { passports } from "../db/schema";

export const passportRepository = {
  list: (userId: number) =>
    db.select().from(passports).where(eq(passports.userId, userId)),
  async get(id: number, userId: number) {
    const [row] = await db
      .select()
      .from(passports)
      .where(and(eq(passports.id, id), eq(passports.userId, userId)))
      .limit(1);
    return row ?? null;
  },
  async getByUser(userId: number) {
    const [row] = await db
      .select()
      .from(passports)
      .where(eq(passports.userId, userId))
      .limit(1);
    return row ?? null;
  },
  async create(userId: number) {
    const [inserted] = await db
      .insert(passports)
      .values({ userId })
      .$returningId();
    return this.get(inserted.id, userId);
  },
  remove: (id: number, userId: number) =>
    db
      .delete(passports)
      .where(and(eq(passports.id, id), eq(passports.userId, userId))),
};
