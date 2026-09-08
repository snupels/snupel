import { eventParticipationSchema, type ActivityResponse } from "./api/dto";

type Event = Pick<ActivityResponse, "metadata" | "startsAt" | "endsAt" | "sportName">;

function kstTimestamp(value: string | null | undefined) {
  if (!value) return NaN;
  return Date.parse(/[zZ]|[+-]\d{2}:\d{2}$/.test(value) ? value : `${value}+09:00`);
}

export function eventParticipation(event: Event, now = Date.now()) {
  const parsed = eventParticipationSchema.safeParse(event.metadata?.participation);
  if (!parsed.success) return null;
  const guide = parsed.data;
  const pastEvent = kstTimestamp(event.endsAt) < now;
  const closed = guide.status === "closed" || (guide.closesAt && Date.parse(guide.closesAt) <= now);
  const planned = guide.opensAt && Date.parse(guide.opensAt) > now;
  const stale = now - Date.parse(`${guide.verifiedAt}T00:00:00+09:00`) >= 7 * 86400000;
  const onsite = guide.mode === "onsite" || (closed && guide.onsiteAvailable && guide.status !== "closed");
  const status = pastEvent ? "ended"
    : guide.mode === "spectator" ? "spectator"
    : guide.status === "closed" ? "closed"
    : planned ? "planned"
    : onsite && (guide.status === "check" || stale) ? "onsiteCheck"
    : onsite ? "onsite"
    : closed ? "closed"
    : guide.status === "check" || stale ? "check"
    : guide.firstCome ? "firstCome" : "registration";
  const labels = {
    ended: "행사 종료", spectator: "관람 안내", closed: "접수 마감",
    planned: "접수 예정", onsite: "현장 접수 안내", check: "접수 확인 필요",
    onsiteCheck: "현장 접수 확인 필요",
    registration: "사전 신청", firstCome: "선착순 접수 · 잔여석 확인",
  };
  const ranks = { registration: 0, firstCome: 0, onsite: 0, planned: 1, check: 2, onsiteCheck: 2, spectator: 3, closed: 4, ended: 5 };
  return { guide, status, label: labels[status], rank: ranks[status] };
}

export function compareEvents(first: Event, second: Event, now = Date.now()) {
  const sports = (event: Event) => Boolean(event.sportName) || event.metadata?.eventType === "sports";
  const sportsOrder = Number(sports(second)) - Number(sports(first));
  if (sportsOrder) return sportsOrder;
  const rankOrder = (eventParticipation(first, now)?.rank ?? 2) - (eventParticipation(second, now)?.rank ?? 2);
  if (rankOrder) return rankOrder;
  const timestamp = (event: Event) => kstTimestamp(event.startsAt) || Number.MAX_SAFE_INTEGER;
  return timestamp(first) - timestamp(second);
}
