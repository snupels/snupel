/* eslint-disable @typescript-eslint/no-require-imports -- Private account address contract test. */
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const vm = require("node:vm");
const ts = require("typescript");
const source = (file) => fs.readFileSync(path.join(__dirname, "..", file), "utf8");
function load(file, extra = {}) {
  const context = { exports: {}, require, URL, URLSearchParams, FormData, Event, ...extra };
  vm.runInNewContext(ts.transpileModule(source(file), {
    compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2020 },
  }).outputText, context);
  return context.exports;
}
const dto = load("lib/api/dto.ts");
const helpers = load("lib/accountAddress.ts");
const user = dto.authUserSchema.parse({
  id: 1, email: "member@example.com", nickname: "회원", phoneNumber: "01012345678",
  onboardingRequired: false, postalCode: "01234", address: "테스트용 기본주소", addressDetail: "테스트용 상세주소",
});
const signup = { email: "member@example.com", password: "test-only-password", nickname: "회원", phoneNumber: "01012345678", agreeTerms: true, agreePrivacy: true };
assert.ok(dto.signupRequestSchema.safeParse(signup).success, "address remains optional for existing clients");
assert.equal(dto.authUserSchema.parse({ id: 1, email: "member@example.com" }).address, null);
const normalized = dto.signupRequestSchema.parse({ ...signup, postalCode: " 01234 ", address: " 기본주소 ", addressDetail: " 상세주소 " });
assert.equal(normalized.postalCode, "01234");
assert.equal(normalized.address, "기본주소");
assert.equal(normalized.addressDetail, "상세주소");
assert.deepEqual(Object.keys(dto.profileUpdateSchema.parse({ nickname: "별명" })), ["nickname"]);
for (const schema of [dto.signupRequestSchema, dto.profileUpdateSchema]) {
  const base = schema === dto.signupRequestSchema ? signup : {};
  for (const postalCode of ["1234", "123456", "１２３４５", "12a45"]) assert.equal(schema.safeParse({ ...base, postalCode }).success, false);
  assert.equal(schema.safeParse({ ...base, address: "a".repeat(501) }).success, false);
  assert.equal(schema.safeParse({ ...base, addressDetail: "a".repeat(201) }).success, false);
  const cleared = schema.parse({ ...base, postalCode: "  ", address: "\n ", addressDetail: null });
  for (const key of ["postalCode", "address", "addressDetail"]) assert.equal(cleared[key], null);
}
const form = new FormData();
form.set("postalCode", " 01234 "); form.set("address", " 테스트 주소 "); form.set("addressDetail", "   ");
assert.equal(helpers.readAccountAddress(form).postalCode, "01234");
assert.equal(helpers.readAccountAddress(form).address, "테스트 주소");
assert.equal(helpers.readAccountAddress(form).addressDetail, null);
for (const key of ["postalCode", "address", "addressDetail"]) assert.ok(!(key in helpers.accountSessionUser(user)));
assert.equal(user.address, "테스트용 기본주소", "sanitizing cache must not change private API response");

async function main() {
  const pending = [], storage = new Map();
  const sessionStorage = { getItem: key => storage.get(key) ?? null, setItem: (key, value) => storage.set(key, value), removeItem: key => storage.delete(key) };
  const repository = {
    apiUrl: value => value,
    request: (url, options) => new Promise((resolve, reject) => pending.push({ url, options, resolve: value => { try { resolve(options.schema.parse(value)); } catch (error) { reject(error); } } })),
  };
  const { api } = load("lib/api/service.ts", {
    require(name) {
      if (name === "./dto") return dto;
      if (name === "../accountAddress") return helpers;
      if (name === "./repository") return repository;
      return require(name);
    },
    window: { dispatchEvent() {} }, sessionStorage,
  });
  const tokenKey = "sportspassport-access-token", userKey = "sportspassport-auth-user";
  const login = api.login({ email: user.email, password: "test-only-password" });
  pending.shift().resolve({ accessToken: "synthetic-token-a", expiresIn: 3600, user });
  const signedIn = await login;
  assert.equal(signedIn.user.address, user.address);
  assert.ok(!storage.get(userKey).includes(user.address));
  assert.ok(!storage.get(userKey).includes("postalCode"));

  const own = api.me();
  assert.equal(pending[0].options.token, "synthetic-token-a");
  pending.shift().resolve(user);
  assert.equal((await own).address, user.address, "own account form receives address from API");
  assert.equal(api.currentUser().address, null, "header/session user never returns cached private address");
  const update = api.updateProfile({ address: " 수정주소 ", addressDetail: "", postalCode: "" });
  const patch = pending.shift();
  assert.equal(patch.options.method, "PATCH");
  assert.equal(patch.options.body.address, "수정주소");
  assert.equal(patch.options.body.addressDetail, null);
  patch.resolve({ ...user, address: "수정주소", addressDetail: null, postalCode: null });
  assert.equal((await update).address, "수정주소");
  assert.ok(!storage.get(userKey).includes("수정주소"));

  const late = api.me();
  api.logout();
  pending.shift().resolve(user);
  await assert.rejects(late, /session changed/);
  assert.equal(storage.has(userKey), false);
  storage.set(tokenKey, "synthetic-token-a");
  const wrongSession = api.updateProfile({ address: "수정주소" });
  storage.set(tokenKey, "synthetic-token-b"); storage.set(userKey, JSON.stringify({ id: 2, email: "second@example.com" }));
  pending.shift().resolve(user);
  await assert.rejects(wrongSession, /session changed/);
  assert.equal(JSON.parse(storage.get(userKey)).id, 2, "late response must not overwrite another account");
  storage.set(userKey, JSON.stringify(user));
  assert.equal(api.currentUser().address, null);
  assert.ok(!storage.get(userKey).includes(user.address), "legacy storage is scrubbed on read");
  console.log("PASS: private signup/profile addresses, nullable clearing, strict postal validation, no address cache and stale-session protection");
}
main().catch(error => { console.error(error); process.exitCode = 1; });
