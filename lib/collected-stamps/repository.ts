import { and, eq, ne } from "drizzle-orm";

import { db } from "../db";
import { collectedStamps, passports, stamps } from "../db/schema";
import { CollectedStampCreate, CollectedStampPatch } from "./dto";

const columns = {
  id: collectedStamps.id,
  passportId: collectedStamps.passportId,
  stampId: collectedStamps.stampId,
  collectedAt: collectedStamps.collectedAt,
};

export const collectedStampRepository = {
  list: (userId: number) =>
    db
      .select(columns)
      .from(collectedStamps)
      .innerJoin(passports, eq(collectedStamps.passportId, passports.id))
      .where(eq(passports.userId, userId))
      .orderBy(collectedStamps.id),
  async get(id: number, userId: number) {
    const [row] = await db
      .select(columns)
      .from(collectedStamps)
      .innerJoin(passports, eq(collectedStamps.passportId, passports.id))
      .where(and(eq(collectedStamps.id, id), eq(passports.userId, userId)))
      .limit(1);
    return row ?? null;
  },
  async passportOwned(passportId: number, userId: number) {
    const [row] = await db
      .select({ id: passports.id })
      .from(passports)
      .where(and(eq(passports.id, passportId), eq(passports.userId, userId)))
      .limit(1);
    return Boolean(row);
  },
  async stampExists(stampId: number) {
    const [row] = await db
      .select({ id: stamps.id })
      .from(stamps)
      .where(eq(stamps.id, stampId))
      .limit(1);
    return Boolean(row);
  },
  async duplicate(passportId: number, stampId: number, exceptId = 0) {
    const [row] = await db
      .select({ id: collectedStamps.id })
      .from(collectedStamps)
      .where(
        and(
          eq(collectedStamps.passportId, passportId),
          eq(collectedStamps.stampId, stampId),
          ne(collectedStamps.id, exceptId),
        ),
      )
      .limit(1);
    return Boolean(row);
  },
  async create(input: CollectedStampCreate, userId: number) {
    const [inserted] = await db
      .insert(collectedStamps)
      .values({ passportId: input.passport_id, stampId: input.stamp_id })
      .$returningId();
    return this.get(inserted.id, userId);
  },
  async update(id: number, input: CollectedStampPatch, userId: number) {
    await db
      .update(collectedStamps)
      .set({
        ...(input.passport_id !== undefined
          ? { passportId: input.passport_id }
          : {}),
        ...(input.stamp_id !== undefined ? { stampId: input.stamp_id } : {}),
      })
      .where(eq(collectedStamps.id, id));
    return this.get(id, userId);
  },
  remove: (id: number) =>
    db.delete(collectedStamps).where(eq(collectedStamps.id, id)),
};
