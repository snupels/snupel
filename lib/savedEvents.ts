import type { SavedActivityResponse } from "./api/dto";

export function isSavedEvent(item: SavedActivityResponse) {
  return item.activity.category === "event" || item.activity.category === "festival";
}

export function savedEventHref(item: SavedActivityResponse) {
  return `/events/detail/?id=${item.activityId}`;
}

export function savedEventPeriod(item: SavedActivityResponse) {
  const start = item.activity.startsAt?.slice(0, 10).replaceAll("-", ".");
  const end = item.activity.endsAt?.slice(0, 10).replaceAll("-", ".");
  return start ? (end && end !== start ? `${start} ~ ${end}` : start) : "행사 일정은 상세페이지에서 확인하세요.";
}
