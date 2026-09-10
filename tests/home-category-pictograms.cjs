const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const source = fs.readFileSync(path.join(__dirname, "../components/HomePage.tsx"), "utf8");
const catalog = source.slice(source.indexOf("const categories:"), source.indexOf("const heroChallenges:"));
for (const [icon, filter] of [["mountain", "산악스포츠"], ["snowflake", "동계스포츠"], ["waves", "수상스포츠"], ["person", "육상스포츠"]]) {
  assert.ok(catalog.split("\n").some(line => line.includes(`icon: "${icon}"`) && line.includes(`filter: "${filter}"`)));
}
assert.equal((catalog.match(/image:/g) || []).length, 1);
assert.ok(catalog.includes('image: "/olympic-rings-white.svg"'));
assert.ok(source.includes('pathname: "/sports", query: { sport: category.filter }'));
assert.ok(source.includes('AppIcon name={category.icon}'));
assert.ok(!source.includes('@/imports/SportsAI/'));
console.log("PASS: four home category pictograms, original Olympic image and sports filter navigation preserved");
