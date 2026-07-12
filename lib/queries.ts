import { db } from "@/lib/db";
import { eq } from "drizzle-orm";
import {
  activities,
  badges,
  users,
  passports,
  stamps,
  collectedBadges,
  collectedStamps,
} from "@/lib/db/schema";

export type ActivityInput = {
  category: "sports" | "event" | "festival";
  representative_image_url?: string;
  sport_name?: string;
  region?: string;
  place_name?: string;
  latitude?: number;
  longitude?: number;
};

export type ActivityPatchInput = Partial<
  Omit<ActivityInput, "representative_image_url" | "sport_name" | "region" | "place_name" | "latitude" | "longitude">
> & {
  representative_image_url?: string | null;
  sport_name?: string | null;
  region?: string | null;
  place_name?: string | null;
  latitude?: number | null;
  longitude?: number | null;
};

export async function getBadges() {
  return await db.select().from(badges).orderBy(badges.id);
}

export async function getPassports() {
  return await db.select().from(passports).orderBy(passports.id);
}

export async function createPassport(input: { user_id: number }) {
  const [inserted] = await db
    .insert(passports)
    .values({
      userId: input.user_id,
    })
    .$returningId();

  const [row] = await db
    .select()
    .from(passports)
    .where(eq(passports.id, inserted.id))
    .limit(1);
  return row;
}

export async function getPassportById(id: number) {
  const [row] = await db
    .select()
    .from(passports)
    .where(eq(passports.id, id))
    .limit(1);
  return row ?? null;
}

export async function updatePassport(id: number, data: { user_id?: number }) {
  const [existing] = await db
    .select()
    .from(passports)
    .where(eq(passports.id, id))
    .limit(1);
  if (!existing) return null;

  await db
    .update(passports)
    .set({
      ...(data.user_id !== undefined ? { userId: data.user_id } : {}),
    })
    .where(eq(passports.id, id));

  const [row] = await db
    .select()
    .from(passports)
    .where(eq(passports.id, id))
    .limit(1);
  return row;
}

export async function deletePassport(id: number) {
  const [existing] = await db
    .select()
    .from(passports)
    .where(eq(passports.id, id))
    .limit(1);
  if (!existing) return false;

  await db.delete(passports).where(eq(passports.id, id));
  return true;
}

export async function getCollectedBadges() {
  return await db.select().from(collectedBadges).orderBy(collectedBadges.id);
}

export async function createCollectedBadge(input: { passport_id: number; badge_id: number }) {
  const [inserted] = await db
    .insert(collectedBadges)
    .values({
      passportId: input.passport_id,
      badgeId: input.badge_id,
    })
    .$returningId();

  const [row] = await db
    .select()
    .from(collectedBadges)
    .where(eq(collectedBadges.id, inserted.id))
    .limit(1);
  return row;
}

export async function getCollectedBadgeById(id: number) {
  const [row] = await db
    .select()
    .from(collectedBadges)
    .where(eq(collectedBadges.id, id))
    .limit(1);
  return row ?? null;
}

export async function updateCollectedBadge(id: number, data: { passport_id?: number; badge_id?: number }) {
  const [existing] = await db
    .select()
    .from(collectedBadges)
    .where(eq(collectedBadges.id, id))
    .limit(1);
  if (!existing) return null;

  await db
    .update(collectedBadges)
    .set({
      ...(data.passport_id !== undefined ? { passportId: data.passport_id } : {}),
      ...(data.badge_id !== undefined ? { badgeId: data.badge_id } : {}),
    })
    .where(eq(collectedBadges.id, id));

  const [row] = await db
    .select()
    .from(collectedBadges)
    .where(eq(collectedBadges.id, id))
    .limit(1);
  return row;
}

export async function deleteCollectedBadge(id: number) {
  const [existing] = await db
    .select()
    .from(collectedBadges)
    .where(eq(collectedBadges.id, id))
    .limit(1);
  if (!existing) return false;

  await db.delete(collectedBadges).where(eq(collectedBadges.id, id));
  return true;
}

export async function getCollectedStamps() {
  return await db.select().from(collectedStamps).orderBy(collectedStamps.id);
}

export async function createCollectedStamp(input: { passport_id: number; stamp_id: number }) {
  const [inserted] = await db
    .insert(collectedStamps)
    .values({
      passportId: input.passport_id,
      stampId: input.stamp_id,
    })
    .$returningId();

  const [row] = await db
    .select()
    .from(collectedStamps)
    .where(eq(collectedStamps.id, inserted.id))
    .limit(1);
  return row;
}

export async function getCollectedStampById(id: number) {
  const [row] = await db
    .select()
    .from(collectedStamps)
    .where(eq(collectedStamps.id, id))
    .limit(1);
  return row ?? null;
}

export async function updateCollectedStamp(id: number, data: { passport_id?: number; stamp_id?: number }) {
  const [existing] = await db
    .select()
    .from(collectedStamps)
    .where(eq(collectedStamps.id, id))
    .limit(1);
  if (!existing) return null;

  await db
    .update(collectedStamps)
    .set({
      ...(data.passport_id !== undefined ? { passportId: data.passport_id } : {}),
      ...(data.stamp_id !== undefined ? { stampId: data.stamp_id } : {}),
    })
    .where(eq(collectedStamps.id, id));

  const [row] = await db
    .select()
    .from(collectedStamps)
    .where(eq(collectedStamps.id, id))
    .limit(1);
  return row;
}

export async function deleteCollectedStamp(id: number) {
  const [existing] = await db
    .select()
    .from(collectedStamps)
    .where(eq(collectedStamps.id, id))
    .limit(1);
  if (!existing) return false;

  await db.delete(collectedStamps).where(eq(collectedStamps.id, id));
  return true;
}

export async function getActivities() {
  return await db.select().from(activities).orderBy(activities.id);
}

export async function createActivity(input: ActivityInput) {
  const [inserted] = await db
    .insert(activities)
    .values({
      category: input.category,
      representativeImageUrl: input.representative_image_url ?? null,
      sportName: input.sport_name ?? null,
      region: input.region ?? null,
      placeName: input.place_name ?? null,
      latitude: input.latitude ?? null,
      longitude: input.longitude ?? null,
    })
    .$returningId();

  const [row] = await db
    .select()
    .from(activities)
    .where(eq(activities.id, inserted.id))
    .limit(1);
  return row;
}

export async function getActivityById(id: number) {
  const [row] = await db
    .select()
    .from(activities)
    .where(eq(activities.id, id))
    .limit(1);
  return row ?? null;
}

export async function updateActivity(id: number, data: ActivityPatchInput) {
  const [existing] = await db
    .select()
    .from(activities)
    .where(eq(activities.id, id))
    .limit(1);
  if (!existing) return null;

  await db
    .update(activities)
    .set({
      ...(data.category !== undefined ? { category: data.category } : {}),
      ...(data.representative_image_url !== undefined ? { representativeImageUrl: data.representative_image_url } : {}),
      ...(data.sport_name !== undefined ? { sportName: data.sport_name } : {}),
      ...(data.region !== undefined ? { region: data.region } : {}),
      ...(data.place_name !== undefined ? { placeName: data.place_name } : {}),
      ...(data.latitude !== undefined ? { latitude: data.latitude } : {}),
      ...(data.longitude !== undefined ? { longitude: data.longitude } : {}),
    })
    .where(eq(activities.id, id));

  const [row] = await db
    .select()
    .from(activities)
    .where(eq(activities.id, id))
    .limit(1);
  return row;
}

export async function deleteActivity(id: number) {
  const [existing] = await db
    .select()
    .from(activities)
    .where(eq(activities.id, id))
    .limit(1);
  if (!existing) return false;

  await db.delete(activities).where(eq(activities.id, id));
  return true;
}

export async function createBadge(input: { image_url?: string; description?: string }) {
  const [inserted] = await db
    .insert(badges)
    .values({
      imageUrl: input.image_url ?? null,
      description: input.description ?? null,
    })
    .$returningId();

  const [row] = await db
    .select()
    .from(badges)
    .where(eq(badges.id, inserted.id))
    .limit(1);
  return row;
}

export async function getBadgeById(id: number) {
  const [row] = await db
    .select()
    .from(badges)
    .where(eq(badges.id, id))
    .limit(1);
  return row ?? null;
}

export async function updateBadge(id: number, data: { image_url?: string | null; description?: string | null }) {
  const [existing] = await db
    .select()
    .from(badges)
    .where(eq(badges.id, id))
    .limit(1);
  if (!existing) return null;

  await db
    .update(badges)
    .set({
      ...(data.image_url !== undefined ? { imageUrl: data.image_url } : {}),
      ...(data.description !== undefined ? { description: data.description } : {}),
    })
    .where(eq(badges.id, id));

  const [row] = await db
    .select()
    .from(badges)
    .where(eq(badges.id, id))
    .limit(1);
  return row;
}

export async function deleteBadge(id: number) {
  const [existing] = await db
    .select()
    .from(badges)
    .where(eq(badges.id, id))
    .limit(1);
  if (!existing) return false;

  await db.delete(badges).where(eq(badges.id, id));
  return true;
}

export async function exists(table: string, id: number) {
  if (!id || typeof id !== "number") return false;

  switch (table) {
    case "users": {
      const [row] = await db
        .select()
        .from(users)
        .where(eq(users.id, id))
        .limit(1);
      return !!row;
    }
    case "passports": {
      const [row] = await db
        .select()
        .from(passports)
        .where(eq(passports.id, id))
        .limit(1);
      return !!row;
    }
    case "badges": {
      const [row] = await db
        .select()
        .from(badges)
        .where(eq(badges.id, id))
        .limit(1);
      return !!row;
    }
    case "stamps": {
      const [row] = await db
        .select()
        .from(stamps)
        .where(eq(stamps.id, id))
        .limit(1);
      return !!row;
    }
    case "collected_badges": {
      const [row] = await db
        .select()
        .from(collectedBadges)
        .where(eq(collectedBadges.id, id))
        .limit(1);
      return !!row;
    }
    case "collected_stamps": {
      const [row] = await db
        .select()
        .from(collectedStamps)
        .where(eq(collectedStamps.id, id))
        .limit(1);
      return !!row;
    }
    default:
      return false;
  }
}
