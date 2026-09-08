/* eslint-disable @typescript-eslint/no-require-imports -- Standalone regression test. */
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const vm = require("node:vm");
const ts = require("typescript");
const read = (file) => fs.readFileSync(path.join(__dirname, "..", file), "utf8");
const helpers = {};
vm.runInNewContext(ts.transpileModule(read("lib/sportsDescription.ts"), { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2020 } }).outputText, { exports: helpers });
const routes = [
  "A코스 (6.4km, 약 3시간) : 상수도 수원지 - 용수골(능애동) - 능선갈림길 - 정상 - 육백마지기",
  "B코스 (17km, 약 8시간) : 한치동 - 육백마지기 - 헬기장 - 정상 - 서남능선 - 삿갓봉 - 자진구비 - 수리재",
  "C코스 (7.5km, 약 4시간) : 지동리(버스종점) - 능선 - 정상 - 서남쪽능선 - 능선갈림길 -용수골 - 상수도 수원지",
  "D코스 (9km, 약 4시간 20분) : 지동리(버스종점) - 능선 - 정상 - 서남쪽능선(삿갓봉 방향) -갈림길 - 지동리",
];
const source = Object.freeze({
  summary: "등산로\n" + routes.join("\n\n"),
  metadata: Object.freeze({ hiking_routes: Object.freeze([Object.freeze({ infoname: "등산로", infotext: routes.join("<br />\n") })]) }),
});
const before = JSON.stringify(source);
const result = helpers.sportsDescription(source);
assert.equal(result.introduction, "");
assert.equal(result.trails.length, 1);
assert.equal(result.trails[0].routes.length, 4);
assert.equal(result.trails[0].routes[0].title, "A코스 (6.4km, 약 3시간)");
assert.equal(result.trails[0].routes[3].description, "지동리(버스종점) - 능선 - 정상 - 서남쪽능선(삿갓봉 방향) -갈림길 - 지동리");
assert.equal(JSON.stringify(source), before);
assert.equal(helpers.splitTrailRoutes(routes.join("  ")).length, 4);
assert.equal(helpers.sportsDescription({ summary: source.summary }).trails[0].routes.length, 4);
assert.equal(helpers.sportsDescription({ summary: "실제 장소 소개", metadata: source.metadata }).introduction, "실제 장소 소개");
assert.equal(helpers.sportsDescription({ metadata: { hiking_routes: [null, 4, {}, { infotext: 7 }, { infotext: " " }] } }).trails.length, 0);
assert.equal(helpers.sportsDescription({ summary: null }).introduction, "");
assert.equal(helpers.sportsDescription({ metadata: { hiking_routes: [source.metadata.hiking_routes[0], source.metadata.hiking_routes[0]] } }).trails.length, 1);
assert.equal(helpers.sportsPlainText('<script>alert(1)</script><p>입구 &rarr; 정상</p><img src=x onerror="alert(1)"><style>body{}</style>&nbsp;4km'), "입구 → 정상\n4km");
assert.equal(helpers.sportsPlainText("입구&#32;→ 정상<br>약 3시간 &#x110000;"), "입구 → 정상\n약 3시간 &#x110000;");
assert.equal(helpers.sportsPlainText("입구 &lt;안내소&gt; → 정상"), "입구 <안내소> → 정상");
assert.equal(helpers.sportsPlainText("길이 < 5km > 3km"), "길이 < 5km > 3km");
assert.equal(helpers.sportsDescription({ summary: "장소 소개\n\n" + source.summary + "\n\n현장 공지 확인", metadata: source.metadata }).introduction, "장소 소개\n\n현장 공지 확인");
assert.equal(helpers.sportsDescription({ summary: source.summary + "\n\n" + source.summary, metadata: { hiking_routes: [source.metadata.hiking_routes[0], source.metadata.hiking_routes[0]] } }).introduction, "");
assert.equal(helpers.splitTrailRoutes("* 입구 → 정상 (10.2㎞, 4시간)\n* 입구 → 폭포 (7km)").length, 2);
assert.equal(helpers.splitTrailRoutes("1코스 (4km) : 입구 - 정상 2코스 (8km) : 마을 - 능선")[1].title, "2코스 (8km)");
assert.equal(helpers.splitTrailRoutes("안내: 통제 구간 확인\nA코스 (4km) : 입구 - 정상")[0].description, "안내: 통제 구간 확인");
const detail = read("components/SportsDetailPage.tsx");
assert.match(detail, /sportsDescription\(activity\)/);
assert.match(detail, /description\.trails\.map/);
assert.doesNotMatch(detail, /dangerouslySetInnerHTML/);
const sportsCards = read("components/PortalPage.tsx").split('if (page === "events")')[0];
assert.doesNotMatch(sportsCards, /description: activity\.summary/);
assert.match(sportsCards, /searchText: activity\.summary/);
assert.match(read("components/PortalPage.tsx"), /card\.searchText \?\? ""/);
assert.match(sportsCards, /href: `\/sports\/detail\?id=\$\{activity\.id\}`/);
console.log("PASS: API trail facts preserved, course cards, text-only HTML, compact clickable sports feed");
