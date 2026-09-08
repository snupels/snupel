/* eslint-disable @typescript-eslint/no-require-imports -- Standalone regression test. */
const assert = require("node:assert/strict");
const fs = require("node:fs");
const vm = require("node:vm");
const ts = require("typescript");
const source = fs.readFileSync("lib/auth-flow.ts", "utf8");
const exportsObject = {};
vm.runInNewContext(ts.transpileModule(source, { compilerOptions: { module: ts.ModuleKind.CommonJS } }).outputText, { exports: exportsObject, require, URL, Date });
const { safeReturnPath, loginHref, authDestination, parseOAuthSession, authErrorMessage } = exportsObject;
for (const unsafe of [null, "https://other.example/", "//other.example/", "/\\other.example", "/%2fother.example", "/%5Cother.example", "/\nother.example", "/login/", "/onboarding/?next=/login/", "/../login/", "/%ZZ"]) {
  assert.equal(safeReturnPath(unsafe), "/mypage/", String(unsafe));
}
assert.equal(safeReturnPath("/missions/?id=12#photo"), "/missions/?id=12#photo");
assert.equal(loginHref("/community/?post=1"), "/login/?next=%2Fcommunity%2F%3Fpost%3D1");
assert.equal(authDestination(false, "/missions/?id=12"), "/missions/?id=12");
assert.equal(authDestination(true, "/missions/?id=12"), "/onboarding/?next=%2Fmissions%2F%3Fid%3D12");
const origin = "https://sportspassport.kr";
const session = { provider: "kakao", redirectUri: `${origin}/login/`, next: "/missions/?id=12", createdAt: 1000 };
assert.equal(parseOAuthSession(JSON.stringify(session), origin, 2000).next, "/missions/?id=12");
assert.equal(parseOAuthSession("broken json", origin), null);
assert.equal(parseOAuthSession(null, origin), null);
assert.equal(parseOAuthSession(JSON.stringify(session), origin, 602000), null);
assert.equal(parseOAuthSession(JSON.stringify({ ...session, provider: "unknown" }), origin, 2000), null);
assert.equal(parseOAuthSession(JSON.stringify({ ...session, redirectUri: "https://other.example/login/" }), origin, 2000), null);
assert.ok(authErrorMessage({ status: 400, body: { error: "invalid_credentials" } }).includes("비밀번호"));
assert.ok(authErrorMessage({ status: 400, body: { error: "invalid_oauth_state" } }).includes("만료"));
assert.ok(authErrorMessage({ status: 503, body: { error: "oauth_not_configured" } }).includes("설정"));
const login = fs.readFileSync("components/LoginPage.tsx", "utf8");
assert.ok(login.includes("callbackHandled.current"));
assert.ok(login.includes("history.replaceState"));
assert.ok(login.includes('providerError === "access_denied"'));
assert.ok(login.includes("await api.authorize(provider, redirectUri)"));
assert.ok(login.includes("authDestination(result.user.onboardingRequired, saved.next)"));
console.log("PASS: safe login return paths, OAuth session validation, cancellation/replay guards and actionable errors");
