/* eslint-disable @typescript-eslint/no-require-imports -- Isolated level threshold regression. */
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const vm = require("node:vm");
const ts = require("typescript");
const source = file => fs.readFileSync(path.join(__dirname, "..", file), "utf8");
const context = { exports: {} };
vm.runInNewContext(ts.transpileModule(source("lib/passportLevel.ts"), {
  compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2020 },
}).outputText, context);
const { PASSPORT_LEVELS, resolvePassportLevel, passportLevelLabel } = context.exports;
assert.deepEqual(Array.from(PASSPORT_LEVELS, item => item.minStamps), [0, 1, 5, 10, 20, 40]);
assert.deepEqual(Array.from(PASSPORT_LEVELS, item => item.name), ["Beginner", "Explorer", "Challenger", "Adventure Pro", "Champion", "Legend"]);
assert.deepEqual(Array.from(PASSPORT_LEVELS, item => item.criterion), ["가입", "스탬프 1개", "스탬프 5개", "스탬프 10개", "스탬프 20개", "스탬프 40개 이상"]);
for (const [count, level] of [[0, 1], [1, 2], [2, 2], [4, 2], [5, 3], [6, 3], [7, 3], [9, 3], [10, 4], [15, 4], [19, 4], [20, 5], [39, 5], [40, 6], [41, 6], [100, 6]]) {
  assert.equal(resolvePassportLevel(count).level, level, `${count} collected stamps must resolve Level ${level}`);
  assert.equal(passportLevelLabel(resolvePassportLevel(count)), `Level ${level} ${PASSPORT_LEVELS[level - 1].name}`);
}
assert.equal(resolvePassportLevel(0, true).level, 1, "mission completion alone must not promote a member without a collected stamp");
assert.equal(resolvePassportLevel(-1).level, 1);
for (const file of ["components/HomePage.tsx", "components/MyPassportPage.tsx"]) {
  assert.ok(source(file).includes("resolvePassportLevel(stampCount)"), `${file} uses the shared collected-stamp thresholds`);
  assert.ok(!/resolvePassportLevel\(stampCount,/.test(source(file)), "no independent mission-completion promotion");
  assert.ok(source(file).includes("summary.collected"), `${file} uses authoritative collected totals, not a paginated item count`);
}
assert.ok(source("components/MyPassportPage.tsx").includes("PASSPORT_LEVELS.map"), "level guide shares the calculation catalog");
assert.ok(!source("components/MyPassportPage.tsx").includes("승인된 첫 미션과"), "guide no longer describes a separate first-mission promotion");
assert.ok(source("components/MyPassportPage.tsx").includes("stampbook && item.level === level.level &&"), "failed stamp loading does not label Beginner as current rank");
console.log("PASS: passport levels use collected stamp thresholds 0/1/5/10/20/40 across home, passport and guidance");
