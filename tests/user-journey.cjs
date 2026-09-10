/* eslint-disable @typescript-eslint/no-require-imports -- Standalone regression test. */
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const vm = require("node:vm");
const ts = require("typescript");
const React = require("react");
const { renderToStaticMarkup } = require("react-dom/server");

const read = (file) => fs.readFileSync(path.join(__dirname, "..", file), "utf8");
function load(source, requireMock = require) {
  const exports = {};
  const compiled = ts.transpileModule(source, {
    compilerOptions: { module: ts.ModuleKind.CommonJS, jsx: ts.JsxEmit.ReactJSX, esModuleInterop: true },
  }).outputText;
  vm.runInNewContext(compiled, { exports, require: requireMock, URLSearchParams, process: { env: {} } });
  return exports;
}

const { missionPhotoError, MAX_MISSION_PHOTO_BYTES } = load(read("lib/missionPhoto.ts"));
for (const type of ["image/jpeg", "image/png", "image/webp"]) {
  assert.equal(missionPhotoError({ type, size: 1 }), null);
  assert.equal(missionPhotoError({ type, size: MAX_MISSION_PHOTO_BYTES }), null);
}
assert.match(missionPhotoError({ type: "image/heic", size: 100 }), /JPG, PNG, WEBP/);
assert.match(missionPhotoError({ type: "image/svg+xml", size: 100 }), /JPG, PNG, WEBP/);
assert.match(missionPhotoError({ type: "image/png", size: 0 }), /내용이 없는/);
assert.match(missionPhotoError({ type: "image/png", size: MAX_MISSION_PHOTO_BYTES + 1 }), /10MB/);

const { missionPresentation } = load(read("lib/missionCatalog.ts"));
const legacyMission = { category: "event", sportName: null, title: "API에서 가져온 미션" };
assert.equal(missionPresentation(legacyMission, { sportName: "marathon" }).category, "육상스포츠");
assert.equal(missionPresentation(legacyMission, { sportName: "olympic_legacy" }).category, "올림픽 레거시");
assert.equal(missionPresentation({ ...legacyMission, sportName: "MOUNTAIN" }, { sportName: "trekking" }).category, "산악스포츠");
assert.equal(missionPresentation({ ...legacyMission, sportName: "SNOW" }).category, "동계스포츠");
assert.equal(missionPresentation(legacyMission).category, "이벤트");

const missionSource = read("components/MissionDetailPage.tsx");
assert.match(missionSource, /key=\{courseId\} courseId=\{courseId\}/);
assert.match(missionSource, /if \(submissionLock\.current \|\| completed\) return/);
assert.match(missionSource, /if \(cancelled\) return/);
assert.match(missionSource, /!courseData\.isPublished/);
assert.match(missionSource, /!itineraryData\.stops\.length/);
assert.match(missionSource, /disabled=\{completed \|\| submitting\}/);
assert.match(missionSource, /href="\/activity-history"/);
assert.match(missionSource, /\/login\?next=\$\{encodeURIComponent/);
assert.doesNotMatch(missionSource, /navigator\.geolocation|getCurrentPosition|watchPosition/);

const eventSource = read("components/EventDetailPage.tsx");
assert.match(eventSource, /key=\{eventId\} eventId=\{eventId\}/);
assert.match(eventSource, /<dialog ref=\{posterDialogRef\}/);
assert.match(eventSource, /<button type="button" onClick=\{closePoster\}/);
assert.match(eventSource, /posterDialogRef\.current\?\.showModal\(\)/);
assert.match(eventSource, /onCancel=\{closePoster\}/);
assert.match(eventSource, /event\.representativeImageUrl && <button/);
assert.doesNotMatch(eventSource, /fallbackImages/);
assert.doesNotMatch(eventSource, /<a href=\{`\/events\/detail\?id=\$\{event\.id\}`\}[^>]*>닫기/);
assert.match(read("components/SportsDetailPage.tsx"), /key=\{activityId\} activityId=\{activityId\}/);

const portalSource = read("components/PortalPage.tsx");
assert.match(portalSource, /href: `\/sports\/detail\/\?id=\$\{stop\.activityId\}`/);
assert.match(portalSource, /key=\{page === "courses" \? `\$\{page\}:\$\{query\}` : page\}/);
assert.match(portalSource, /id="kakao-map-sdk"/);
assert.match(portalSource, /libraries=clusterer,services/);
assert.doesNotMatch(portalSource, /cardImages\[index/);
assert.match(portalSource, /stop\.representativeImageUrl \?\? unavailablePhoto/);
let currentQuery = new URLSearchParams("sport=산악스포츠&sport=동계스포츠&region=평창&region=강릉&q=스키");
const portal = load(portalSource, (name) => {
  if (name === "react" || name === "react/jsx-runtime") return require(name);
  if (name === "next/navigation") return { useSearchParams: () => currentQuery };
  if (name === "next/link") return { __esModule: true, default: ({ children, ...props }) => React.createElement("a", props, children) };
  if (name === "next/image" || name === "next/script") return { __esModule: true, default: () => null };
  if (name === "@/lib/api/service") return { api: { hasToken: () => false } };
  if (name === "./AppIcon") return { AppIcon: () => null };
  if (name === "./CoursePreferences") return { CoursePreferences: () => null };
  if (name === "./CourseGuide") return { CourseGuide: () => null };
  if (name.endsWith(".png")) return { src: "/fixture.png", width: 100, height: 100 };
  return {};
});
const sportsHtml = renderToStaticMarkup(React.createElement(portal.PortalPage, { page: "sports" }));
for (const [name, values] of [["sport", ["산악스포츠", "동계스포츠"]], ["region", ["평창", "강릉"]]]) {
  for (const value of values) assert.ok(sportsHtml.includes(`type="hidden" name="${name}" value="${value}"`));
}
assert.match(sportsHtml, /name="q"[^>]*value="스키"/);
assert.match(sportsHtml, /type="submit" aria-label="검색"/);
assert.match(sportsHtml, /정보를 불러오는 중입니다/);

currentQuery = new URLSearchParams("recommend=1&sigun=양양군&sport=marine&theme=thrill");
const coursesHtml = renderToStaticMarkup(React.createElement(portal.PortalPage, { page: "courses" }));
assert.match(coursesHtml, /로그인하고 추천받기/);
assert.ok(coursesHtml.includes(`/login?next=${encodeURIComponent(`/courses/?${currentQuery}`)}`));
console.log("PASS: mission photo safeguards, detail navigation, search persistence, course login return, accessible poster close");

const historyHelpers = load(read("lib/activityHistory.ts"));
assert.equal(historyHelpers.activityHistoryDetailHref(1231), "/activity-feed/detail/?historyId=1231");
const historyListSource = read("components/ActivityHistoryPage.tsx");
const historyDetailSource = read("components/ActivityDetailPage.tsx");
assert.match(historyListSource, /const PAGE_SIZE = 20/);
assert.match(historyListSource, /api\.activityHistory\.list\(\{/);
assert.match(historyListSource, /page: nextPage/);
assert.match(historyListSource, /q: query \|\| undefined/);
assert.match(historyListSource, /status: filter === "all" \? undefined : filter/);
assert.match(historyListSource, /loadPage\(page \+ 1\)/);
assert.match(historyListSource, /loadPage\(error\.page\)/);
assert.match(historyListSource, /activityHistoryDetailHref\(activity\.id\)/);
assert.match(historyDetailSource, /api\.activityHistory\.get\(historyId\)/);
assert.match(historyDetailSource, /if \(!api\.hasToken\(\)\)/);
assert.match(historyDetailSource, /record\.rejectionReason/);
assert.doesNotMatch(historyDetailSource, /api\.activities\.get|feedTitle|feedDate|feedStatus|fallbackImage|getCurrentPosition/);

let historyFixture = {
  id: 1231, activityId: 42, courseId: 8, submissionId: 123,
  type: "submission", status: "rejected", title: "실제 인증 미션", placeName: "실제 장소", sigun: "평창군",
  imageUrl: "https://proof.example.test/private-photo.jpg", occurredAt: "2026-09-08T01:00:00Z", rejectionReason: "포토존이 사진에 보이지 않습니다.",
};
let historyQuery = new URLSearchParams("historyId=1231&title=가짜제목&status=승인완료");
const historyDetail = load(historyDetailSource, (name) => {
  if (name === "react") return { ...React, useState: (initial) => [initial === null ? historyFixture : initial === true ? false : initial, () => {}] };
  if (name === "react/jsx-runtime") return require(name);
  if (name === "next/navigation") return { useSearchParams: () => historyQuery };
  if (name === "next/link") return { __esModule: true, default: ({ children, ...props }) => React.createElement("a", props, children) };
  if (name === "next/image") return { __esModule: true, default: ({ src, alt }) => React.createElement("img", { src, alt }) };
  if (name === "./AppIcon") return { AppIcon: () => null };
  if (name === "@/lib/activityHistory") return historyHelpers;
  if (name === "@/lib/api/service") return { api: { hasToken: () => true } };
  throw new Error("Unexpected history dependency " + name);
});
const renderHistoryDetail = () => renderToStaticMarkup(React.createElement(historyDetail.ActivityDetailPage));
const rejectedHtml = renderHistoryDetail();
assert.ok(rejectedHtml.includes(historyFixture.imageUrl));
assert.ok(rejectedHtml.includes(historyFixture.rejectionReason));
assert.match(rejectedHtml, /미션 안내에서 다시 인증하기/);
assert.match(rejectedHtml, /\/missions\/detail\/\?id=8/);
assert.match(rejectedHtml, /\/sports\/detail\/\?id=42/);
assert.doesNotMatch(rejectedHtml, /가짜제목|승인완료/);
historyFixture = { ...historyFixture, type: "saved", status: "collected", courseId: null, rejectionReason: null };
assert.match(renderHistoryDetail(), /참여 인증이나 스탬프 획득 기록은 아닙니다/);
historyQuery = new URLSearchParams("id=42&title=가짜제목&status=승인완료");
const legacyHtml = renderHistoryDetail();
assert.match(legacyHtml, /이전 링크에는 장소 정보만 있어 개인 인증 결과를 확인할 수 없습니다/);
assert.doesNotMatch(legacyHtml, /가짜제목|승인완료|private-photo/);
console.log("PASS: paginated authenticated history, record-specific proof and rejection detail, safe legacy links");
