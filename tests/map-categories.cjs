/* eslint-disable @typescript-eslint/no-require-imports -- Regression checks. */
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const ts = require('typescript');
const vm = require('node:vm');
function load(name) {
  const exports = {};
  vm.runInNewContext(ts.transpileModule(fs.readFileSync(path.join(__dirname, '../lib', name + '.ts'), 'utf8'), { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2020 } }).outputText, { exports, require: name => load(name.replace('./', '')) });
  return exports;
}
const { sportCategories } = load('sportsCategories');
assert.deepEqual(Array.from(sportCategories('ski', { sport_categories: ['snow', 'olympic_legacy'] }, '알펜시아')), ['동계스포츠', '올림픽레거시']);
assert.equal(sportCategories('marine', null, '서핑장')[0], '수상스포츠');
assert.equal(sportCategories('hiking', null, '등산로')[0], '산악스포츠');
assert.equal(sportCategories(null, null, '강릉볼링장')[0], '스포츠');
for (const metadata of [null, { sport_categories: ['snow', 'olympic_legacy'] }, { sport_categories: ['olympic_legacy'] }]) {
  assert.deepEqual(Array.from(sportCategories('olympic_legacy', metadata, '알펜시아 리조트 알파인코스터')), ['산악스포츠']);
  assert.deepEqual(Array.from(sportCategories('olympic_legacy', metadata, '알펜시아 눈썰매장')), ['동계스포츠']);
}
assert.deepEqual(Array.from(sportCategories('ski', { sport_categories: ['snow', 'olympic_legacy'] }, '알펜시아리조트스키장')), ['동계스포츠', '올림픽레거시']);
assert.deepEqual(Array.from(sportCategories('olympic_legacy', { sport_categories: ['olympic_legacy'] }, '강릉올림픽뮤지엄')), ['올림픽레거시']);
const map = fs.readFileSync(path.join(__dirname, '../components/SportsMapPage.tsx'), 'utf8');
assert.match(map, /selectedCategories\.length === 0 \|\| sportCategories/);
assert.match(map, /\[activities, selectedRegion, selectedCategories\]/);
assert.match(map, /aria-pressed=\{active\}/);
assert.match(map, /infoWindowsRef\.current\.forEach\(info => info\.close\(\)\)/);
assert.match(map, /필터 초기화/);
