import assert from "node:assert/strict";
import { test } from "node:test";

import {
  validateActivityPatchPayload,
  validateActivityPayload,
  validateCollectedBadgePayload,
  validateCollectedBadgePatchPayload,
  validateCoursePatchPayload,
  validateCoursePayload,
} from "../lib/validators";

test("accepts a valid activity payload", () => {
  const result = validateActivityPayload({
    category: "sports",
    sport_name: "축구",
    latitude: 37.5665,
    longitude: 126.978,
  });

  assert.deepEqual(result, {
    data: {
      category: "sports",
      sport_name: "축구",
      latitude: 37.5665,
      longitude: 126.978,
    },
  });
});

test("rejects invalid activity category and coordinates", () => {
  assert.ok("error" in validateActivityPayload({ category: "concert" }));
  assert.ok(
    "error" in
      validateActivityPayload({
        category: "event",
        latitude: 91,
        longitude: -181,
      }),
  );
});

test("requires at least one field for activity patch", () => {
  assert.deepEqual(validateActivityPatchPayload({}), {
    error: "At least one field must be provided to update.",
  });
});

test("accepts a valid course payload", () => {
  const result = validateCoursePayload({
    recommended_companion: "친구",
    estimated_duration_minutes: 90,
    theme: "photo_spot",
  });

  assert.deepEqual(result, {
    data: {
      recommended_companion: "친구",
      estimated_duration_minutes: 90,
      theme: "photo_spot",
    },
  });
});

test("rejects invalid course theme and duration", () => {
  assert.ok("error" in validateCoursePayload({ theme: "food" }));
  assert.ok(
    "error" in
      validateCoursePayload({
        theme: "healing",
        estimated_duration_minutes: 0,
      }),
  );
});

test("requires at least one field for course patch", () => {
  assert.deepEqual(validateCoursePatchPayload({}), {
    error: "At least one field must be provided to update.",
  });
});

test("accepts valid collected badge payload", () => {
  const result = validateCollectedBadgePayload({ passport_id: 1, badge_id: 2 });

  assert.deepEqual(result, { data: { passport_id: 1, badge_id: 2 } });
});

test("requires at least one field for collected badge patch", () => {
  const result = validateCollectedBadgePatchPayload({});

  assert.deepEqual(result, { error: "At least one field must be provided to update." });
});
