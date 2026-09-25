/* eslint-disable @typescript-eslint/no-require-imports -- Local session tests, no network. */
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const vm = require("node:vm");
const ts = require("typescript");
const { test } = require("node:test");

function fixture() {
  const user = { id: 1, email: "test@example.com", onboardingRequired: true };
  const store = new Map([["sportspassport-access-token", "pending-token"], ["sportspassport-auth-user", JSON.stringify(user)]]);
  const calls = [], events = [], cache = {};
  let resolve, reject;
  const response = new Promise((yes, no) => { resolve = yes; reject = no; });
  function load(relative) {
    const file = path.resolve(__dirname, relative);
    if (cache[file]) return cache[file];
    const exports = cache[file] = {};
    const localRequire = name => {
      if (name === "./repository") return { request: async (url, options) => { calls.push({ url, ...options }); return options.schema.parse(await response); } };
      if (name.startsWith(".")) return load(path.relative(__dirname, path.resolve(path.dirname(file), name + ".ts")));
      return require(name);
    };
    vm.runInNewContext(ts.transpileModule(fs.readFileSync(file, "utf8"), { compilerOptions: { module: ts.ModuleKind.CommonJS } }).outputText,
      { exports, require: localRequire, URL, URLSearchParams, Event: class { constructor(type) { this.type = type; } },
        window: { dispatchEvent: event => events.push(event.type) },
        sessionStorage: { getItem: key => store.get(key), setItem: (key, value) => store.set(key, value), removeItem: key => store.delete(key) } });
    return exports;
  }
  return { api: load("../lib/api/service.ts").api, store, calls, events, resolve, reject,
    result: { accessToken: "completed-token", tokenType: "Bearer", expiresIn: 60, user: { ...user, onboardingRequired: false } } };
}

test("only server-confirmed onboarding completion replaces the restricted token", async () => {
  const f = fixture();
  const pending = f.api.completeOnboarding();
  assert.equal(f.calls[0].url, "/auth/complete-onboarding");
  assert.equal(f.calls[0].token, "pending-token");
  assert.equal(f.calls[0].method, "POST");
  assert.equal(f.store.get("sportspassport-access-token"), "pending-token");
  f.resolve(f.result); await pending;
  assert.equal(f.store.get("sportspassport-access-token"), "completed-token");
  assert.equal(JSON.parse(f.store.get("sportspassport-auth-user")).onboardingRequired, false);
  assert.equal(f.events[0], "sportspassport-auth-change");
});

test("logout or account switch during completion cannot restore the old account", async () => {
  for (const changed of ["", "different-account-token"]) {
    const f = fixture();
    const pending = f.api.completeOnboarding();
    f.store.set("sportspassport-access-token", changed);
    f.resolve(f.result);
    await assert.rejects(pending, /session changed/);
    assert.equal(f.store.get("sportspassport-access-token"), changed);
    assert.equal(f.events.length, 0);
  }
});

test("failed completion cannot issue a member token", async () => {
  const f = fixture();
  const pending = f.api.completeOnboarding();
  f.reject(new Error("onboarding_required"));
  await assert.rejects(pending, /onboarding_required/);
  assert.equal(f.store.get("sportspassport-access-token"), "pending-token");
});
