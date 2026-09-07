/* eslint-disable @typescript-eslint/no-require-imports -- Standalone CommonJS regression test. */
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const ts = require('typescript');
const source = fs.readFileSync(path.join(__dirname, '../lib/sportsWebsites.ts'), 'utf8');
const { outputText } = ts.transpileModule(source, { compilerOptions: { module: ts.ModuleKind.CommonJS } });
const result = {};
vm.runInNewContext(outputText, { exports: result, URL });
for (const site of result.verifiedSportsWebsites) {
  const activity = { id: site.id, placeName: site.name, sourceUrl: 'https://www.data.go.kr/data/3045471/fileData.do' };
  assert.equal(result.verifiedSportWebsite(activity), site.url);
  assert.equal(result.verifiedSportWebsite({ ...activity, placeName: site.name + ' 옆 대여점' }), null);
  assert.equal(result.verifiedSportWebsite({ ...activity, sourceUrl: 'https://existing-operator.example/' }), null);
  assert.equal(result.verifiedSportWebsite({ ...activity, sourceUrl: null }), null);
  assert.equal(new URL(site.url).protocol, 'https:');
}
assert.equal(result.verifiedSportWebsite({ id: 99999, placeName: '미확인 업체', sourceUrl: 'https://www.data.go.kr/' }), null);
assert.equal(new Set(result.verifiedSportsWebsites.map(s => s.id)).size, result.verifiedSportsWebsites.length);
console.log(`PASS: ${result.verifiedSportsWebsites.length} exact matches, unknown venues and existing websites unchanged`);
