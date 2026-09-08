/* eslint-disable @typescript-eslint/no-require-imports -- Standalone regression test. */
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const vm = require("node:vm");
const ts = require("typescript");
const read = (file) => fs.readFileSync(path.join(__dirname, "..", file), "utf8").replaceAll("\r\n", "\n");
const compile = (source) => ts.transpileModule(source, { compilerOptions: { module: ts.ModuleKind.CommonJS } }).outputText;
const exportsObject = {};
vm.runInNewContext(compile(read("lib/missionCatalog.ts")), { exports: exportsObject });
const portal = read("components/PortalPage.tsx");
const loadSource = portal.slice(portal.indexOf("async function loadCards("), portal.indexOf("export function PortalPage("));
const filterStart = portal.indexOf("const cards = (recommendationNeedsLogin ? [] : remoteCards ?? []).filter(");
const filterSource = portal.slice(filterStart, portal.indexOf("\n\n  return (", filterStart));
assert.ok(filterStart > 0, "Test must exercise the actual PortalPage filter.");
const courses = [
  { id: 1, title: "홍천사랑마라톤 참가 인증", category: "event", sportName: null, isPublished: true },
  { id: 2, title: "평창 올림픽 기념관 방문 인증", category: "event", sportName: null, isPublished: true },
  { id: 18, title: "육상 미션", category: "event", sportName: "ATHLETICS", isPublished: true },
  { id: 10, title: "수상 미션", category: "event", sportName: "WATER", isPublished: true },
];
const context = {
  missionPresentation: exportsObject.missionPresentation,
  sportsImage: () => "/photo.svg",
  api: {
    courses: { list: async () => courses },
    courseItinerary: async (id) => ({ stops: [{ sportName: id === 1 ? "마라톤" : id === 2 ? "올림픽 레거시" : null, address: id === 1 ? "강원특별자치도 홍천군" : "강원특별자치도 평창군" }] }),
  },
};
vm.runInNewContext(compile(loadSource + "\nfunction applyFilters(remoteCards, activeSportFilters) { const recommendationNeedsLogin = false; const page = 'missions'; const activeFilters = {}; const activeRegionFilters = []; " + filterSource + "\nreturn cards; }"), context);
(async () => {
  const cards = await context.loadCards("missions");
  assert.equal(cards.find((card) => card.href.endsWith("id=1")).tag, "육상스포츠");
  const ids = (filters) => Array.from(context.applyFilters(cards, filters), (card) => Number(card.href.split("id=")[1]));
  assert.deepEqual(ids(["육상스포츠"]), [1, 18]);
  assert.deepEqual(ids(["올림픽레거시"]), [2]);
  assert.deepEqual(ids(["육상스포츠", "올림픽레거시"]), [1, 2, 18]);
  assert.deepEqual(ids(["수상스포츠"]), [10]);
  assert.deepEqual(ids([]), [1, 2, 18, 10]);
  console.log("PASS: Korean API sports flow through real mission cards and single/multiple category filters");
})().catch((error) => { console.error(error); process.exitCode = 1; });
