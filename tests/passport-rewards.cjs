/* eslint-disable @typescript-eslint/no-require-imports -- Standalone regression test. */
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const ts = require("typescript");
const vm = require("node:vm");

const source = (file) => fs.readFileSync(path.join(__dirname, "..", file), "utf8");
const moduleValue = { exports: {} };
vm.runInNewContext(ts.transpileModule(source("lib/passportRewards.ts"), {
  compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2020 },
}).outputText, { exports: moduleValue.exports, module: moduleValue });
const { PASSPORT_REWARD_PLANS, PASSPORT_REWARD_NOTICE } = moduleValue.exports;

assert.equal(PASSPORT_REWARD_PLANS.length, 2);
assert.equal(PASSPORT_REWARD_PLANS[0].title, "강원 숙박 할인권");
assert.match(PASSPORT_REWARD_PLANS[1].title, /티셔츠.*굿즈/);
for (const plan of PASSPORT_REWARD_PLANS) {
  assert.equal(plan.status, "planned");
  assert.equal(plan.threshold, undefined, "Do not fabricate unconfirmed eligibility thresholds");
  assert.equal(plan.couponCode, undefined, "Product plans must not look like issued coupons");
}
assert.match(PASSPORT_REWARD_NOTICE, /확정되지 않았/);
assert.match(PASSPORT_REWARD_NOTICE, /보장하지 않/);

const passport = source("components/PassportPage.tsx");
const rewards = source("components/PassportRewards.tsx");
const myPassport = source("components/MyPassportPage.tsx");
const badges = source("components/BadgesPage.tsx");
assert.ok(!passport.includes("BADGE_REWARD_MILESTONES"));
assert.ok(!passport.includes("api.myRewards()"));
assert.ok(passport.includes("<PassportRewards stampCount={stampbook?.summary.collected ?? null}"));
assert.ok(passport.includes('window.location.hash === "#rewards"'));
assert.ok(passport.includes("const PAGE_SIZE = 6"));
assert.ok(passport.includes("STAMP_ROTATIONS"));
assert.ok(passport.includes("mix-blend-multiply"));
assert.ok(rewards.includes("준비 중"));
assert.ok(rewards.includes("<details"));
assert.ok(!rewards.includes("claimReward"));
assert.ok(myPassport.includes('href="/stampbook#rewards"'));
assert.ok(myPassport.includes("실물 배지 배송"));
assert.ok(badges.includes("api.claimReward("), "Preserve the independent badge-shipping workflow");
assert.ok(badges.includes("claimLock.current"), "Prevent duplicate shipping submissions");
assert.ok(badges.includes("디지털 배지 · 실물 배지 세트"));
console.log("PASS: passport benefit plans are separate from earned badges and shipping claims");
