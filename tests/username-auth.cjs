/* eslint-disable @typescript-eslint/no-require-imports -- Isolated account contract regression tests. */
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const vm = require("node:vm");
const ts = require("typescript");
function load(file, extra = {}) {
  const context = { exports: {}, require, URL, URLSearchParams, Event, ...extra };
  vm.runInNewContext(ts.transpileModule(fs.readFileSync(path.join(__dirname, "..", file), "utf8"), {
    compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2020 },
  }).outputText, context);
  return context.exports;
}
const dto = load("lib/api/dto.ts");
const address = load("lib/accountAddress.ts");
const authFlow = load("lib/auth-flow.ts");
assert.equal(fs.readFileSync(path.join(__dirname, "..", "components/TermsPage.tsx"), "utf8").split("아이디, 이메일, 로그인 계정 정보").length - 1, 2, "both privacy notices disclose username collection");
assert.equal(dto.usernameSchema.parse(" Trail_2026 "), "trail_2026");
for (const value of ["abc", "a".repeat(21), "가나다라", "user-name", "user.name", "hello@world", "a b c", "Kabc", "ａｂｃｄ", ""]) {
  assert.equal(dto.usernameSchema.safeParse(value).success, false, `invalid username: ${value}`);
}
const signup = {
  username: "Trail_2026", email: "member@example.com", password: "test-only-password",
  nickname: "회원", phoneNumber: "01012345678", agreeTerms: true, agreePrivacy: true,
};
assert.equal(dto.signupRequestSchema.parse(signup).username, "trail_2026");
const { username: omitted, ...withoutUsername } = signup;
assert.ok(omitted);
assert.equal(dto.signupRequestSchema.safeParse(withoutUsername).success, false, "new local signup requires a separate ID");
assert.equal(dto.loginRequestSchema.parse({ identifier: " Trail_2026 ", password: "test" }).identifier, "trail_2026");
assert.equal(dto.loginRequestSchema.parse({ email: "member@example.com", password: "test" }).email, "member@example.com");
assert.equal(dto.loginRequestSchema.safeParse({ identifier: "trail_2026", email: "member@example.com", password: "test" }).success, false);
assert.equal(dto.loginRequestSchema.safeParse({ identifier: " ", password: "test" }).success, false);
assert.equal(dto.authUserSchema.parse({ id: 1, email: "member@example.com" }).username, undefined, "old API/cache remains readable");
assert.equal(dto.authUserSchema.parse({ id: 1, email: "member@example.com", username: null }).username, null);
assert.equal(dto.profileUpdateSchema.parse({ username: " Trail_2026 " }).username, "trail_2026");
assert.equal(dto.profileUpdateSchema.safeParse({ username: null }).success, false, "username cannot be cleared");
assert.ok(!Object.hasOwn(dto.profileUpdateSchema.parse({ nickname: "회원" }), "username"));
for (const schema of [dto.passwordResetRequestSchema, dto.passwordResetConfirmSchema]) {
  const extra = schema === dto.passwordResetConfirmSchema ? { code: "123456", newPassword: "test-only-password" } : {};
  assert.equal(schema.safeParse({ email: "member@example.com", ...extra }).success, false, "both recovery steps need username and email");
  assert.equal(schema.safeParse({ username: "trail_2026", ...extra }).success, false);
  const pair = schema.parse({ username: " Trail_2026 ", email: " Member@Example.com ", ...extra });
  assert.equal(pair.username, "trail_2026");
  assert.equal(pair.email, "member@example.com");
  assert.ok(schema.safeParse({ username: "member@example.com", email: "member@example.com", ...extra }).success, "legacy email-ID recovery shape remains valid; server checks account type");
}
assert.match(authFlow.authErrorMessage({ body: { error: "username_already_exists" } }), /다른 아이디/);
assert.match(authFlow.authErrorMessage({ body: { error: "username_change_not_allowed" } }), /변경할 수 없/);

async function main() {
  const calls = [], storage = new Map();
  const user = { id: 1, email: "member@example.com", username: "trail_2026", address: "synthetic private address" };
  const repository = {
    apiUrl: value => value,
    request: async (url, options) => {
      calls.push({ url, options });
      const data = url.startsWith("/auth/username-availability") ? { username: "trail_2026", available: true }
        : ["/auth/login", "/auth/signup"].includes(url) ? { user, accessToken: "synthetic-token", expiresIn: 3600 }
        : url === "/auth/me" ? user : { message: "Generic response." };
      return options.schema.parse(data);
    },
  };
  const { api } = load("lib/api/service.ts", {
    require(name) {
      if (name === "./dto") return dto;
      if (name === "../accountAddress") return address;
      if (name === "./repository") return repository;
      return require(name);
    },
    window: { dispatchEvent() {} },
    sessionStorage: { getItem: key => storage.get(key) ?? null, setItem: (key, value) => storage.set(key, value), removeItem: key => storage.delete(key) },
  });
  assert.equal((await api.checkUsername(" Trail_2026 ")).available, true);
  assert.equal(calls.at(-1).url, "/auth/username-availability?username=trail_2026");
  assert.equal(calls.at(-1).options.token, undefined, "availability does not require signed-in account");
  const count = calls.length;
  assert.throws(() => api.checkUsername("abc"));
  assert.equal(calls.length, count, "invalid ID does not call API");
  await api.signup(signup);
  assert.equal(calls.at(-1).options.body.username, "trail_2026");
  assert.equal(api.currentUser().username, "trail_2026");
  assert.ok(!storage.get("sportspassport-auth-user").includes(user.address), "username caching does not restore private-address caching");
  await api.login({ identifier: " Trail_2026 ", password: "test" });
  assert.equal(calls.at(-1).options.body.identifier, "trail_2026");
  await api.login({ email: "member@example.com", password: "test" });
  assert.equal(calls.at(-1).options.body.email, "member@example.com");
  await api.accountReminder("member@example.com");
  assert.deepEqual(Object.keys(calls.at(-1).options.body), ["email"], "ID reminder asks only for email and never sends ID in response");
  await api.requestPasswordReset({ username: "Trail_2026", email: "Member@Example.com" });
  assert.equal(calls.at(-1).options.body.username, "trail_2026");
  assert.equal(calls.at(-1).options.body.email, "member@example.com");
  await api.confirmPasswordReset({ username: "Trail_2026", email: "Member@Example.com", code: "123456", newPassword: "test-only-password" });
  assert.equal(calls.at(-1).options.body.username, "trail_2026");
  assert.equal(calls.at(-1).options.body.email, "member@example.com");
  await api.updateProfile({ username: "Trail_2026" });
  assert.equal(calls.at(-1).options.body.username, "trail_2026");
  console.log("PASS: username normalization/validation, signup requirements, legacy login, recovery pair, availability and private session cache");
}
main().catch(error => { console.error(error); process.exitCode = 1; });
