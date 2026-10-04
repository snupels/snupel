/* eslint-disable @typescript-eslint/no-require-imports -- Standalone regression test. */
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const vm = require("node:vm");
const ts = require("typescript");
const home = fs.readFileSync(path.join(__dirname, "../components/HomePage.tsx"), "utf8");
const catalog = home.slice(home.indexOf("const heroChallenges:"), home.indexOf("const quickLinks:"));
const context = { chuncheonMarathonImage: "chuncheon.jpg", digitalTourCardImage: "tour-card.png" };
vm.runInNewContext(ts.transpileModule(catalog + "\nglobalThis.slides = heroChallenges;", {
  compilerOptions: { module: ts.ModuleKind.CommonJS },
}).outputText, context);
const [featured, marathon, tourism] = context.slides;
assert.equal(context.slides.length, 3);
assert.equal(featured.title, "불닭 버닝 페스타 With 페포");
assert.equal(featured.href, "https://sqnc.global/buldak-burning-festa-with-peppo");
assert.equal(featured.image, "https://sqnc.global/_next/static/media/hero-fire-first-frame.e3bf6c5e.jpg");
assert.equal(featured.tone, "fire");
assert.equal(featured.artwork, "https://sqnc.global/_next/static/media/logo-buldak-burning-festa-with-peppo.349e9f3b.png");
assert.equal(marathon.artwork, undefined);
assert.equal(tourism.artwork, undefined);
assert.equal((home.match(/src=\{heroChallenge.artwork\}/g) || []).length, 1);
assert.match(home, /불닭 페포 마스코트와 버닝 페스타 공식 로고/);
assert.equal(marathon.tone, undefined);
assert.equal(tourism.tone, undefined);
assert.match(home, /heroChallenge.tone === "fire"/);
assert.match(home, /rgba\(92,8,16,0.76\)/);
assert.equal(featured.date, "2026.10.24(토) ~ 10.25(일)");
assert.equal(featured.location, "평창 삼양라운드힐");
assert.equal(featured.actionLabel, "공식 행사 안내");
assert.equal(marathon.title, "2026 춘천마라톤");
assert.equal(tourism.image, "tour-card.png");
assert.doesNotMatch(catalog, /홍천|hongcheon/);
assert.match(home, /setHeroIndex\(\(current\) => \(current \+ 1\) % heroChallenges.length\)/);
console.log("PASS: official Buldak event replaces only the first home slide; other slides and rotation preserved");
