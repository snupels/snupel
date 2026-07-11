import assert from "node:assert/strict";
import { test } from "node:test";

import {
  validateCollectedBadgePayload,
  validateCollectedBadgePatchPayload,
} from "../lib/validators";

test("accepts valid collected badge payload", () => {
  const result = validateCollectedBadgePayload({ passport_id: 1, badge_id: 2 });

  assert.deepEqual(result, { data: { passport_id: 1, badge_id: 2 } });
});

test("requires at least one field for collected badge patch", () => {
  const result = validateCollectedBadgePatchPayload({});

  assert.deepEqual(result, { error: "At least one field must be provided to update." });
});
