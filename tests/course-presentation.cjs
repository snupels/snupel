/* eslint-disable @typescript-eslint/no-require-imports -- Standalone regression test. */
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const vm = require("node:vm");
const ts = require("typescript");
const read = (file) => fs.readFileSync(path.join(__dirname, "..", file), "utf8");
const helpers = {};
vm.runInNewContext(ts.transpileModule(read("lib/coursePresentation.ts"), { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2020 } }).outputText, { exports: helpers });
const stops = Object.freeze([
  Object.freeze({ activityId: 2475, placeName: "북한강포시즌수상레저" }),
  Object.freeze({ activityId: 3698, placeName: "춘천의암호나들길" }),
  Object.freeze({ activityId: 45, placeName: "공지천조각공원" }),
]);
assert.equal(helpers.courseItineraryDescription(stops), "북한강포시즌수상레저 → 춘천의암호나들길 → 공지천조각공원 순서로 방문하는 3개 장소의 추천 일정입니다.");
assert.equal(helpers.courseStopReason("2475에서 15분 이동 후 도착합니다.", stops), "북한강포시즌수상레저에서 15분 이동 후 도착합니다.");
assert.equal(helpers.courseStopReason("3698에서 약 15분 이동합니다.", stops), "춘천의암호나들길에서 약 15분 이동합니다.");
assert.equal(helpers.courseStopReason("추천합니다. 2475에서 15분 이동", stops), "추천합니다. 북한강포시즌수상레저에서 15분 이동");
assert.equal(helpers.courseStopReason("장소 ID: 3698 방문", stops), "춘천의암호나들길 방문");
for (const original of [
  "주소: 강원특별자치도 춘천시 북한강변길 2475", "주소: 강원특별자치도 춘천시 2475에서 15분 이동",
  "요금 2475원, 거리 3698m, 활동 45분", "12475에서 15분 이동", "9999에서 15분 이동", "GRID2475 장소", "ID: 24750 장소",
]) assert.equal(helpers.courseStopReason(original, stops), original);
assert.equal(helpers.courseStopReason("2475에서 15분 이동", []), "2475에서 15분 이동");
assert.equal(helpers.courseItineraryDescription([{ activityId: 1234, placeName: null }]), "1번째 장소 순서로 방문하는 1개 장소의 추천 일정입니다.");
const portal = read("components/PortalPage.tsx");
assert.match(portal, /description: courseItineraryDescription\(recommendation\.stops\)/);
assert.match(portal, /description: courseStopReason\(stop\.reason, recommendation\.stops\)/);
assert.doesNotMatch(portal, /description: recommendation\.description/);
assert.match(portal, /추정 거리 약/);
assert.match(portal, /예상 이동 약/);
assert.match(portal, /실제 도로, 교통 및 현장 여건에 따라 달라집니다/);
console.log("PASS: itinerary-derived summary, exact place-ID references only, estimates clearly labeled, source data unchanged");
