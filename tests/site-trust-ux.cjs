/* eslint-disable @typescript-eslint/no-require-imports -- Source-level trust and UX regression checks. */
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const read = file => fs.readFileSync(path.join(__dirname, "..", file), "utf8");

const home = read("components/HomePage.tsx");
assert.ok(home.includes("스포츠 장소나 지역을 검색해보세요"));
assert.ok(home.includes("어떤 강원 스포츠를 즐겨볼까요?"));
assert.ok(!home.includes("Instargram"));

const preferences = read("components/CoursePreferences.tsx");
assert.ok(preferences.includes('group.name === "sigun" ? "all"'));
assert.ok(preferences.includes('required={group.name === "theme" || group.name === "availableMinutes"}'));
assert.ok(!preferences.includes('group.name === "sigun" ? "강릉시"'));

const map = read("components/SportsMapPage.tsx");
assert.ok(map.includes("aria-pressed={selectedRegion === region}"));
assert.ok(map.includes("스포츠 시설 목록"));
assert.ok(map.includes("visibleActivities.map"));
assert.ok(map.includes("상세정보 보기"));

const community = read("components/CommunityPage.tsx");
assert.ok(community.includes("BLOCKED_USERS_KEY"));
assert.ok(community.includes("게시물 #{post.id} 신고 안내"));
assert.ok(community.includes("이 사용자의 게시물 숨기기"));
assert.ok(community.includes("댓글 ${comment.id} 신고 안내"));

const footer = read("components/SiteFooter.tsx");
assert.ok(footer.includes("운영정보와 고객지원"));
assert.ok(footer.includes("회원 탈퇴·개인정보 요청"));
assert.ok(footer.includes("게시물·댓글 신고"));

const support = read("components/SupportPage.tsx");
const privacy = read("components/PrivacyPolicyPage.tsx");
for (const section of ["회원 탈퇴·개인정보 요청", "게시물·댓글 신고", "서비스 운영정보"])
  assert.ok(support.includes(section));
assert.ok(!support.includes("프론트엔드"));
assert.ok(!support.includes("온라인 탈퇴 API"));
assert.ok(read("components/SupportRequestTarget.tsx").includes("신고 대상:"));
for (const section of ["개인정보 처리자와 문의처", "보유기간과 파기", "제3자 제공과 처리위탁", "이용자의 권리"])
  assert.ok(privacy.includes(section));

const layout = read("app/layout.tsx");
assert.ok(layout.includes('template: "%s | 강원 스포츠 패스포트"'));
for (const route of ["sports", "courses", "missions", "events", "map", "community"])
  assert.ok(read(`app/(portal)/${route}/page.tsx`).includes("export const metadata"), `${route} has route metadata`);

console.log("PASS: trust center, minimal signup, accurate discovery copy, explicit course choices, accessible map, community safety and metadata");
