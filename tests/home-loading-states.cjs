/* eslint-disable @typescript-eslint/no-require-imports -- Standalone regression test. */
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const home = fs.readFileSync(path.join(__dirname, "..", "components/HomePage.tsx"), "utf8");

assert.ok(home.includes('stampCount: number | null'));
assert.ok(home.includes('level: string | null'));
assert.ok(!home.includes('stampCount: 0, level: "Level 1 Beginner"'));
assert.ok(home.includes('error.status === 401 ? "guest" : "error"'));
assert.ok(home.includes('passportProfile.stampCount === null ? "—"'));
assert.ok(home.includes('setPassportRetry(value => value + 1)'));
assert.ok(home.includes('window.addEventListener("sportspassport-auth-change", loadPassport)'));
assert.ok(home.includes('if (cancelled || request !== requestId) return;'));
assert.ok(home.includes('if (!autoPlay || weatherLoading) return;'));
assert.ok(home.includes('[weatherRegionIndex, autoPlay, weatherLoading]'));
assert.ok(home.includes('setWeatherLoading(false);'));
assert.ok(home.includes('Weather data by Open-Meteo.com'));
assert.ok(home.includes('api.weather('));
assert.ok(!home.includes('api.openMeteoWeather('));
console.log("PASS: home never invents passport progress on failure and waits for weather before rotating");
