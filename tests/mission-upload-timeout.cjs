/* eslint-disable @typescript-eslint/no-require-imports -- Isolated upload failure check; no network or DB. */
const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');
const ts = require('typescript');
const { test } = require('node:test');
function findForm(tree) {
  if (!tree || typeof tree !== 'object') return;
  if (Array.isArray(tree)) return tree.map(findForm).find(Boolean);
  return tree.type === 'form' ? tree : findForm(tree.props?.children);
}
test('mission upload timeout unlocks retry and never submits incomplete evidence', async () => {
  const state = [{ title: 'test', representativeImageUrl: '/test.png' }, { stops: [{ stampId: 1 }] }, false, '', [{ type: 'image/png', size: 1 }], false, false, false, ''];
  const refs = [];
  let index = 0, refIndex = 0, uploads = 0, submissions = 0;
  const exports = {};
  const source = fs.readFileSync('components/MissionDetailPage.tsx', 'utf8') + '\nexport { MissionDetailContent };';
  vm.runInNewContext(ts.transpileModule(source, { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2020, jsx: ts.JsxEmit.ReactJSX } }).outputText, {
    exports,
    require(name) {
      if (name === 'react') return {
        useState() { const i = index++; return [state[i], value => { state[i] = value; }]; },
        useRef(value) { return refs[refIndex++] ??= { current: value }; },
        useMemo(fn) { return fn(); }, useEffect() {},
      };
      if (name === '@/lib/api/service') return { api: { hasToken: () => true, stampSubmissions: {
        createUploadUrl: async () => ({ uploadUrl: 'https://upload.invalid/', fields: {}, objectKey: 'test' }),
        create: async () => { submissions++; },
      } } };
      if (name === '@/lib/api/repository') return { ApiError: class extends Error {} };
      if (name === '@/lib/missionPhoto') return { missionPhotosError: () => null, MAX_MISSION_PHOTOS: 5 };
      if (name === '@/lib/missionCatalog') return { missionPresentation: () => ({ category: '수상', steps: [] }) };
      if (name === 'react/jsx-runtime') return require(name);
      return {};
    },
    URL: { createObjectURL: () => 'blob:test' },
    FormData: class { append() {} },
    AbortSignal: { timeout(ms) { assert.equal(ms, 120_000); return { timeout: ms }; } },
    fetch: async (_, options) => { assert.equal(options.signal?.timeout, 120_000); uploads++; throw new Error('Upload timeout'); },
  });
  const render = () => { index = 0; refIndex = 0; return exports.MissionDetailContent({ courseId: 1 }); };
  for (let attempt = 1; attempt <= 2; attempt++) {
    await findForm(render()).props.onSubmit({ preventDefault() {} });
    assert.equal(uploads, attempt, 'retry must reach upload again');
    assert.equal(submissions, 0, 'failed upload must not submit evidence');
    assert.equal(state[5], false, 'pending state clears');
    assert.equal(state[6], false, 'failed upload is not completed');
    assert.match(state[3], /다시 시도/);
  }
});
