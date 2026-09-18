/* eslint-disable @typescript-eslint/no-require-imports -- UI regression checks. */
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const source = fs.readFileSync(path.join(__dirname, '../components/MissionDetailPage.tsx'), 'utf8');
assert.ok(source.indexOf('사진은 1~5장') < source.indexOf('!api.hasToken() ?'));
assert.match(source, /공개하지 않아도 미션 인증을 신청할 수 있어요/);
assert.match(source, /운영자 승인 후 사진과 작성한 글/);
assert.match(source, /사진 선택하기 · 최대 5장/);
assert.match(source, /사진 추가하기/);
assert.match(source, /2\. 스포츠 피드 공개 여부 선택/);
assert.match(source, /useState\(false\)/);
assert.match(source, /type="file" multiple/);
assert.match(source, /checked=\{shareToFeed\}/);
