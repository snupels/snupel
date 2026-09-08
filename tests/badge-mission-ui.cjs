/* eslint-disable @typescript-eslint/no-require-imports -- Standalone regression test. */
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const ts = require("typescript");
const vm = require("node:vm");
const source = (file) => fs.readFileSync(path.join(__dirname, "..", file), "utf8");
const context = { exports: {} };
vm.runInNewContext(ts.transpileModule(source("lib/badgeCatalog.ts"), {
  compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2020 },
}).outputText, context);
const { BADGE_CATALOG, earnedBadgeCatalogIds } = context.exports;

assert.equal(BADGE_CATALOG.length, 12);
assert.equal(BADGE_CATALOG.find((item) => item.id === 2).description, "산악 미션 첫 완료");
assert.equal(BADGE_CATALOG.find((item) => item.id === 10).description, "서로 다른 미션 3개 완료");
assert.equal(BADGE_CATALOG.find((item) => item.id === 10).ruleKey, "three_missions");
const missionConditions = {
  1: "미션 첫 완료", 3: "해발 1,000m 이상 정상 방문 미션 완료", 4: "트레킹 미션 3개 완료",
  5: "해양 스포츠 미션 완료", 6: "내륙 수상 스포츠 미션 완료", 7: "설상 스포츠 미션 완료",
  8: "자전거 미션 완료", 9: "러닝 미션 완료", 11: "일출 명소 미션 완료", 12: "서로 다른 스포츠 3종 미션 완료",
};
for (const [id, description] of Object.entries(missionConditions)) {
  assert.equal(BADGE_CATALOG.find((item) => item.id === Number(id)).description, description);
}
assert.deepEqual([...earnedBadgeCatalogIds([{ badgeId: 93, ruleKey: "first_mountain" }, { badgeId: 88, ruleKey: "three_missions" }])], [2, 10]);
assert.deepEqual([...earnedBadgeCatalogIds([{ badgeId: 10, ruleKey: "three_regions" }, { badgeId: 44, ruleKey: "three_missions" }])], [10]);
assert.equal(earnedBadgeCatalogIds([{ badgeId: 2, ruleKey: "unknown" }, { badgeId: 10, ruleKey: null }]).size, 0);

const badges = source("components/BadgesPage.tsx");
assert.ok(badges.includes("earnedBadgeCatalogIds(badges)"));
assert.ok(badges.includes("earnedIds.size"));
assert.ok(!badges.includes("badges.length"));
assert.ok(badges.includes("미션의 사진 인증이 승인되고 배지 조건을 달성하면 디지털 배지가 기록됩니다."));
assert.ok(!badges.includes("패스포트 리워드"));
assert.ok(!badges.includes("/stampbook#rewards"));
assert.ok(!source("lib/badgeRewards.ts").includes("숙박 할인권"));
assert.ok(badges.includes("api.claimReward("));
const history = source("components/ActivityHistoryPage.tsx");
assert.ok(history.includes('href="/community/"'));
assert.ok(history.includes("스포츠 피드 보기"));
assert.ok(history.includes('href="/missions"'));
assert.ok(history.includes("<HistoryResults"));
assert.ok(history.includes('aria-label="인증 상태 필터"'));
assert.ok(source("components/ActivityDetailPage.tsx").includes('href="/community/"'));
console.log("PASS: mission badge criteria, stable earned mapping, and activity-to-community links");
