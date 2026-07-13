import { and, eq, ne } from "drizzle-orm";

import { db } from "../db";
import { badges, collectedBadges, passports } from "../db/schema";
import { CollectedBadgeCreate, CollectedBadgePatch } from "./dto";

const columns = {
  id: collectedBadges.id,
  passportId: collectedBadges.passportId,
  badgeId: collectedBadges.badgeId,
  collectedAt: collectedBadges.collectedAt,
};

export const collectedBadgeRepository = {
  list: (userId: number) =>
    db
      .select(columns)
      .from(collectedBadges)
      .innerJoin(passports, eq(collectedBadges.passportId, passports.id))
      .where(eq(passports.userId, userId))
      .orderBy(collectedBadges.id),
  async get(id: number, userId: number) {
    const [row] = await db
      .select(columns)
      .from(collectedBadges)
      .innerJoin(passports, eq(collectedBadges.passportId, passports.id))
      .where(and(eq(collectedBadges.id, id), eq(passports.userId, userId)))
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
  async badgeExists(badgeId: number) {
    const [row] = await db
      .select({ id: badges.id })
      .from(badges)
      .where(eq(badges.id, badgeId))
      .limit(1);
    return Boolean(row);
  },
  async duplicate(passportId: number, badgeId: number, exceptId = 0) {
    const [row] = await db
      .select({ id: collectedBadges.id })
      .from(collectedBadges)
      .where(
        and(
          eq(collectedBadges.passportId, passportId),
          eq(collectedBadges.badgeId, badgeId),
          ne(collectedBadges.id, exceptId),
        ),
      )
      .limit(1);
    return Boolean(row);
  },
  async create(input: CollectedBadgeCreate, userId: number) {
    const [inserted] = await db
      .insert(collectedBadges)
      .values({ passportId: input.passport_id, badgeId: input.badge_id })
      .$returningId();
    return this.get(inserted.id, userId);
  },
  async update(id: number, input: CollectedBadgePatch, userId: number) {
    await db
      .update(collectedBadges)
      .set({
        ...(input.passport_id !== undefined
          ? { passportId: input.passport_id }
          : {}),
        ...(input.badge_id !== undefined ? { badgeId: input.badge_id } : {}),
      })
      .where(eq(collectedBadges.id, id));
    return this.get(id, userId);
  },
  remove: (id: number) =>
    db.delete(collectedBadges).where(eq(collectedBadges.id, id)),
};
