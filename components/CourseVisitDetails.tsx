import { AppIcon } from "./AppIcon";

export type CourseVisit = {
  arrivalTime?: string;
  departureTime?: string;
  waitingMinutes?: number;
  hoursStatus?: "provided" | "unknown";
  openingHours?: string | null;
};

export function CourseVisitDetails({ visit }: { visit: CourseVisit }) {
  return <div className="my-4 rounded-xl border border-[#dce9e0] bg-[#f5faf6] p-3 text-xs leading-5">
    {visit.arrivalTime && visit.departureTime && <p className="flex items-center gap-1.5 font-bold text-[#00783a]"><AppIcon name="timer" className="size-3.5 shrink-0" />예상 방문 {visit.arrivalTime}–{visit.departureTime}</p>}
    {Boolean(visit.waitingMinutes) && <p className="mt-1 text-[#68756d]">이동 후 대기 약 {visit.waitingMinutes}분 포함</p>}
    {visit.hoursStatus === "provided" ? <><p className="mt-2 font-semibold text-[#405149]">제공된 운영시간 기준</p><p className="mt-1 line-clamp-3 break-words text-[#68756d]" title={visit.openingHours ?? undefined}>{visit.openingHours}</p></> : <p className="mt-2 text-[#8a6800]">운영시간 미확인 · 방문 전 문의</p>}
  </div>;
}
