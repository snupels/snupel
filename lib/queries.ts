import { query, execute } from "@/lib/db";

export type PassportRow = {
  id: number;
  user_id: number;
  created_at: string;
  updated_at: string;
};

export type CollectedBadgeRow = {
  id: number;
  passport_id: number;
  badge_id: number;
  collected_at: string;
};

export type CollectedStampRow = {
  id: number;
  passport_id: number;
  stamp_id: number;
  collected_at: string;
};

export async function getPassports(): Promise<PassportRow[]> {
  return query<PassportRow>("SELECT id, user_id, created_at, updated_at FROM passports ORDER BY id");
}

export async function getPassportById(id: number): Promise<PassportRow | null> {
  const rows = await query<PassportRow>("SELECT id, user_id, created_at, updated_at FROM passports WHERE id = ?", [id]);
  return rows[0] ?? null;
}

export async function createPassport(userId: number): Promise<PassportRow> {
  const result = await execute(
    "INSERT INTO passports (user_id, created_at, updated_at) VALUES (?, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)",
    [userId]
  );
  const insertId = (result as any).insertId as number;
  const row = await getPassportById(insertId);
  if (!row) throw new Error("Failed to fetch passport after insert.");
  return row;
}

export async function updatePassport(id: number, updates: Partial<{ user_id: number }>): Promise<PassportRow | null> {
  const fields: string[] = [];
  const params: unknown[] = [];

  if (updates.user_id !== undefined) {
    fields.push("user_id = ?");
    params.push(updates.user_id);
  }

  if (fields.length === 0) {
    return await getPassportById(id);
  }

  params.push(id);
  await execute(
    `UPDATE passports SET ${fields.join(", ")}, updated_at = CURRENT_TIMESTAMP WHERE id = ?`,
    params
  );

  return getPassportById(id);
}

export async function deletePassport(id: number): Promise<boolean> {
  const result = await execute("DELETE FROM passports WHERE id = ?", [id]);
  return (result as any).affectedRows > 0;
}

export async function getCollectedBadges(): Promise<CollectedBadgeRow[]> {
  return query<CollectedBadgeRow>("SELECT id, passport_id, badge_id, collected_at FROM collected_badges ORDER BY id");
}

export async function getCollectedBadgeById(id: number): Promise<CollectedBadgeRow | null> {
  const rows = await query<CollectedBadgeRow>("SELECT id, passport_id, badge_id, collected_at FROM collected_badges WHERE id = ?", [id]);
  return rows[0] ?? null;
}

export async function getCollectedBadgesByPassportId(passportId: number): Promise<CollectedBadgeRow[]> {
  return query<CollectedBadgeRow>("SELECT id, passport_id, badge_id, collected_at FROM collected_badges WHERE passport_id = ? ORDER BY id", [passportId]);
}

export async function createCollectedBadge(data: Omit<CollectedBadgeRow, "id">): Promise<CollectedBadgeRow> {
  const result = await execute(
    "INSERT INTO collected_badges (passport_id, badge_id, collected_at) VALUES (?, ?, ?)",
    [data.passport_id, data.badge_id, data.collected_at]
  );
  const insertId = (result as any).insertId as number;
  const row = await getCollectedBadgeById(insertId);
  if (!row) throw new Error("Failed to fetch collected badge after insert.");
  return row;
}

export async function updateCollectedBadge(
  id: number,
  updates: Partial<Omit<CollectedBadgeRow, "id">>
): Promise<CollectedBadgeRow | null> {
  const fields: string[] = [];
  const params: unknown[] = [];

  if (updates.passport_id !== undefined) {
    fields.push("passport_id = ?");
    params.push(updates.passport_id);
  }
  if (updates.badge_id !== undefined) {
    fields.push("badge_id = ?");
    params.push(updates.badge_id);
  }
  if (updates.collected_at !== undefined) {
    fields.push("collected_at = ?");
    params.push(updates.collected_at);
  }

  if (fields.length === 0) {
    return await getCollectedBadgeById(id);
  }

  params.push(id);
  await execute(`UPDATE collected_badges SET ${fields.join(", ")} WHERE id = ?`, params);
  return getCollectedBadgeById(id);
}

export async function deleteCollectedBadge(id: number): Promise<boolean> {
  const result = await execute("DELETE FROM collected_badges WHERE id = ?", [id]);
  return (result as any).affectedRows > 0;
}

export async function getCollectedStamps(): Promise<CollectedStampRow[]> {
  return query<CollectedStampRow>("SELECT id, passport_id, stamp_id, collected_at FROM collected_stamps ORDER BY id");
}

export async function getCollectedStampById(id: number): Promise<CollectedStampRow | null> {
  const rows = await query<CollectedStampRow>("SELECT id, passport_id, stamp_id, collected_at FROM collected_stamps WHERE id = ?", [id]);
  return rows[0] ?? null;
}

export async function getCollectedStampsByPassportId(passportId: number): Promise<CollectedStampRow[]> {
  return query<CollectedStampRow>("SELECT id, passport_id, stamp_id, collected_at FROM collected_stamps WHERE passport_id = ? ORDER BY id", [passportId]);
}

export async function createCollectedStamp(data: Omit<CollectedStampRow, "id">): Promise<CollectedStampRow> {
  const result = await execute(
    "INSERT INTO collected_stamps (passport_id, stamp_id, collected_at) VALUES (?, ?, ?)",
    [data.passport_id, data.stamp_id, data.collected_at]
  );
  const insertId = (result as any).insertId as number;
  const row = await getCollectedStampById(insertId);
  if (!row) throw new Error("Failed to fetch collected stamp after insert.");
  return row;
}

export async function updateCollectedStamp(
  id: number,
  updates: Partial<Omit<CollectedStampRow, "id">>
): Promise<CollectedStampRow | null> {
  const fields: string[] = [];
  const params: unknown[] = [];

  if (updates.passport_id !== undefined) {
    fields.push("passport_id = ?");
    params.push(updates.passport_id);
  }
  if (updates.stamp_id !== undefined) {
    fields.push("stamp_id = ?");
    params.push(updates.stamp_id);
  }
  if (updates.collected_at !== undefined) {
    fields.push("collected_at = ?");
    params.push(updates.collected_at);
  }

  if (fields.length === 0) {
    return await getCollectedStampById(id);
  }

  params.push(id);
  await execute(`UPDATE collected_stamps SET ${fields.join(", ")} WHERE id = ?`, params);
  return getCollectedStampById(id);
}

export async function deleteCollectedStamp(id: number): Promise<boolean> {
  const result = await execute("DELETE FROM collected_stamps WHERE id = ?", [id]);
  return (result as any).affectedRows > 0;
}

export async function exists(table: string, id: number): Promise<boolean> {
  const rows = await query<{ count: number }>(`SELECT 1 AS count FROM ${table} WHERE id = ? LIMIT 1`, [id]);
  return rows.length > 0;
}
