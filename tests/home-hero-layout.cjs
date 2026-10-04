/* eslint-disable @typescript-eslint/no-require-imports -- Standalone regression test. */
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const home = fs.readFileSync(path.join(__dirname, "../components/HomePage.tsx"), "utf8");

assert.match(home, /lg:grid-cols-\[190px_minmax\(0,1fr\)_220px\]/);
assert.doesNotMatch(home, /lg:grid-cols-\[260px/);
assert.match(home, /data-testid="home-hero-heading" className="mt-3 flex h-28[^"]*sm:h-24/);
assert.match(home, /<p className="mt-3 min-h-24 max-w-xl[^"]*sm:min-h-18/);
assert.match(home, /data-testid="home-hero" className="[^"]*min-h-\[500px\]/);
assert.doesNotMatch(home, /h-36|xl:w-\[152px\]/);
assert.match(home, /className="mt-5 flex flex-wrap gap-3"/);
assert.match(home, /className="mt-4 flex items-center gap-3 text-sm text-white\/90"/);
const weather = home.slice(home.indexOf('<aside data-testid="home-weather"'), home.indexOf('aria-live="polite"'));
assert.doesNotMatch(weather, /heroChallenge\.artwork/);
assert.match(home, /data-testid="home-passport"/);
console.log("PASS: shared hero columns, reserved heading/description space and weather independent of mascot artwork");
