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
assert.match(portalSource, /collapsed=\{recommendationPending \|\| Boolean\(coursePlan\)\}/);
const helpers = portalSource.slice(portalSource.indexOf("function kakaoMapPoint("), portalSource.indexOf("function sportCategory("));
const { outputText } = ts.transpileModule(helpers, {});
const context = { encodeURIComponent };
vm.runInNewContext(outputText, context);

assert.equal(
  context.kakaoRouteHref([
    { title: "경포호수광장", latitude: 37.7977914, longitude: 128.9095225 },
    { title: "순포습지", latitude: 37.8401, longitude: 128.8765 },
  ]),
  "https://map.kakao.com/link/by/car/%EA%B2%BD%ED%8F%AC%ED%98%B8%EC%88%98%EA%B4%91%EC%9E%A5,37.7977914,128.9095225/%EC%88%9C%ED%8F%AC%EC%8A%B5%EC%A7%80,37.8401,128.8765",
);
assert.equal(context.kakaoRouteHref([{ title: "경포호수광장", latitude: 37.7977914, longitude: 128.9095225 }]), null);
assert.equal(
  context.kakaoPlaceHref("경포호수광장", 37.7977914, 128.9095225),
  "https://map.kakao.com/link/map/%EA%B2%BD%ED%8F%AC%ED%98%B8%EC%88%98%EA%B4%91%EC%9E%A5,37.7977914,128.9095225",
);

const dtoSource = fs.readFileSync(path.join(__dirname, "../lib/api/dto.ts"), "utf8");
assert.match(dtoSource, /activityCategorySchema = z\.enum\(\[[^\]]*"tour"/);
console.log("PASS: recommendation places support deployed categories and Kakao Map links");
