/* eslint-disable @typescript-eslint/no-require-imports -- Native dialog lifecycle without network. */
const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');
const ts = require('typescript');
const { test } = require('node:test');
test('consent dialog opens natively, cancels without consent, and restores scroll', () => {
  const exports = {};
  let effect, opened = 0, closed = 0, dismissed = 0, restored = 0;
  const element = { showModal() { opened++; }, close() { closed++; } };
  const body = { style: { overflow: 'auto' } };
  vm.runInNewContext(ts.transpileModule(fs.readFileSync('components/ConsentDocumentModal.tsx', 'utf8'), {
    compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2020, jsx: ts.JsxEmit.ReactJSX },
  }).outputText, { exports, window: { document: { body, activeElement: { focus() { restored++; } } } }, require(name) {
    if (name === 'react') return { useRef: () => ({ current: element }), useEffect: fn => { effect = fn; } };
    return require(name);
  } });
  const tree = exports.ConsentDocumentModal({ document: 'service', onClose() { dismissed++; } });
  assert.equal(tree.type, 'dialog');
  const cleanup = effect();
  assert.equal(opened, 1);
  assert.equal(body.style.overflow, 'hidden');
  let prevented = false;
  tree.props.onCancel({ preventDefault() { prevented = true; } });
  assert.equal(prevented, true);
  assert.equal(dismissed, 1);
  cleanup();
  assert.equal(closed, 1);
  assert.equal(restored, 1);
  assert.equal(body.style.overflow, 'auto');
  assert.equal(exports.ConsentDocumentModal({ document: null, onClose() {} }), null);
  assert.equal(effect(), undefined);
  assert.equal(opened, 1);
});
