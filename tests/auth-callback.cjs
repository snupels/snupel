/* eslint-disable @typescript-eslint/no-require-imports -- Isolated hook lifecycle regression, no provider requests. */
const assert = require("node:assert/strict");
const fs = require("node:fs");
const vm = require("node:vm");
const ts = require("typescript");
const transpile = (path, exports, dependencies) => vm.runInNewContext(ts.transpileModule(fs.readFileSync(path, "utf8"), {
  compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2020, jsx: ts.JsxEmit.ReactJSX },
}).outputText, { exports, ...dependencies });
const flow = {};
transpile("lib/auth-flow.ts", flow, { require, URL, Date });

async function checkCallback(query, saved, failure) {
  const state = [], refs = [], timers = new Map(), store = new Map();
  const routerPaths = [], rewrittenUrls = [];
  let stateIndex = 0, refIndex = 0, timerId = 0, effect, calls = 0;
  if (saved !== null) store.set(flow.OAUTH_SESSION_KEY, saved);
  const hooks = {
    useState(initial) {
      const index = stateIndex++;
      if (!(index in state)) state[index] = initial;
      return [state[index], (value) => { state[index] = value; }];
    },
    useRef(initial) { const index = refIndex++; return refs[index] ??= { current: initial }; },
    useEffect(callback) { effect = callback; },
  };
  const page = {};
  transpile("components/LoginPage.tsx", page, {
    require(name) {
      if (name === "react") return hooks;
      if (name === "next/navigation") return { useRouter: () => ({ replace: (url) => routerPaths.push(url) }), useSearchParams: () => new URLSearchParams(query) };
      if (name === "@/lib/auth-flow") return flow;
      if (name === "@/lib/api/service") return { api: { oauthLogin() { calls++; return failure ? Promise.reject(failure) : Promise.resolve({ user: { onboardingRequired: false } }); } } };
      if (name === "react/jsx-runtime") return require(name);
      return {};
    },
    setTimeout(callback) { timers.set(++timerId, callback); return timerId; },
    clearTimeout(id) { timers.delete(id); },
    sessionStorage: { getItem: (key) => store.get(key) ?? null, removeItem: (key) => store.delete(key) },
    location: { origin: "https://sportspassport.kr" },
    history: { state: {}, replaceState: (value, title, url) => rewrittenUrls.push(url) },
    URL, Date,
  });
  page.LoginPage();
  // React StrictMode's setup → cleanup → setup: session must survive cleanup.
  const cleanup = effect();
  cleanup();
  assert.equal(store.get(flow.OAUTH_SESSION_KEY) ?? null, saved);
  effect();
  for (const timer of timers.values()) timer();
  timers.clear();
  // Replay before the exchange resolves must not submit the one-use code again.
  effect();
  for (const timer of timers.values()) timer();
  await new Promise((resolve) => setImmediate(resolve));
  assert.equal(store.has(flow.OAUTH_SESSION_KEY), false);
  assert.equal(state[1], false, "processing state must recover after success/error");
  assert.ok(rewrittenUrls.every((url) => !url.includes("code=") && !url.includes("state=")));
  return { calls, error: state[2], routerPaths };
}

async function main() {
  const saved = JSON.stringify({ provider: "kakao", redirectUri: "https://sportspassport.kr/login/", next: "/missions/?id=12", createdAt: Date.now() });
  const success = await checkCallback("code=single-use&state=random", saved);
  assert.equal(success.calls, 1);
  assert.deepEqual(success.routerPaths, ["/missions/?id=12"]);
  const failed = await checkCallback("code=single-use&state=random", saved, { status: 400, body: { error: "invalid_oauth_state" } });
  assert.equal(failed.calls, 1);
  assert.ok(failed.error.includes("만료"));
  const cancelled = await checkCallback("error=access_denied&state=random", saved);
  assert.equal(cancelled.calls, 0);
  assert.ok(cancelled.error.includes("취소"));
  const corrupted = await checkCallback("code=single-use&state=random", "not-json");
  assert.equal(corrupted.calls, 0);
  assert.ok(corrupted.error.includes("다시 시작"));
  console.log("PASS: OAuth StrictMode replay, one-use exchange, URL cleanup, session consumption and failure recovery");
}
main().catch((error) => { console.error(error); process.exitCode = 1; });
