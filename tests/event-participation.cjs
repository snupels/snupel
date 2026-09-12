/* eslint-disable @typescript-eslint/no-require-imports -- Standalone event guidance regression. */
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const vm = require("node:vm");
const ts = require("typescript");
const source = (file) => fs.readFileSync(path.join(__dirname, "..", file), "utf8");
function load(file, dependencies = require) {
  const context = { exports: {}, require: dependencies, Date };
  vm.runInNewContext(ts.transpileModule(source(file), {
    compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2020 },
  }).outputText, context);
  return context.exports;
}
const dto = load("lib/api/dto.ts");
const { eventParticipation, compareEvents } = load("lib/eventParticipation.ts", (name) => name === "./api/dto" ? dto : require(name));
const now = Date.parse("2026-09-08T12:00:00+09:00");
const guide = { mode: "registration", status: "open", verifiedAt: "2026-09-08" };
const event = (participation = guide, overrides = {}) => ({
  startsAt: "2026-09-19T00:00:00", endsAt: "2026-09-20T23:59:59", sportName: "카누",
  metadata: { eventType: "sports", participation }, ...overrides,
});
const status = (data, at = now) => eventParticipation(event(data), at)?.status;

assert.equal(eventParticipation(event(undefined, { metadata: null }), now), null);
assert.equal(status({ ...guide, mode: "unknown" }), undefined);
assert.equal(status({ ...guide, closesAt: "2026-09-11T18:00:00" }), undefined, "deadlines must specify timezone");
assert.equal(status({ ...guide, verifiedAt: "not-a-date" }), undefined);
assert.equal(status(guide), "registration", "missing deadline must not imply first-come admission");
assert.equal(status({ ...guide, firstCome: true }), "firstCome");
assert.equal(status({ ...guide, firstCome: true, verifiedAt: "2026-09-01" }), "check");
assert.equal(status({ ...guide, status: "check" }), "check");
assert.equal(status({ ...guide, opensAt: "2026-09-09T10:00:00+09:00" }), "planned");
const closesAt = "2026-09-11T18:00:00+09:00";
assert.equal(status({ ...guide, closesAt }, Date.parse(closesAt) - 1), "registration");
assert.equal(status({ ...guide, closesAt }, Date.parse(closesAt)), "closed");
assert.equal(status({ ...guide, closesAt, onsiteAvailable: true }, Date.parse(closesAt)), "onsite");
assert.equal(status({ ...guide, closesAt, onsiteAvailable: true }, Date.parse("2026-09-18T12:00:00+09:00")), "onsiteCheck");
assert.equal(status({ ...guide, mode: "onsite", status: "check" }), "onsiteCheck");
assert.equal(status({ ...guide, mode: "onsite", verifiedAt: "2026-08-01" }), "onsiteCheck");
assert.equal(status({ ...guide, mode: "onsite", status: "closed" }), "closed");
assert.equal(status({ ...guide, onsiteAvailable: true, status: "closed" }), "closed");
assert.equal(status({ ...guide, mode: "spectator" }), "spectator");
assert.equal(status(guide, Date.parse("2026-09-21T00:00:00+09:00")), "ended", "naive API dates are interpreted in Korea time");

const joinable = event(guide);
const closed = event({ ...guide, status: "closed" }, { startsAt: "2026-09-10T09:00:00" });
const spectator = event({ ...guide, mode: "spectator" });
const general = event(guide, { sportName: null, metadata: { participation: guide } });
const items = [general, closed, spectator, joinable];
const ordered = [...items].sort((a, b) => compareEvents(a, b, now));
assert.deepEqual(ordered, [joinable, spectator, closed, general]);
assert.deepEqual(items, [general, closed, spectator, joinable], "sorting must not alter source objects");
assert.ok(compareEvents(event(guide, { startsAt: null }), joinable, now) > 0);
assert.ok(compareEvents(event(guide, { startsAt: "2026-09-18T09:00:00" }), joinable, now) < 0);

const cards = source("components/PortalPage.tsx");
assert.ok(cards.includes("compareEvents(first, second)"));
assert.ok(cards.includes("secondaryTag: eventParticipation(activity)?.label"));
const detail = source("components/EventDetailPage.tsx");
assert.ok(detail.includes('aria-label="참가 안내"'));
for (const label of ["참여 종목", "참가 대상", "참가비", "신청 방법", "공식 안내 확인일", "실시간 연동이 아닙니다"]) assert.ok(detail.includes(label));
assert.ok(detail.includes("imageCaption"));
assert.ok(detail.includes('event.metadata?.imageType === "photo"'));
assert.ok(detail.includes("showModal()"));
assert.ok(detail.includes("onCancel={closePoster}"));
assert.ok(detail.includes("Google 캘린더에 추가"));
assert.ok(detail.includes('rel="noopener noreferrer"'));
console.log("PASS: verified event participation, KST deadlines, stale/onsite status, sports ranking and unchanged detail actions");
