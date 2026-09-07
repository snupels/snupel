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
console.log('PASS: hiking overrides walking-name heuristic; walking routes unchanged');
