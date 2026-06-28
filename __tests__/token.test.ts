import assert from "node:assert/strict";
import { afterEach, test } from "node:test";

import {
  getAccessTokenExpiresIn,
  signAccessToken,
  verifyAccessToken,
} from "../lib/auth/token";

const originalEnv = {
  AUTH_ACCESS_TOKEN_EXPIRES_IN: process.env.AUTH_ACCESS_TOKEN_EXPIRES_IN,
  JWT_SECRET: process.env.JWT_SECRET,
};
const originalNow = Date.now;

afterEach(() => {
  process.env.AUTH_ACCESS_TOKEN_EXPIRES_IN =
    originalEnv.AUTH_ACCESS_TOKEN_EXPIRES_IN;
  process.env.JWT_SECRET = originalEnv.JWT_SECRET;
  Date.now = originalNow;
});

test("signs and verifies an access token", () => {
  process.env.JWT_SECRET = "test-secret";
  delete process.env.AUTH_ACCESS_TOKEN_EXPIRES_IN;
  Date.now = () => 1_700_000_000_000;

  const token = signAccessToken({ id: 7, email: "user@example.com" });

  assert.equal(token.expiresIn, 60 * 60 * 24 * 7);
  assert.deepEqual(verifyAccessToken(token.accessToken), {
    id: 7,
    email: "user@example.com",
  });
});

test("uses configured positive expiry and rejects expired tokens", () => {
  process.env.JWT_SECRET = "test-secret";
  process.env.AUTH_ACCESS_TOKEN_EXPIRES_IN = "2";
  Date.now = () => 1_700_000_000_000;

  const token = signAccessToken({ id: 7, email: "user@example.com" });

  assert.equal(getAccessTokenExpiresIn(), 2);
  Date.now = () => 1_700_000_003_000;
  assert.equal(verifyAccessToken(token.accessToken), null);
});

test("rejects malformed and tampered tokens", () => {
  process.env.JWT_SECRET = "test-secret";
  Date.now = () => 1_700_000_000_000;

  const token = signAccessToken({ id: 7, email: "user@example.com" });
  const tampered = `${token.accessToken.slice(0, -1)}x`;

  assert.equal(verifyAccessToken("not-a-token"), null);
  assert.equal(verifyAccessToken(tampered), null);
});
