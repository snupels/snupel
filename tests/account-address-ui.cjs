/* eslint-disable @typescript-eslint/no-require-imports -- Address form render/connection regression. */
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const vm = require("node:vm");
const ts = require("typescript");
const React = require("react");
const { renderToStaticMarkup } = require("react-dom/server");
const source = file => fs.readFileSync(path.join(__dirname, "..", file), "utf8");
const context = { exports: {}, require };
vm.runInNewContext(ts.transpileModule(source("components/AddressFields.tsx"), {
  compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2020, jsx: ts.JsxEmit.ReactJSX },
}).outputText, context);
const { AddressFields } = context.exports;
const markup = renderToStaticMarkup(React.createElement(AddressFields, {
  idPrefix: "account", value: { postalCode: "01234", address: "주소 <script>", addressDetail: "상세 & 주소" },
}));
for (const name of ["postalCode", "address", "addressDetail"]) assert.ok(markup.includes(`name="${name}"`));
for (const autocomplete of ["postal-code", "address-line1", "address-line2"]) assert.ok(markup.includes(`autoComplete="${autocomplete}"`));
assert.ok(markup.includes('value="01234"'), "postal code keeps its leading zero");
assert.ok(markup.includes("주소 &lt;script&gt;"));
assert.ok(markup.includes("상세 &amp; 주소"));
assert.ok(!markup.includes(" required="), "address inputs must not block signup");
assert.ok(markup.includes('pattern="[0-9]{5}"'));
assert.ok(markup.includes('maxLength="500"'));
assert.ok(markup.includes('maxLength="200"'));
assert.ok(markup.includes('aria-describedby="account-address-help"'));
assert.ok(markup.includes("공개 프로필·스포츠 피드에는 표시되지 않습니다"));
assert.ok(markup.includes("삭제할 수 있습니다"));
assert.ok(renderToStaticMarkup(React.createElement(AddressFields, { idPrefix: "signup", disabled: true })).includes('disabled=""'));

for (const file of ["components/LoginPage.tsx", "components/OnboardingPage.tsx", "components/AccountPage.tsx"]) {
  const form = source(file);
  assert.ok(form.includes("<AddressFields"), `${file} renders shared address fields`);
  assert.ok(form.includes("...readAccountAddress(form)"), `${file} submits address fields`);
}
assert.ok(source("components/AccountPage.tsx").includes("value={user}"));
assert.ok(source("components/OnboardingPage.tsx").includes("value={user}"));
const terms = source("components/TermsPage.tsx");
assert.equal(terms.split("주소(우편번호·기본주소·상세주소)").length - 1, 2, "combined and standalone privacy notices list optional address");
assert.equal(terms.split("주소는 선택 입력으로").length - 1, 2);
console.log("PASS: optional private address fields, prefill, escaped rendering, form payload wiring and both privacy notices");
