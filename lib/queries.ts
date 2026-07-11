import { db } from "@/lib/db";
import { and, eq } from "drizzle-orm";
import {
  badges,
  users,
  passports,
  stamps,
  collectedBadges,
  collectedStamps,
} from "@/lib/db/schema";

export async function getBadges() {
  return await db.select().from(badges).orderBy(badges.id);
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
