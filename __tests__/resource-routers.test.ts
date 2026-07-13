import assert from "node:assert/strict";
import { after, before, test } from "node:test";

import { activityService } from "../lib/activities/service";
import { createActivityRouter } from "../lib/activities/router";
import { ApiError } from "../lib/api";
import { createBadgeRouter } from "../lib/badges/router";
import { badgeService } from "../lib/badges/service";
import { createCollectedBadgeRouter } from "../lib/collected-badges/router";
import { collectedBadgeService } from "../lib/collected-badges/service";
import { createCollectedStampRouter } from "../lib/collected-stamps/router";
import { collectedStampService } from "../lib/collected-stamps/service";
import { createCourseRouter } from "../lib/courses/router";
import { courseService } from "../lib/courses/service";
import { pool } from "../lib/db";
import { createPassportRouter } from "../lib/passports/router";
import { passportService } from "../lib/passports/service";
import { signAccessToken } from "../lib/auth/token";

type TestRouter = {
  collection: { POST(request: Request): Promise<Response> };
};

type RouterCase = {
  name: string;
  admin: boolean;
  body: unknown;
  build(create: () => Promise<unknown>): TestRouter;
};

const cases: RouterCase[] = [
  {
    name: "badge",
    admin: true,
    body: { description: "badge" },
    build: (create) => createBadgeRouter({ ...badgeService, create }),
  },
  {
    name: "activity",
    admin: true,
    body: { category: "sports" },
    build: (create) => createActivityRouter({ ...activityService, create }),
  },
  {
    name: "course",
    admin: true,
    body: { theme: "healing" },
    build: (create) => createCourseRouter({ ...courseService, create }),
  },
  {
    name: "passport",
    admin: false,
    body: { user_id: 7 },
    build: (create) => createPassportRouter({ ...passportService, create }),
  },
  {
    name: "collected badge",
    admin: false,
    body: { passport_id: 1, badge_id: 2 },
    build: (create) =>
      createCollectedBadgeRouter({ ...collectedBadgeService, create }),
  },
  {
    name: "collected stamp",
    admin: false,
    body: { passport_id: 1, stamp_id: 2 },
    build: (create) =>
      createCollectedStampRouter({ ...collectedStampService, create }),
  },
];

const token = (email: string) =>
  signAccessToken({ id: 7, email }).accessToken;

const request = (body: unknown, accessToken?: string) =>
  new Request("http://localhost/api/resource", {
    method: "POST",
    headers: {
      "content-type": "application/json",
      ...(accessToken ? { authorization: `Bearer ${accessToken}` } : {}),
    },
    body: JSON.stringify(body),
  });

before(() => {
  process.env.JWT_SECRET = "router-test-secret";
  process.env.ADMIN_EMAILS = "admin@example.com";
});

after(async () => pool.end());

for (const item of cases) {
  test(`${item.name} router handles success, validation, auth, and service errors`, async () => {
    const accessToken = token(item.admin ? "admin@example.com" : "user@example.com");
    const success = await item
      .build(async () => ({ id: 1 }))
      .collection.POST(request(item.body, accessToken));
    assert.equal(success.status, 201);
    assert.deepEqual(await success.json(), { id: 1 });

    const invalid = await item
      .build(async () => ({ id: 1 }))
      .collection.POST(request({}, accessToken));
    assert.equal(invalid.status, 400);
    assert.deepEqual(await invalid.json(), {
      error: "bad_request",
      message: "Invalid request body.",
    });

    const unauthorized = await item
      .build(async () => ({ id: 1 }))
      .collection.POST(request(item.body));
    assert.equal(unauthorized.status, 401);

    if (item.admin) {
      const forbidden = await item
        .build(async () => ({ id: 1 }))
        .collection.POST(request(item.body, token("user@example.com")));
      assert.equal(forbidden.status, 403);
    }

    const conflict = await item
      .build(async () => {
        throw new ApiError(409, "conflict", "Already exists.");
      })
      .collection.POST(request(item.body, accessToken));
    assert.equal(conflict.status, 409);
    assert.deepEqual(await conflict.json(), {
      error: "conflict",
      message: "Already exists.",
    });
  });
}
