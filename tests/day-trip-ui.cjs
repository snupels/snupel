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
test('new timetable and legacy recommendation payloads remain accepted', () => {
  const legacy = {title:'추천 코스',description:'일정',activityMinutes:120,travelMinutes:0,totalEstimatedMinutes:120,
    stops:[{activityId:1,placeName:'서핑',address:null,latitude:null,longitude:null,representativeImageUrl:null,reason:'체험',estimatedMinutes:120}],
    legs:[],usedAi:false,matchScore:70};
  assert.ok(dto.courseRecommendationResponseSchema.safeParse(legacy).success);
  const dated = {...legacy, travelDate:'2026-10-20',startTime:'09:00',waitingMinutes:0,planningNotes:['운영시간 확인 필요'],
    stops:[{...legacy.stops[0],role:'activity',arrivalTime:'09:00',departureTime:'11:00',waitingMinutes:0,hoursStatus:'unknown',openingHours:null,visitNote:'방문 전 문의'}]};
  assert.ok(dto.courseRecommendationResponseSchema.safeParse(dated).success);
  assert.ok(!dto.courseRecommendationRequestSchema.safeParse({theme:'healing',region:'강원특별자치도',availableMinutes:360,travelDate:'2026-02-30',startTime:'09:00'}).success);
  assert.ok(!dto.courseRecommendationRequestSchema.safeParse({theme:'healing',region:'강원특별자치도',availableMinutes:360,startTime:'25:00'}).success);
});
test('visit timing labels distinguish supplied hours from unknown hours and show waits', () => {
  const {CourseVisitDetails} = load('components/CourseVisitDetails.tsx', {'./AppIcon':{AppIcon:()=>null}});
  const html = renderToStaticMarkup(React.createElement(CourseVisitDetails,{visit:{arrivalTime:'10:00',departureTime:'12:00',waitingMinutes:30,hoursStatus:'provided',openingHours:'10:00~18:00'}}));
  assert.match(html,/10:00–12:00/); assert.match(html,/대기 약 30분/); assert.match(html,/제공된 운영시간 기준/);
  const unknown = renderToStaticMarkup(React.createElement(CourseVisitDetails,{visit:{hoursStatus:'unknown'}}));
  assert.match(unknown,/운영시간 미확인/); assert.doesNotMatch(unknown,/제공된 운영시간 기준/);
});
test('date and start time are editable form controls and role labels are visitor-facing', () => {
  const {CoursePreferences} = load('components/CoursePreferences.tsx', {'./AppIcon':{AppIcon:()=>null}});
  const html = renderToStaticMarkup(React.createElement(CoursePreferences,{values:{travelDate:'2026-10-20',startTime:'10:30'}}));
  assert.match(html,/type="date"[^>]*name="travelDate"/); assert.match(html,/value="2026-10-20"/);
  assert.match(html,/type="time"[^>]*name="startTime"/); assert.match(html,/value="10:30"/);
  const {courseRoleLabel,courseTravelDate} = load('lib/coursePresentation.ts');
  assert.equal(courseRoleLabel('activity'),'메인 체험'); assert.equal(courseRoleLabel('meal'),'식사');
  assert.match(courseTravelDate(),/^\d{4}-\d{2}-\d{2}$/);
});
