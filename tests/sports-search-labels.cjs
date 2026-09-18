/* eslint-disable @typescript-eslint/no-require-imports -- Standalone regression tests. */
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const ts = require('typescript');
function load(name) {
  const exports = {};
  const code = fs.readFileSync(path.join(__dirname, '../lib', name + '.ts'), 'utf8');
  vm.runInNewContext(ts.transpileModule(code, { compilerOptions: { module: ts.ModuleKind.CommonJS } }).outputText,
    { exports, require: (file) => load(file.replace('./', '')) });
  return exports;
}
const { sportsSearchText, matchesSportsKeyword } = load('sportsSearch');
const { sportDisplayName, sourceDisplayName } = load('sportsLabels');
const record = { summary: '오색의 탐방지', sportName: 'hiking', metadata: {
  hiking_routes: [{ infoname: '설악산 탐방로', infotext: '흘림골<br>등선대 → 용소폭포' }, null, {}, { infotext: 4 }],
  internal_id: '검색되면안됨',
} };
const before = JSON.stringify(record);
const text = sportsSearchText(record);
for (const keyword of ['설악산', '흘림골', '용소 폭포', '등산']) assert.ok(matchesSportsKeyword(text, keyword));
assert.ok(!matchesSportsKeyword(text, '치악산'));
assert.ok(!matchesSportsKeyword(text, '검색되면안됨'));
assert.ok(matchesSportsKeyword('SUP 체험', 'sup'));
assert.ok(matchesSportsKeyword('', '  '));
assert.equal(JSON.stringify(record), before);
assert.ok(matchesSportsKeyword(sportsSearchText({ placeName: '대승령과 대승폭포', sigun: '인제군' }), '설악산'));
assert.ok(!matchesSportsKeyword(sportsSearchText({ placeName: '대승폭포 카페', sigun: '서울' }), '설악산'));
assert.equal(sportDisplayName('hiking'), '등산');
assert.equal(sourceDisplayName('tourapi'), '한국관광공사');
assert.equal(sourceDisplayName('durunubi'), '한국관광공사 두루누비');
assert.equal(sportDisplayName('볼링'), '볼링');
assert.equal(sportDisplayName('unknown_code'), '스포츠');
assert.equal(sourceDisplayName('unknown_code'), '제공기관 정보 미확인');
assert.doesNotThrow(() => sportsSearchText({ metadata: { hiking_routes: 'bad' } }));
