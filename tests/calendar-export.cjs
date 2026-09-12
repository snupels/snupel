/* eslint-disable @typescript-eslint/no-require-imports -- Standalone calendar export regression test. */
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const vm = require("node:vm");
const ts = require("typescript");

const read = file => fs.readFileSync(path.join(__dirname, "..", file), "utf8");
const { outputText } = ts.transpileModule(read("lib/eventCalendar.ts"), { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2020 } });
const result = {};
vm.runInNewContext(outputText, { exports: result, URLSearchParams });

const event = { id: 7, startsAt: "2026-09-07", endsAt: "2026-09-09", placeName: "강원 & 축제? #1", address: "강릉, 중앙로", summary: "무료, 야외 행사\n준비물", sourceUrl: "https://example.com/?a=1&b=2" };
const url = new URL(result.googleCalendarHref(event));
assert.equal(url.origin, "https://calendar.google.com");
assert.equal(url.searchParams.get("action"), "TEMPLATE");
assert.equal(url.searchParams.get("text"), event.placeName);
assert.equal(url.searchParams.get("dates"), "20260907/20260910");
assert.equal(url.searchParams.get("ctz"), "Asia/Seoul");
assert.equal(url.searchParams.get("location"), event.address);
assert.ok(url.searchParams.get("details").includes(event.sourceUrl));
assert.ok(url.searchParams.get("details").includes("https://sportspassport.kr/events/detail/?id=7"));
for (const [start, end, expected] of [["2026-12-31", null, "20261231/20270101"], ["2028-02-29", "2028-02-29", "20280229/20280301"], ["2026-09-07T00:00:00+09:00", null, "20260907/20260908"]]) {
  assert.equal(new URL(result.googleCalendarHref({ ...event, startsAt: start, endsAt: end })).searchParams.get("dates"), expected);
}
for (const changes of [{ startsAt: null }, { startsAt: "bad" }, { startsAt: "2026-02-30" }, { endsAt: "invalid" }, { endsAt: "2026-09-01" }]) assert.equal(result.googleCalendarHref({ ...event, ...changes }), null);
const detail = read("components/EventDetailPage.tsx");
assert.doesNotMatch(detail, /createObjectURL|\.ics|exportCalendar|calendarFile/);
assert.ok(detail.includes('href={calendarHref} target="_blank" rel="noopener noreferrer"'));
for (const file of ["components/HomePage.tsx", "components/PortalPage.tsx"]) {
  assert.ok(read(file).includes('title: "내 행사 일정"'));
  assert.doesNotMatch(read(file), /calendar\.google\.com\/calendar\/u\/0\/r/);
}
console.log("PASS: Google calendar links, inclusive dates, invalid dates and saved-event navigation");
