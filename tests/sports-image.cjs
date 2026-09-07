/* eslint-disable @typescript-eslint/no-require-imports -- Standalone CommonJS regression test. */
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const ts = require('typescript');
const root = path.resolve(__dirname, '..');
function load(relative) {
  const source = fs.readFileSync(path.join(root, relative), 'utf8');
  const { outputText } = ts.transpileModule(source, { compilerOptions: { module: ts.ModuleKind.CommonJS } });
  const exports = {};
  vm.runInNewContext(outputText, { exports, require(id) {
    if (id === '@/lib/verifiedSportsPhotos') return load('lib/verifiedSportsPhotos.ts');
    if (id.endsWith('gangneung-olympic-museum.jpg')) return { default: { src: '/museum-real.jpg' } };
    throw new Error(`Unexpected dependency: ${id}`);
  } });
  return exports;
}
const { sportsImage, sportsPhotoSource } = load('lib/sportsImage.ts');
const { verifiedSportsPhotos } = load('lib/verifiedSportsPhotos.ts');
const activity = (placeName, representativeImageUrl = null, metadata = {}) => ({ placeName, representativeImageUrl, metadata, sportName: 'ski' });
const api = 'https://tong.visitkorea.or.kr/cms/resource/test.jpg';
assert.equal(sportsImage(activity('용평스키장', api)), api, 'API photo must win over overrides');
assert.equal(sportsImage(activity('레일바이크', api, { contenttypeid: 28 })), api);
assert.equal(sportsImage(activity('기념관', api, { contenttypeid: 14 })), api);
for (const photo of verifiedSportsPhotos) {
  assert.equal(sportsImage(activity(photo.placeName)), `/sports-real/${photo.file}`);
  assert.ok(fs.statSync(path.join(root, 'public/sports-real', photo.file)).size > 10000);
  assert.equal(sportsPhotoSource(activity(photo.placeName)).url, photo.sourcePage);
  assert.equal(sportsPhotoSource(activity(photo.placeName, api)), null);
}
assert.equal(sportsImage(activity('용평스키장 옆 대여점')), '/sports-real/photo-pending.svg', 'Do not match nearby businesses');
assert.equal(sportsImage(activity('사진 없는 시설')), '/sports-real/photo-pending.svg');
assert.equal(sportsImage(activity('강릉올림픽뮤지엄')).src, '/museum-real.jpg');
console.log(`PASS: real API priority, ${verifiedSportsPhotos.length} exact venue photos, museum photo and neutral fallback`);
