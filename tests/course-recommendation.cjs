/* eslint-disable @typescript-eslint/no-require-imports -- Standalone regression test. */
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const vm = require("node:vm");
const ts = require("typescript");

const portalSource = fs.readFileSync(path.join(__dirname, "../components/PortalPage.tsx"), "utf8");
const preferencesSource = fs.readFileSync(path.join(__dirname, "../components/CoursePreferences.tsx"), "utf8");
assert.doesNotMatch(preferencesSource, /백엔드 추천 결과를 바로 확인해보세요/);
assert.match(preferencesSource, /다른 코스 보기/);
assert.match(preferencesSource, /open=\{open\}/);
assert.match(preferencesSource, /onToggle=\{\(event\) => setOpen\(event\.currentTarget\.open\)\}/);
assert.match(preferencesSource, /focus-visible:ring-inset focus-visible:ring-white/);
assert.match(portalSource, /collapsed=\{recommendationPending\s*\|\|\s*Boolean\(coursePlan\)\}/);
assert.match(portalSource, /recommendationRequested = page === "courses" && searchParams\.get\("recommend"\) === "1"/);
assert.match(portalSource, /if \(page === "courses"\) return;/);
const helpers = portalSource.slice(portalSource.indexOf("function kakaoMapPoint("), portalSource.indexOf("function sportCategory("));
const { outputText } = ts.transpileModule(helpers, {});
const context = { encodeURIComponent };
vm.runInNewContext(outputText, context);

async function run() {
assert.equal(
  context.kakaoRouteHref([
    { title: "경포호수광장", latitude: 37.7977914, longitude: 128.9095225 },
    { title: "순포습지", latitude: 37.8401, longitude: 128.8765 },
  ]),
  "https://map.kakao.com/link/by/car/%EA%B2%BD%ED%8F%AC%ED%98%B8%EC%88%98%EA%B4%91%EC%9E%A5,37.7977914,128.9095225/%EC%88%9C%ED%8F%AC%EC%8A%B5%EC%A7%80,37.8401,128.8765",
);
assert.equal(context.kakaoRouteHref([{ title: "경포호수광장", latitude: 37.7977914, longitude: 128.9095225 }]), null);
assert.equal(
  context.kakaoPlaceHref("경포호수광장", "강릉시"),
  "https://map.kakao.com/link/search/%EA%B2%BD%ED%8F%AC%ED%98%B8%EC%88%98%EA%B4%91%EC%9E%A5%20%EA%B0%95%EB%A6%89%EC%8B%9C",
);
assert.equal(
  context.kakaoPlaceHref("경포호수광장", "강릉시", "21875910"),
  "https://map.kakao.com/link/map/21875910",
);
assert.equal(
  context.kakaoRouteHref([
    { title: "경포호수광장", latitude: 37.7977914, longitude: 128.9095225, placeId: "21875910" },
    { title: "교동반점", latitude: 37.758354, longitude: 128.893003, placeId: "8773810" },
  ]),
  "https://map.kakao.com/link/by/car/21875910/8773810",
);
context.window = { kakao: { maps: {
  LatLng: class {},
  services: {
    Status: { OK: "OK" },
    Places: class {
      keywordSearch(_query, callback) {
        callback([
          { id: "far", place_name: "원조강릉교동반점 본점", x: "128.8", y: "37.7" },
          { id: "8773810", place_name: "원조강릉교동반점 본점", x: "128.893003", y: "37.758354" },
        ], "OK");
      }
    },
  },
} } };
assert.equal(await context.findKakaoPlaceId("교동반점", 37.758354, 128.893003), "8773810");

const dtoSource = fs.readFileSync(path.join(__dirname, "../lib/api/dto.ts"), "utf8");
assert.match(dtoSource, /activityCategorySchema = z\.enum\(\[[^\]]*"tour"/);
console.log("PASS: recommendation places support deployed categories and Kakao Map links");
}

run().catch((error) => { console.error(error); process.exitCode = 1; });
