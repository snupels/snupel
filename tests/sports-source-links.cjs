/* eslint-disable @typescript-eslint/no-require-imports -- Standalone CommonJS regression test. */
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const ts = require('typescript');
const source = fs.readFileSync(path.join(__dirname, '../components/SportsDetailPage.tsx'), 'utf8');
const helpers = source.slice(source.indexOf('function isReferenceSource('), source.indexOf('function DetailLoading('));
const { outputText } = ts.transpileModule(helpers + '\nexports.reference = isReferenceSource; exports.official = isOfficialFacilityWebsite;', {});
const result = {};
vm.runInNewContext(outputText, { exports: result, URL });
for (const url of ['https://www.data.go.kr/data/3045471/fileData.do', 'http://data.go.kr/data/3045451/fileData.do', 'https://api.data.go.kr/course.zip']) {
  assert.equal(result.reference(url), false);
  assert.equal(result.official(url), false);
}
assert.equal(result.reference('https://www.durunubi.kr/course/1'), true);
assert.equal(result.reference('https://example.com/course.gpx'), true);
assert.equal(result.official('https://www.surfyy.com/'), true);
assert.ok(!source.includes('공공데이터 원문'));
console.log('PASS: public dataset links hidden; official websites and course resources preserved');
