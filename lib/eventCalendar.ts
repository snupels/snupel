import type { ActivityResponse } from "./api/dto";

/** Event API dates describe inclusive festival days, not confirmed session times. */
export function googleCalendarHref(event: ActivityResponse): string | null {
  const parseDay = (value: string | null | undefined) => {
    const day = value?.slice(0, 10);
    if (!day || !/^\d{4}-\d{2}-\d{2}$/.test(day)) return null;
    const date = new Date(`${day}T00:00:00Z`);
    return Number.isFinite(date.getTime()) && date.toISOString().slice(0, 10) === day ? date : null;
  };
  const start = parseDay(event.startsAt);
  const end = event.endsAt ? parseDay(event.endsAt) : start && new Date(start);
  if (!start || !end || end < start) return null;
  end.setUTCDate(end.getUTCDate() + 1); // Google all-day end is exclusive.
  const date = (day: Date) => day.toISOString().slice(0, 10).replaceAll("-", "");
  const details = [
    event.summary?.slice(0, 1000),
    "행사 기간을 종일 일정으로 추가합니다. 방문 시간과 최신 운영 정보는 공식 안내를 확인하세요.",
    `행사 상세: https://sportspassport.kr/events/detail/?id=${event.id}`,
    event.sourceUrl ? `공식 안내: ${event.sourceUrl}` : null,
  ].filter(Boolean).join("\n\n");
  const params = new URLSearchParams({
    action: "TEMPLATE",
    text: event.placeName || `강원 행사 #${event.id}`,
    dates: `${date(start)}/${date(end)}`,
    ctz: "Asia/Seoul",
    location: event.address || event.sigun || event.region || "강원특별자치도",
    details,
  });
  return `https://calendar.google.com/calendar/render?${params}`;
}
