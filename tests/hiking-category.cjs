/* eslint-disable @typescript-eslint/no-require-imports -- Standalone regression test. */
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const ts = require('typescript');
const source = fs.readFileSync(path.join(__dirname, '../components/PortalPage.tsx'), 'utf8');
const category = source.slice(source.indexOf('function sportCategory('), source.indexOf('function sportCategories('));
const { outputText } = ts.transpileModule(category, {});
const context = { isGeneralSportsFacility: () => false };
vm.runInNewContext(outputText, context);
assert.equal(context.sportCategory('hiking', '오대산 비로봉 등산로'), '산악스포츠');
assert.equal(context.sportCategory('hiking', '정상 탐방로'), '산악스포츠');
assert.equal(context.sportCategory('walking', '산소길'), '육상스포츠');
assert.equal(context.sportCategory('trekking', '선재길'), '육상스포츠');
assert.equal(context.sportCategory('zipwire', '짚와이어'), '산악스포츠');
for (const title of ['태백산 국립공원', '설악산 흘림골', '함백산', '응봉']) {
  assert.equal(context.sportCategory('hiking', title), '산악스포츠');
}
const facilities = {};
vm.runInNewContext(ts.transpileModule(fs.readFileSync(path.join(__dirname, '../lib/sportsFacility.ts'), 'utf8'), { compilerOptions: { module: ts.ModuleKind.CommonJS } }).outputText, { exports: facilities });
assert.equal(facilities.sportsFacilityType({ placeName: '태백산 국립공원', metadata: { facility_type: '산·산행 탐방지' } }), '산·산행 탐방지');
assert.equal(facilities.sportsFacilityType({ placeName: '오대산국립공원', metadata: { facility_type: '등산로 안내가 있는 산·국립공원' } }), '등산로 안내가 있는 산·국립공원');
const detail = fs.readFileSync(path.join(__dirname, '../components/SportsDetailPage.tsx'), 'utf8');
assert.ok(detail.includes('activity.sportName === "hiking" && !description.trails.length'));
assert.ok(detail.includes('지도는 API의 대표 위치'));
console.log('PASS: hiking overrides walking-name heuristic; walking routes unchanged');
