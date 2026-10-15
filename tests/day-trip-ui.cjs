/* eslint-disable @typescript-eslint/no-require-imports -- Contract and rendered itinerary checks. */
const {test} = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');
const ts = require('typescript');
const React = require('react');
const {renderToStaticMarkup} = require('react-dom/server');
const {z} = require('zod');
function load(file, overrides = {}) {
  const context = {exports: {}, process: {env: {}}, require: name => overrides[name] ?? require(name)};
  vm.runInNewContext(ts.transpileModule(fs.readFileSync(file,'utf8'), {
    compilerOptions:{module:ts.ModuleKind.CommonJS,jsx:ts.JsxEmit.ReactJSX,target:ts.ScriptTarget.ES2020,esModuleInterop:true},
  }).outputText, context);
  return context.exports;
}
const dto = load('lib/api/dto.ts', {zod:{z}});
test('recommendation keeps role labels without a timetable', () => {
  const legacy = {title:'추천 코스',description:'일정',activityMinutes:120,travelMinutes:0,totalEstimatedMinutes:120,
    stops:[{activityId:1,placeName:'서핑',address:null,latitude:null,longitude:null,representativeImageUrl:null,reason:'체험',estimatedMinutes:120}],
    legs:[],usedAi:false,matchScore:70};
  assert.ok(dto.courseRecommendationResponseSchema.safeParse(legacy).success);
  assert.ok(dto.courseRecommendationResponseSchema.safeParse({...legacy,stops:[{...legacy.stops[0],role:'activity'}]}).success);
  assert.ok(dto.courseRecommendationRequestSchema.safeParse({theme:'healing',region:'강원특별자치도',availableMinutes:360}).success);
  assert.ok(!dto.courseRecommendationRequestSchema.safeParse({theme:'healing',region:'강원특별자치도',availableMinutes:360,travelDate:'2026-10-20',startTime:'09:00'}).success);
});
test('preference form removes date/time controls and retains region sport theme and time budget', () => {
  const {CoursePreferences} = load('components/CoursePreferences.tsx', {'./AppIcon':{AppIcon:()=>null}});
  const html = renderToStaticMarkup(React.createElement(CoursePreferences,{values:{travelDate:'2026-10-20',startTime:'10:30'}}));
  assert.doesNotMatch(html,/type="(?:date|time)"|travelDate|startTime|출발 시각|운영시간|휴무/);
  for (const name of ['sigun','sport','theme','availableMinutes']) assert.match(html,new RegExp(`name="${name}"`));
  const {courseRoleLabel} = load('lib/coursePresentation.ts');
  assert.equal(courseRoleLabel('activity'),'메인 체험'); assert.equal(courseRoleLabel('meal'),'식사');
});
test('result cards do not render timing or operating-hours controls', () => {
  const page = fs.readFileSync('components/PortalPage.tsx','utf8');
  assert.doesNotMatch(page,/CourseVisitDetails|arrivalTime|departureTime|waitingMinutes|travelDate|startTime|planningNotes/);
  assert.match(page,/courseRoleLabel\(stop.role\)/);
  assert.match(page,/카카오맵 전체 길찾기/);
});
