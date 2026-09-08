/* eslint-disable @typescript-eslint/no-require-imports -- Isolated form tests with fake data and no network. */
const assert = require("node:assert/strict");
const fs = require("node:fs");
const vm = require("node:vm");
const ts = require("typescript");

function compile(file, imports, context = {}) {
  const exports = {};
  const result = ts.transpileModule(fs.readFileSync(file, "utf8"), {
    compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2020, jsx: ts.JsxEmit.ReactJSX },
    reportDiagnostics: true,
  });
  assert.equal(result.diagnostics?.length ?? 0, 0, `${file}: valid TSX syntax`);
  vm.runInNewContext(result.outputText, { exports, require: imports, URL, URLSearchParams, Date, ...context });
  return exports;
}
const dto = compile("lib/api/dto.ts", require);
const flow = compile("lib/auth-flow.ts", require);
const address = compile("lib/accountAddress.ts", require);
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
function all(tree, predicate) {
  if (!tree || typeof tree !== "object") return [];
  if (Array.isArray(tree)) return tree.flatMap((item) => all(item, predicate));
  return [...(predicate(tree) ? [tree] : []), ...all(tree.props?.children, predicate)];
}
const normalized = (value) => JSON.parse(JSON.stringify(value));
function setup(name, api = {}, props, query = "") {
  const state = [], refs = [], effects = [], paths = [], cleanups = [];
  let stateIndex = 0, refIndex = 0, mounted = false, writes = 0;
  const hooks = {
    useState(initial) {
      const index = stateIndex++;
      if (!(index in state)) state[index] = typeof initial === "function" ? initial() : initial;
      return [state[index], (value) => { writes++; state[index] = typeof value === "function" ? value(state[index]) : value; }];
    },
    useRef(initial) { return refs[refIndex++] ??= { current: initial }; },
    useEffect(effect) { if (!mounted) effects.push(effect); },
  };
  class FormDataStub {
    constructor(values = {}) { this.values = values; }
    get(key) { return this.values[key] ?? null; }
    append() {}
  }
  const stubs = new Map();
  const router = { replace: (path) => paths.push(path), refresh() {} };
  const page = compile(`components/${name}.tsx`, (request) => {
    if (request === "react") return hooks;
    if (request === "react/jsx-runtime") return require(request);
    if (request === "next/navigation") return { useRouter: () => router, useSearchParams: () => new URLSearchParams(query) };
    if (request === "@/lib/api/service") return { api };
    if (request === "@/lib/api/dto") return dto;
    if (request === "@/lib/auth-flow") return flow;
    if (request === "@/lib/accountAddress") return address;
    if (request === "@/lib/api/repository") return { ApiError: class ApiError extends Error {} };
    if (!stubs.has(request)) stubs.set(request, new Proxy({}, { get: (_, property) => property }));
    return stubs.get(request);
  }, { FormData: FormDataStub, window: { addEventListener() {}, removeEventListener() {} }, setTimeout, clearTimeout });
  const render = () => { stateIndex = 0; refIndex = 0; return page[name](props); };
  render(); for (const effect of effects) cleanups.push(effect()); mounted = true;
  return {
    state, paths, render, writes: () => writes,
    unmount() { for (const cleanup of cleanups) cleanup?.(); },
    input(inputName) { return find(render(), (node) => node.type === "input" && node.props.name === inputName); },
    button(text) { return find(render(), (node) => node.type === "button" && node.props.children === text); },
    username() { return find(render(), (node) => node.props?.onVerifiedChange); },
    submit(values) { return find(render(), (node) => node.type === "form").props.onSubmit({ preventDefault() {}, currentTarget: values }); },
  };
}

async function usernameChecks() {
  const requests = [], verified = [];
  const ui = setup("UsernameField", { checkUsername(username) { const task = deferred(); requests.push({ username, ...task }); return task.promise; } }, { idPrefix: "test", onVerifiedChange: (value) => verified.push(value) });
  const change = (value) => ui.input("username").props.onChange({ target: { value } });
  change(" AbCD_123 ");
  assert.equal(ui.input("username").props.value, "abcd_123");
  ui.button("중복 확인").props.onClick();
  change("next_user");
  assert.equal(verified.at(-1), null, "input changes invalidate previous verification immediately");
  ui.button("중복 확인").props.onClick();
  requests[1].resolve({ username: "next_user", available: true }); await flush();
  assert.equal(verified.at(-1), "next_user");
  requests[0].resolve({ username: "abcd_123", available: true }); await flush();
  assert.equal(verified.at(-1), "next_user", "old out-of-order availability response ignored");
  change("taken_user"); ui.button("중복 확인").props.onClick();
  requests[2].resolve({ username: "taken_user", available: false }); await flush();
  assert.equal(verified.at(-1), null); assert.equal(ui.input("username").props["aria-invalid"], true);
  change("Kabc");
  assert.equal(ui.button("중복 확인").props.disabled, true, "non-ASCII Kelvin symbol cannot normalize into a valid username");
  change("error_user"); ui.button("중복 확인").props.onClick();
  requests[3].reject(new Error("offline")); await flush();
  assert.equal(ui.button("중복 확인").props.disabled, false, "failed checks can retry");
  ui.button("중복 확인").props.onClick(); ui.unmount();
  const writes = ui.writes(), results = verified.length;
  requests[4].resolve({ username: "error_user", available: true }); await flush();
  assert.equal(ui.writes(), writes); assert.equal(verified.length, results, "unmounted check cannot restore verified state");
}

async function loginAndSignup() {
  const logins = [], signups = [], login = deferred(), signup = deferred();
  const api = { login: (input) => { logins.push(input); return login.promise; }, signup: (input) => { signups.push(input); return signup.promise; }, currentUser: () => ({ id: 1, onboardingRequired: false }), hasToken: () => false };
  const ui = setup("LoginPage", api);
  assert.equal(ui.input("identifier").props.type, "text", "login accepts username as well as legacy email");
  const submitting = ui.submit({ identifier: " existing@example.invalid ", password: "test-password" });
  ui.submit({ identifier: "ignored", password: "test-password" });
  assert.equal(logins.length, 1, "login suppresses duplicate submission");
  assert.deepEqual(normalized(logins[0]), { identifier: "existing@example.invalid", password: "test-password" });
  assert.equal(ui.button("회원가입").props.disabled, true);
  login.resolve({ user: { id: 1 } }); await submitting;
  ui.button("회원가입").props.onClick();
  const values = { username: "new_user", email: "new@example.invalid", password: "test-password", nickname: "테스트", phoneNumber: "01011112222", postalCode: "24200", address: "테스트 주소", addressDetail: "101호" };
  await ui.submit(values); assert.equal(signups.length, 0, "signup requires explicit availability confirmation");
  ui.username().props.onVerifiedChange("different_user");
  await ui.submit(values); assert.equal(signups.length, 0, "check must match submitted username");
  ui.username().props.onVerifiedChange("new_user");
  const joining = ui.submit(values); ui.submit(values);
  assert.equal(signups.length, 1); assert.equal(signups[0].username, "new_user");
  assert.equal(signups[0].addressDetail, "101호", "address remains connected");
  signup.resolve({ user: { id: 1, onboardingRequired: false } }); await joining;
  ui.unmount();
}

async function profileUsername() {
  for (const component of ["AccountPage", "OnboardingPage"]) {
    for (const existing of [null, "existing_user"]) {
      const profile = { id: 11, username: existing, email: "old@example.invalid", nickname: "테스트", phoneNumber: "01011112222", onboardingRequired: component === "OnboardingPage", marketingEmailAgreed: false, marketingSnsAgreed: false };
      const patches = [];
      const ui = setup(component, { hasToken: () => true, currentUser: () => profile, me: async () => profile, updateProfile: async (input) => { patches.push(input); return { ...profile, ...input, onboardingRequired: false }; } });
      await flush();
      const values = { nickname: "테스트", phoneNumber: "01011112222" };
      if (existing) {
        await ui.submit({ ...values, username: "other_user" });
        assert.equal(patches.length, 1); assert.equal("username" in patches[0], false, `${component}: existing username is never patched`);
        assert.equal(ui.username(), undefined);
      } else {
        if (component === "AccountPage") {
          assert.equal(ui.username().props.required, false);
          await ui.submit(values); assert.equal(patches.length, 1); assert.equal("username" in patches[0], false, "legacy account may skip username setup");
        } else {
          await ui.submit(values); assert.equal(patches.length, 0, "social onboarding requires a checked username");
        }
        const before = patches.length;
        await ui.submit({ ...values, username: "new_user" }); assert.equal(patches.length, before);
        ui.username().props.onVerifiedChange("new_user");
        await ui.submit({ ...values, username: "new_user" });
        assert.equal(patches.at(-1).username, "new_user");
      }
      ui.unmount();
    }
  }
}

async function resetPair() {
  const requests = [], confirms = [], reminders = [];
  let requesting = deferred(), confirming = deferred();
  const api = { requestPasswordReset: (input) => { requests.push(input); return requesting.promise; }, confirmPasswordReset: (input) => { confirms.push(input); return confirming.promise; }, accountReminder: async (email) => { reminders.push(email); } };
  const ui = setup("AccountHelpPage", api);
  const sending = ui.submit({ username: " first_user ", email: " first@example.invalid " });
  ui.submit({ username: "second_user", email: "second@example.invalid" });
  ui.button("아이디 찾기").props.onClick();
  assert.equal(requests.length, 1); assert.equal(ui.state[0], "password", "pending request cannot switch modes");
  assert.equal(ui.button("아이디 찾기").props.disabled, true);
  requesting.resolve({ message: "accepted" }); await sending;
  assert.ok(ui.input("code"));
  await ui.submit({ code: "123456", password: "test-password", passwordConfirm: "mismatch" });
  assert.equal(confirms.length, 0);
  const values = { code: "123456", password: "test-password", passwordConfirm: "test-password", username: "not_the_user", email: "not@example.invalid" };
  const saving = ui.submit(values); ui.submit(values);
  assert.equal(confirms.length, 1, "confirmation suppresses duplicate submission");
  assert.deepEqual(normalized(confirms[0]), { username: "first_user", email: "first@example.invalid", code: "123456", newPassword: "test-password" }, "confirmation uses the original request pair, not editable DOM values");
  confirming.reject(new Error("expired")); await saving;
  ui.button("입력 정보 수정·인증번호 다시 받기").props.onClick();
  assert.equal(ui.input("code"), undefined, "restart removes old verification input");
  requesting = deferred(); confirming = deferred();
  const legacy = ui.submit({ username: "legacy@example.invalid", email: "legacy@example.invalid" });
  requesting.resolve({ message: "accepted" }); await legacy;
  const confirmLegacy = ui.submit(values);
  assert.equal(confirms.at(-1).username, "legacy@example.invalid", "legacy email identifier supported");
  confirming.resolve({ message: "changed" }); await confirmLegacy;
  ui.button("아이디 찾기").props.onClick();
  assert.equal(ui.input("username"), undefined, "ID reminder asks only email");
  await ui.submit({ email: "reminder@example.invalid" });
  assert.deepEqual(reminders, ["reminder@example.invalid"]);
  const status = all(ui.render(), (node) => node.props?.role === "status");
  assert.ok(status.some((node) => String(node.props.children).includes("가입 정보가 일치하면")), "UI never promises delivery or account existence");
  ui.unmount();
  const later = deferred();
  const abandoned = setup("AccountHelpPage", { requestPasswordReset: () => later.promise });
  const pending = abandoned.submit({ username: "unused_user", email: "unused@example.invalid" });
  abandoned.unmount(); const writes = abandoned.writes();
  later.resolve({ message: "accepted" }); await pending;
  assert.equal(abandoned.writes(), writes, "late reset responses after unmount ignored");
}

(async () => {
  await usernameChecks(); await loginAndSignup(); await profileUsername(); await resetPair();
  console.log("PASS: username availability races, checked signup/profile assignment, legacy login and paired password reset UI");
})().catch((error) => { console.error(error); process.exitCode = 1; });
