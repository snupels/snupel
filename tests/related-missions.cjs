/* eslint-disable @typescript-eslint/no-require-imports -- Standalone regression test. */
const assert = require("node:assert/strict");
const { test } = require("node:test");
const fs = require("node:fs");
const path = require("node:path");
const vm = require("node:vm");
const ts = require("typescript");
const read = (file) => fs.readFileSync(path.join(__dirname, "..", file), "utf8");
function load(api, clock = Date) {
  const context = { exports: {}, Date: clock, require: () => ({ api }) };
  vm.runInNewContext(ts.transpileModule(read("lib/relatedMissions.ts"), {
    compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2020 },
  }).outputText, context);
  return context.exports.relatedMissions;
}
const course = (id, extra = {}) => ({ id, category: "event", isPublished: true, isClosed: false, ...extra });
const ids = (items) => Array.from(items, (item) => item.id);

test("matches exact certification place; hides closed, unpublished, unrelated and empty missions", async () => {
  const calls = [];
  const find = load({
    courses: { list: async () => [course(1), course(2), course(3, { isClosed: true }), course(4, { isPublished: false }), course(5, { category: "sports" }), course(6), course(7)] },
    courseItinerary: async (id) => {
      calls.push(id);
      return { stops: id === 6 ? [] : [{ activityId: id === 2 ? 999 : 466 }, { activityId: 888 }] };
    },
  });
  assert.deepEqual(ids(await find(466)), [1, 7]);
  assert.deepEqual(ids(await find(888)), [], "other stops are not the photo certification location");
  assert.deepEqual(ids(await find(123)), []);
  assert.deepEqual(calls.sort(), [1, 2, 6, 7]);
});

test("loads later pages, deduplicates courses and shares in-flight requests across places", async () => {
  const pages = [];
  let requests = 0;
  let active = 0;
  let peak = 0;
  const find = load({
    courses: { list: async (page, size) => {
      pages.push(page); assert.equal(size, 100);
      return page === 1 ? Array.from({ length: 100 }, (_, i) => course(i + 1)) : [course(1), course(101)];
    } },
    courseItinerary: async (id) => {
      requests++; active++; peak = Math.max(peak, active);
      await new Promise((resolve) => setImmediate(resolve)); active--;
      return { stops: [{ activityId: id === 101 ? 466 : 999 }] };
    },
  });
  const [a, b] = await Promise.all([find(466), find(999)]);
  assert.deepEqual(ids(a), [101]); assert.equal(b.length, 100);
  assert.deepEqual(pages, [1, 2]); assert.equal(requests, 101); assert.ok(peak <= 6);
});

test("invalid IDs do not fetch; failed requests can retry and cache expires", async () => {
  let now = 1000;
  let calls = 0;
  const find = load({
    courses: { list: async () => { calls++; return [course(1)]; } },
    courseItinerary: async () => { if (calls === 1) throw new Error("offline"); return { stops: [{ activityId: 466 }] }; },
  }, { now: () => now });
  for (const id of [0, -1, NaN, 1.5]) assert.deepEqual(ids(await find(id)), []);
  assert.equal(calls, 0);
  await assert.rejects(find(466), /offline/);
  assert.deepEqual(ids(await find(466)), [1]);
  await find(466); assert.equal(calls, 2);
  now += 60_001; await find(466); assert.equal(calls, 3);
});

test("UI links directly to mission detail, is isolated from detail loading and handles errors", () => {
  const ui = read("components/RelatedMissions.tsx");
  assert.ok(ui.includes("/missions/detail/?id=${mission.id}"));
  assert.ok(ui.includes("if (!missions.length) return null"));
  assert.ok(ui.includes("cancelled = true"));
  assert.ok(ui.includes("미션 참여하기"));
  assert.ok(ui.includes("다시 확인"));
  assert.ok(read("components/SportsDetailPage.tsx").includes('<RelatedMissions key={activity.id} activityId={activity.id} />'));
});
