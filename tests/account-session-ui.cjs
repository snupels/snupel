/* eslint-disable @typescript-eslint/no-require-imports -- Isolated account form lifecycle tests, no real accounts or requests. */
const assert = require("node:assert/strict");
const fs = require("node:fs");
const vm = require("node:vm");
const ts = require("typescript");

function transpile(file, exports, context) {
  vm.runInNewContext(ts.transpileModule(fs.readFileSync(file, "utf8"), {
    compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2020, jsx: ts.JsxEmit.ReactJSX },
  }).outputText, { exports, ...context });
}
const flow = {}, address = {};
transpile("lib/auth-flow.ts", flow, { require, URL, Date });
transpile("lib/accountAddress.ts", address, { require });
const flush = () => new Promise((resolve) => setImmediate(resolve));
function deferred() {
  let resolve, reject;
  const promise = new Promise((yes, no) => { resolve = yes; reject = no; });
  return { promise, resolve, reject };
}
function find(tree, predicate) {
  if (!tree || typeof tree !== "object") return undefined;
  if (Array.isArray(tree)) return tree.map((item) => find(item, predicate)).find(Boolean);
  if (predicate(tree)) return tree;
  return find(tree.props?.children, predicate);
}

function setup(component) {
  const profile = {
    id: 11, email: "first@example.invalid", nickname: "첫 사용자", phoneNumber: "01011112222",
    onboardingRequired: component === "OnboardingPage", marketingEmailAgreed: false, marketingSnsAgreed: false,
    postalCode: "24200", address: "강원특별자치도 춘천시 테스트길", addressDetail: "101호",
  };
  const state = [], refs = [], listeners = new Set(), paths = [], patches = [];
  const loading = deferred(), updating = deferred(), signing = deferred(), uploading = deferred();
  let current = profile, token = true, stateIndex = 0, refIndex = 0, effect, cleanup, writes = 0, fetches = 0;
  const router = { replace: (path) => paths.push(path), refresh() {} };
  const hooks = {
    useState(initial) {
      const index = stateIndex++;
      if (!(index in state)) state[index] = initial;
      return [state[index], (value) => { writes++; state[index] = typeof value === "function" ? value(state[index]) : value; }];
    },
    useRef(initial) { return refs[refIndex++] ??= { current: initial }; },
    useEffect(callback) { effect = callback; },
  };
  const api = {
    hasToken: () => token,
    currentUser: () => current,
    me: () => loading.promise,
    updateProfile: (input) => { patches.push(input); return updating.promise; },
    createProfileUploadUrl: () => signing.promise,
  };
  class FormDataStub {
    constructor(values = {}) { this.values = values; }
    get(key) { return this.values[key] ?? null; }
    append() {}
  }
  class FileReaderStub {
    readAsDataURL() { this.result = "data:image/png;base64,test"; this.onload?.(); }
  }
  const pageExports = {};
  transpile(`components/${component}.tsx`, pageExports, {
    require(name) {
      if (name === "react") return hooks;
      if (name === "next/navigation") return { useRouter: () => router, useSearchParams: () => new URLSearchParams("next=/missions/") };
      if (name === "@/lib/api/service") return { api };
      if (name === "@/lib/api/repository") return { ApiError: class ApiError extends Error {} };
      if (name === "@/lib/auth-flow") return flow;
      if (name === "@/lib/accountAddress") return address;
      if (name === "react/jsx-runtime") return require(name);
      return {};
    },
    window: { addEventListener: (_, fn) => listeners.add(fn), removeEventListener: (_, fn) => listeners.delete(fn) },
    FormData: FormDataStub, FileReader: FileReaderStub, URLSearchParams,
    fetch: () => { fetches++; return uploading.promise; },
  });
  const render = () => { stateIndex = 0; refIndex = 0; return pageExports[component](); };
  render(); cleanup = effect();
  const authChange = (next) => {
    current = next; token = Boolean(next);
    for (const listener of listeners) listener();
  };
  return {
    profile, state, paths, patches, loading, updating, signing, uploading, render,
    writes: () => writes, fetches: () => fetches,
    authChange, logout: () => authChange(undefined), unmount: () => cleanup(),
    async loaded() { loading.resolve(profile); await flush(); render(); },
    selectPhoto() {
      const input = find(render(), (node) => node.type === "input" && node.props.type === "file");
      input.props.onChange({ target: { files: [{ type: "image/png", size: 123 }] } });
    },
    submit() {
      const form = find(render(), (node) => node.type === "form");
      assert.ok(form, `${component}: form available`);
      return form.props.onSubmit({ preventDefault() {}, currentTarget: {
        nickname: "첫 사용자", phoneNumber: "01011112222", postalCode: "24200", address: "강원특별자치도 춘천시 테스트길", addressDetail: "101호",
      } });
    },
  };
}

async function check(component) {
  for (const interrupt of ["logout", "switch", "unmount"]) {
    const ui = setup(component);
    if (interrupt === "logout") ui.logout();
    else if (interrupt === "switch") ui.authChange({ ...ui.profile, id: 22 });
    else ui.unmount();
    const writes = ui.writes();
    ui.loading.resolve(ui.profile); await flush();
    assert.equal(ui.state[0], null, `${component}: late load after ${interrupt} cannot expose private form`);
    assert.equal(ui.writes(), writes, `${component}: no late load state updates after ${interrupt}`);
  }

  const own = setup(component); await own.loaded();
  own.authChange({ ...own.profile, nickname: "내 정보 갱신" });
  assert.equal(own.state[0]?.id, 11, `${component}: own profile updates preserve the form`);
  const saved = own.submit();
  assert.equal(own.patches.length, 1);
  assert.equal(own.patches[0].addressDetail, "101호");
  own.updating.resolve({ ...own.profile, onboardingRequired: false }); await saved;
  assert.equal(own.state[0]?.id, 11);
  own.unmount();

  for (const interrupt of ["logout", "switch", "unmount"]) {
    const ui = setup(component); await ui.loaded();
    const saving = ui.submit();
    assert.equal(ui.patches.length, 1);
    if (interrupt === "logout") ui.logout();
    else if (interrupt === "switch") ui.authChange({ ...ui.profile, id: 22 });
    else ui.unmount();
    const writes = ui.writes(), paths = ui.paths.length;
    ui.updating.resolve({ ...ui.profile, onboardingRequired: false }); await saving;
    assert.equal(ui.writes(), writes, `${component}: late save after ${interrupt} ignored`);
    assert.equal(ui.paths.length, paths, `${component}: late save after ${interrupt} cannot redirect`);
    if (interrupt !== "unmount") assert.equal(ui.state[0], null);
  }

  for (const phase of ["upload-url", "upload-body"]) {
    const ui = setup(component); await ui.loaded(); ui.selectPhoto();
    const saving = ui.submit();
    if (phase === "upload-body") {
      ui.signing.resolve({ uploadUrl: "https://upload.invalid/", objectKey: "private/test", fields: {} });
      await flush(); assert.equal(ui.fetches(), 1);
    }
    ui.logout(); ui.authChange({ ...ui.profile, id: 22 });
    if (phase === "upload-url") ui.signing.resolve({ uploadUrl: "https://upload.invalid/", objectKey: "private/test", fields: {} });
    else ui.uploading.resolve({ ok: true });
    await saving;
    assert.equal(ui.patches.length, 0, `${component}: never PATCH first account data under second account during ${phase}`);
    if (phase === "upload-url") assert.equal(ui.fetches(), 0);
    assert.equal(ui.state[0], null);
  }
}

(async () => {
  await check("AccountPage"); await check("OnboardingPage");
  console.log("PASS: account/onboarding private forms clear on auth changes and ignore late load/save/unmount/upload responses");
})().catch((error) => { console.error(error); process.exitCode = 1; });
