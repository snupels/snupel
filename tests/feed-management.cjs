/* eslint-disable @typescript-eslint/no-require-imports -- Isolated API contract regression. */
const fs = require("node:fs");
const path = require("node:path");
const vm = require("node:vm");
const ts = require("typescript");
const assert = require("node:assert/strict");
const { test } = require("node:test");
const cache = {};
const calls = [];
let response;
let failure;
function load(relative) {
  const file = path.resolve(__dirname, relative);
  if (cache[file]) return cache[file];
  const exports = {};
  cache[file] = exports;
  const localRequire = name => {
    if (name === "./repository") return {
      request: async (url, options) => {
        calls.push({ url, ...options });
        if (failure) throw failure;
        return options.schema.parse(response);
      },
    };
    if (name.startsWith(".")) return load(path.relative(__dirname, path.resolve(path.dirname(file), name + ".ts")));
    return require(name);
  };
  vm.runInNewContext(ts.transpileModule(fs.readFileSync(file, "utf8"), { compilerOptions: { module: ts.ModuleKind.CommonJS } }).outputText,
    { exports, require: localRequire, URL, URLSearchParams, window: {}, sessionStorage: { getItem: () => "test-access-token" } });
  return exports;
}
const { api } = load("../lib/api/service.ts");
const dto = load("../lib/api/dto.ts");

test("feed-only deletion and authenticated permission use the right API contract", async () => {
  response = undefined;
  await api.stampSubmissions.deleteFeed(12);
  assert.equal(calls.at(-1).url, "/stamp-submissions/12/feed");
  assert.equal(calls.at(-1).method, "DELETE");
  assert.equal(calls.at(-1).token, "test-access-token");
  assert.throws(() => api.stampSubmissions.deleteFeed(0));
  response = { canReviewMissions: true };
  assert.equal((await api.adminStampSubmissions.permission()).canReviewMissions, true);
  assert.equal(calls.at(-1).url, "/me/mission-review-permission");
  failure = new Error("forbidden");
  await assert.rejects(api.adminStampSubmissions.permission(), /forbidden/);
  failure = undefined;
});

test("visibility changes omit caption unless deliberately edited", () => {
  const input = dto.feedVisibilityUpdateSchema.parse({ share_to_feed: false });
  assert.equal(input.share_to_feed, false);
  assert.equal(Object.hasOwn(input, "feed_caption"), false);
  assert.equal(dto.feedVisibilityUpdateSchema.safeParse({}).success, false);
  assert.equal(dto.rejectSubmissionSchema.safeParse({ reason: "  " }).success, false);
});

test("owner controls and reviewer page preserve award and privacy boundaries", () => {
  const ui = fs.readFileSync(path.join(__dirname, "../components/CommunityPage.tsx"), "utf8");
  for (const label of ["비공개로 변경", "공개로 변경", "피드에서 삭제", "스탬프·배지"]) assert.ok(ui.includes(label));
  assert.ok(ui.includes("user?.id === post.authorId"));
  assert.ok(ui.includes("!detailIsPublic"));
  assert.ok(ui.includes("api.stampSubmissions.deleteFeed(post.id)"));
  assert.ok(!ui.includes("feed_caption: null"));
  const review = fs.readFileSync(path.join(__dirname, "../components/MissionReviewPage.tsx"), "utf8");
  for (const required of ["proofInstructions", "<ProofGallery", "api.adminStampSubmissions.approve", "api.adminStampSubmissions.reject", "failure.status === 409", "lock.current"]) assert.ok(review.includes(required));
});
