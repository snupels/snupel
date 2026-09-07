/* eslint-disable @typescript-eslint/no-require-imports -- Standalone calendar export regression test. */
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const vm = require("node:vm");
const ts = require("typescript");

const source = fs.readFileSync(path.join(__dirname, "../components/EventDetailPage.tsx"), "utf8");
const helper = source.slice(source.indexOf("function calendarFile("), source.indexOf("export function EventDetailPage"));
const { outputText } = ts.transpileModule(`${helper}\nexports.calendarFile = calendarFile;`, {});
const result = {};
vm.runInNewContext(outputText, { exports: result, Blob });

const file = result.calendarFile({ id: 7, startsAt: "2026-09-07", endsAt: "2026-09-09", summary: "무료, 야외 행사", sourceUrl: "https://example.com" }, "강원; 축제", "강릉, 중앙로");
file.text().then((ics) => {
  assert.match(ics, /DTSTART;VALUE=DATE:20260907/);
  assert.match(ics, /DTEND;VALUE=DATE:20260910/);
  assert.match(ics, /SUMMARY:강원\\; 축제/);
  assert.match(ics, /LOCATION:강릉\\, 중앙로/);
  assert.match(ics, /DESCRIPTION:무료\\, 야외 행사\\nhttps:\/\/example.com/);
  console.log("PASS: calendar export has inclusive all-day dates and escaped fields");
});
