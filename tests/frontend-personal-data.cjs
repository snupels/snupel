/* eslint-disable @typescript-eslint/no-require-imports -- Standalone regression test. */
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");

const source = (file) => fs.readFileSync(path.join(__dirname, "..", file), "utf8");
const componentSource = fs.readdirSync(path.join(__dirname, "..", "components"))
  .filter((file) => file.endsWith(".tsx"))
  .map((file) => source(path.join("components", file)))
  .join("\n");
const passport = source("components/PassportPage.tsx");
const badges = source("components/BadgesPage.tsx");
const history = source("components/ActivityHistoryPage.tsx");
const home = source("components/HomePage.tsx");
const mission = source("components/MissionDetailPage.tsx");
const portal = source("components/PortalPage.tsx");
const saved = source("components/SaveActivityButton.tsx");
const service = source("lib/api/service.ts");
const missionCatalog = source("lib/missionCatalog.ts");

assert.ok(service.includes('myStampbook:'));
assert.ok(service.includes('/me/stampbook'));
assert.ok(passport.includes('api.myStampbook()'));
assert.ok(history.includes('api.activityHistory.list('));
assert.ok(badges.includes('api.myBadges()'));
assert.ok(badges.includes('api.myRewards()'));
assert.ok(saved.includes('api.savedActivities.save('));
assert.ok(saved.includes('api.savedActivities.remove('));
assert.ok(mission.includes('share_to_feed: shareToFeed'));
assert.ok(mission.includes('feed_caption:'));
assert.ok(!mission.includes('passport_id:'));
for (const resource of ["passports", "collectedBadges", "collectedStamps"])
  assert.ok(!componentSource.includes(`api.${resource}.`), `${resource} is admin-only; use an authenticated /me endpoint`);
assert.ok(!passport.includes('DEFAULT_COLLECTED_BADGE_IDS'));
assert.ok(!badges.includes('DEFAULT_COLLECTED_BADGE_IDS'));
assert.ok(!history.includes('fallbackActivities'));
assert.ok(!history.includes('api.activities'));
assert.ok(!home.includes('fallbackEvents'));
assert.ok(home.includes('api.weather('));
assert.ok(!home.includes('api.openMeteoWeather('));
assert.ok(!portal.includes('fallbackCards'));
assert.ok(!portal.includes('홍길동'));
assert.ok(!portal.includes('설악산 능선 트레일'));
assert.ok(!missionCatalog.includes('photoMissions'));

console.log('PASS: personal screens use authenticated backend data without mock fallbacks');
