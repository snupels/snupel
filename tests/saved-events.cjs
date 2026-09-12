/* eslint-disable @typescript-eslint/no-require-imports -- Isolated saved event UI and service tests. */
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const vm = require("node:vm");
const ts = require("typescript");
const React = require("react");
const { renderToStaticMarkup } = require("react-dom/server");
const read = file => fs.readFileSync(path.join(__dirname, "..", file), "utf8");
function load(file, imports = require, extra = {}, append = "") {
  const output = ts.transpileModule(read(file), { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2020, jsx: ts.JsxEmit.ReactJSX }, reportDiagnostics: true });
  assert.equal(output.diagnostics?.length ?? 0, 0);
  const context = { exports: {}, require: imports, URL, URLSearchParams, ...extra };
  vm.runInNewContext(output.outputText + append, context);
  return context.exports;
}
const dto = load("lib/api/dto.ts"), helpers = load("lib/savedEvents.ts"), history = load("lib/activityHistory.ts"), flow = load("lib/auth-flow.ts"), address = load("lib/accountAddress.ts");
const event = id => ({ id, activityId: id + 100, createdAt: "2026-09-09T01:00:00Z", activity: { id: id + 100, category: "event", placeName: `테스트 행사 ${id}`, startsAt: "2026-10-01T00:00:00", endsAt: "2026-10-03T00:00:00", sigun: "홍천군", representativeImageUrl: null } });
assert.equal(helpers.isSavedEvent(event(1)), true);
assert.equal(helpers.isSavedEvent({ ...event(1), activity: { category: "festival" } }), true);
assert.equal(helpers.isSavedEvent({ ...event(1), activity: { category: "sports" } }), false);
assert.equal(helpers.savedEventHref(event(7)), "/events/detail/?id=107");
assert.equal(helpers.savedEventPeriod(event(1)), "2026.10.01 ~ 2026.10.03");
assert.equal(helpers.savedEventPeriod({ ...event(1), activity: {} }), "행사 일정은 상세페이지에서 확인하세요.");
assert.equal(history.isMissionHistory({ type: "saved", status: "collected" }), false);
assert.equal(history.isMissionHistory({ type: "submission", status: "approved" }), true);
assert.equal(history.isMissionHistory({ type: "stamp", status: "collected" }), true);
assert.equal(history.ACTIVITY_HISTORY_STATUS.collected.label, "스탬프 획득");

const dependencies = (api, hooks = React) => name => {
  if (name === "react") return hooks;
  if (name === "@/lib/api/service") return { api };
  if (name === "@/lib/auth-flow") return flow;
  if (name === "@/lib/savedEvents") return helpers;
  if (name === "@/lib/eventCalendar") return load("lib/eventCalendar.ts");
  if (name === "./AppIcon") return { AppIcon: () => null };
  if (name === "next/link") return { __esModule: true, default: ({ children, ...props }) => React.createElement("a", props, children) };
  if (name === "next/image") return { __esModule: true, default: ({ src, alt }) => React.createElement("img", { src, alt }) };
  return require(name);
};
const { SavedEventCard } = load("components/SavedEventsSection.tsx", dependencies({}));
const card = renderToStaticMarkup(React.createElement(SavedEventCard, { item: { ...event(1), activity: { ...event(1).activity, placeName: "행사 <script>" } } }));
assert.match(card, /href="\/events\/detail\/\?id=101"/);
assert.match(card, /행사 &lt;script&gt;/);
assert.match(card, /행사 저장/); assert.match(card, /저장일/);
assert.match(card, /calendar.google.com\/calendar\/render/);
assert.doesNotMatch(card, /<a\s[^>]*>(?:(?!<\/a>)[\s\S])*<a\s/, "calendar and detail links must not be nested");
assert.doesNotMatch(card, /수집 완료|승인 완료|인증 완료|\/missions\/detail/);
for (const name of ["components/MyPassportPage.tsx", "components/ActivityHistoryPage.tsx"]) assert.ok(read(name).includes(".filter(isMissionHistory)"));
const passport = read("components/MyPassportPage.tsx");
assert.ok(passport.includes("<SavedEventsSection compact />"));
assert.ok(passport.includes('href="/community/"')); assert.ok(!passport.includes(">개인정보 수정</Link>"));
assert.ok(read("components/ActivityHistoryPage.tsx").includes('href="/saved-events/"'));
assert.ok(read("app/(portal)/saved-events/page.tsx").includes("<SavedEventsSection />"));
assert.ok(read("components/SaveActivityButton.tsx").includes('new Event("sportspassport-saved-change")'));
assert.ok(read("components/CommunityPage.tsx").includes("운영자 DEMO"), "demo attribution remains visible");
assert.ok(!read("components/CommunityPage.tsx").includes("운영자 데모는 실제 방문 인증이 아니며"));

const flush = () => new Promise(resolve => setImmediate(resolve));
function deferred() { let resolve, reject; const promise = new Promise((yes, no) => { resolve = yes; reject = no; }); return { resolve, reject, promise }; }
function find(tree, predicate) {
  if (!tree || typeof tree !== "object") return;
  if (Array.isArray(tree)) return tree.map(item => find(item, predicate)).find(Boolean);
  return predicate(tree) ? tree : find(tree.props?.children, predicate);
}
function setup(name, api, props = {}) {
  const state = [], refs = [], effects = [], cleanups = [], timers = [], listeners = new Map();
  let index = 0, refIndex = 0, mounted = false, writes = 0;
  const hooks = {
    useState(initial) { const i = index++; if (!(i in state)) state[i] = initial; return [state[i], next => { writes++; state[i] = typeof next === "function" ? next(state[i]) : next; }]; },
    useRef(initial) { return refs[refIndex++] ??= { current: initial }; },
    useCallback(fn) { return fn; },
    useEffect(fn) { if (!mounted) effects.push(fn); },
  };
  const exports = load("components/SavedEventsSection.tsx", dependencies(api, hooks), { window: {
    setTimeout(fn) { timers.push(fn); return fn; }, clearTimeout() {},
    addEventListener(name, fn) { listeners.set(name, fn); }, removeEventListener(name) { listeners.delete(name); },
  } }, "\nexports.SavedEventResults = SavedEventResults;");
  const render = () => { index = 0; refIndex = 0; return exports[name](props); };
  render(); for (const effect of effects) cleanups.push(effect()); mounted = true;
  for (const timer of timers) timer();
  return { state, render, listeners, writes: () => writes, unmount: () => cleanups.forEach(fn => fn?.()), button: text => find(render(), node => node.type === "button" && node.props.children === text) };
}
async function main() {
  const calls = [];
  const { api } = load("lib/api/service.ts", name => name === "./dto" ? dto : name === "../accountAddress" ? address : name === "./repository" ? { request: async (url, options) => { calls.push({ url, options }); return []; } } : require(name), { window: {}, sessionStorage: { getItem: () => "synthetic-test-token" } });
  await api.savedEvents.list(2, 20);
  assert.equal(calls[0].url, "/me/saved-activities?page=2&size=20&eventsOnly=true");
  assert.equal(calls[0].options.token, "synthetic-test-token");
  await api.savedActivities.list(1, 100);
  assert.equal(calls[1].url, "/me/saved-activities?page=1&size=100", "old save-state checks remain compatible");
  const tasks = [];
  const dataApi = { savedEvents: { list: (page, size) => { const task = deferred(); tasks.push({ page, size, ...task }); return task.promise; } } };
  const results = setup("SavedEventResults", dataApi, { compact: false });
  assert.equal(tasks[0].page, 1); assert.equal(tasks[0].size, 20);
  tasks[0].resolve(Array.from({ length: 20 }, (_, i) => event(i + 1))); await flush();
  assert.equal(results.state[0].length, 20);
  results.button("저장한 행사 더 보기").props.onClick(); results.button("저장한 행사 더 보기")?.props.onClick();
  assert.equal(tasks.length, 2, "concurrent page loads prevented");
  tasks[1].reject(new Error("offline")); await flush();
  assert.equal(results.state[0].length, 20, "page errors preserve existing records");
  results.button("다시 불러오기").props.onClick(); assert.equal(tasks[2].page, 2);
  tasks[2].resolve([event(20), event(21)]); await flush();
  assert.equal(results.state[0].length, 21, "overlapping pages deduplicated");
  assert.equal(results.state[2], false);
  results.unmount();
  const late = setup("SavedEventResults", dataApi, { compact: true });
  assert.equal(tasks.at(-1).size, 3);
  late.unmount(); const writes = late.writes(); tasks.at(-1).resolve([event(1)]); await flush();
  assert.equal(late.writes(), writes, "late private results ignored after unmount");
  const denied = setup("SavedEventResults", dataApi, { compact: false });
  tasks.at(-1).reject({ status: 401 }); await flush();
  assert.equal(denied.state[4], true); assert.equal(denied.state[0].length, 0); denied.unmount();
  let signedIn = true;
  const section = setup("SavedEventsSection", { hasToken: () => signedIn }, { compact: true });
  const resultKey = () => find(section.render(), node => typeof node.type === "function" && node.type.name === "SavedEventResults")?.key;
  const firstKey = resultKey(); section.listeners.get("sportspassport-saved-change")();
  assert.notEqual(resultKey(), firstKey, "save/cancel forces a fresh list");
  signedIn = false; section.listeners.get("sportspassport-auth-change")();
  assert.equal(resultKey(), undefined, "logout removes private results immediately"); section.unmount();
  assert.equal(section.listeners.size, 0);
  console.log("PASS: saved events separate from mission history, event links/status, pagination, retries, auth clearing, demo labels and API filtering");
}
main().catch(error => { console.error(error); process.exitCode = 1; });
