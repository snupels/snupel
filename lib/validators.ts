type ValidationResult<T> = { data: T } | { error: string };

type PassportPayload = { user_id: number };
type CollectedBadgePayload = { passport_id: number; badge_id: number; collected_at: string };
type CollectedStampPayload = { passport_id: number; stamp_id: number; collected_at: string };

type ParseResult<T> = { value: T } | { error: string };

function parsePositiveInt(value: unknown, field: string): ParseResult<number> {
  if (typeof value === "number" && Number.isInteger(value) && value > 0) {
    return { value }; 
  }

  if (typeof value === "string" && /^[0-9]+$/.test(value)) {
    return { value: Number(value) };
  }

  return { error: `${field} must be a positive integer` };
}

function parseTimestamp(value: unknown, field: string): ParseResult<string> {
  if (typeof value !== "string") {
    return { error: `${field} must be an ISO 8601 timestamp string` };
  }

  const parsed = Date.parse(value);
  if (Number.isNaN(parsed)) {
    return { error: `${field} must be a valid ISO 8601 timestamp string` };
  }

  return { value: new Date(parsed).toISOString() };
}

export function validatePassportPayload(body: unknown): ValidationResult<PassportPayload> {
  if (body == null || typeof body !== "object") {
    return { error: "Request body must be a JSON object." };
  }

  const parsed = parsePositiveInt((body as any).user_id, "user_id");
  if ("error" in parsed) {
    return { error: parsed.error };
  }

  return { data: { user_id: parsed.value } };
}

export function validatePassportPatchPayload(body: unknown): ValidationResult<Partial<PassportPayload>> {
  if (body == null || typeof body !== "object") {
    return { error: "Request body must be a JSON object." };
  }

  const updates: Partial<PassportPayload> = {};

  if ((body as any).user_id !== undefined) {
    const parsed = parsePositiveInt((body as any).user_id, "user_id");
    if ("error" in parsed) {
      return { error: parsed.error };
    }
    updates.user_id = parsed.value;
  }

  if (Object.keys(updates).length === 0) {
    return { error: "At least one field must be provided for update." };
  }

  return { data: updates };
}

export function validateCollectedBadgePayload(body: unknown): ValidationResult<CollectedBadgePayload> {
  if (body == null || typeof body !== "object") {
    return { error: "Request body must be a JSON object." };
  }

  const passportId = parsePositiveInt((body as any).passport_id, "passport_id");
  const badgeId = parsePositiveInt((body as any).badge_id, "badge_id");
  const collectedAt = parseTimestamp((body as any).collected_at, "collected_at");

  if ("error" in passportId) {
    return { error: passportId.error };
  }
  if ("error" in badgeId) {
    return { error: badgeId.error };
  }
  if ("error" in collectedAt) {
    return { error: collectedAt.error };
  }

  return {
    data: {
      passport_id: passportId.value,
      badge_id: badgeId.value,
      collected_at: collectedAt.value,
    },
  };
}

export function validateCollectedBadgePatchPayload(body: unknown): ValidationResult<Partial<CollectedBadgePayload>> {
  if (body == null || typeof body !== "object") {
    return { error: "Request body must be a JSON object." };
  }

  const updates: Partial<CollectedBadgePayload> = {};

  if ((body as any).passport_id !== undefined) {
    const parsed = parsePositiveInt((body as any).passport_id, "passport_id");
    if ("error" in parsed) {
      return { error: parsed.error };
    }
    updates.passport_id = parsed.value;
  }

  if ((body as any).badge_id !== undefined) {
    const parsed = parsePositiveInt((body as any).badge_id, "badge_id");
    if ("error" in parsed) {
      return { error: parsed.error };
    }
    updates.badge_id = parsed.value;
  }

  if ((body as any).collected_at !== undefined) {
    const parsed = parseTimestamp((body as any).collected_at, "collected_at");
    if ("error" in parsed) {
      return { error: parsed.error };
    }
    updates.collected_at = parsed.value;
  }

  if (Object.keys(updates).length === 0) {
    return { error: "At least one field must be provided for update." };
  }

  return { data: updates };
}

export function validateCollectedStampPayload(body: unknown): ValidationResult<CollectedStampPayload> {
  if (body == null || typeof body !== "object") {
    return { error: "Request body must be a JSON object." };
  }

  const passportId = parsePositiveInt((body as any).passport_id, "passport_id");
  const stampId = parsePositiveInt((body as any).stamp_id, "stamp_id");
  const collectedAt = parseTimestamp((body as any).collected_at, "collected_at");

  if ("error" in passportId) {
    return { error: passportId.error };
  }
  if ("error" in stampId) {
    return { error: stampId.error };
  }
  if ("error" in collectedAt) {
    return { error: collectedAt.error };
  }

  return {
    data: {
      passport_id: passportId.value,
      stamp_id: stampId.value,
      collected_at: collectedAt.value,
    },
  };
}

export function validateCollectedStampPatchPayload(body: unknown): ValidationResult<Partial<CollectedStampPayload>> {
  if (body == null || typeof body !== "object") {
    return { error: "Request body must be a JSON object." };
  }

  const updates: Partial<CollectedStampPayload> = {};

  if ((body as any).passport_id !== undefined) {
    const parsed = parsePositiveInt((body as any).passport_id, "passport_id");
    if ("error" in parsed) {
      return { error: parsed.error };
    }
    updates.passport_id = parsed.value;
  }

  if ((body as any).stamp_id !== undefined) {
    const parsed = parsePositiveInt((body as any).stamp_id, "stamp_id");
    if ("error" in parsed) {
      return { error: parsed.error };
    }
    updates.stamp_id = parsed.value;
  }

  if ((body as any).collected_at !== undefined) {
    const parsed = parseTimestamp((body as any).collected_at, "collected_at");
    if ("error" in parsed) {
      return { error: parsed.error };
    }
    updates.collected_at = parsed.value;
  }

  if (Object.keys(updates).length === 0) {
    return { error: "At least one field must be provided for update." };
  }

  return { data: updates };
}
