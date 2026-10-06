"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import type { CourseResponse } from "@/lib/api/dto";
import { relatedMissions } from "@/lib/relatedMissions";
import { AppIcon } from "./AppIcon";

export function RelatedMissions({ activityId }: { activityId: number }) {
  const [missions, setMissions] = useState<CourseResponse[]>([]);
  const [failed, setFailed] = useState(false);
  const [attempt, setAttempt] = useState(0);

  useEffect(() => {
    let cancelled = false;
    relatedMissions(activityId).then((items) => {
      if (!cancelled) setMissions(items);
    }).catch(() => {
      if (!cancelled) setFailed(true);
    });
    return () => { cancelled = true; };
  }, [activityId, attempt]);

  if (failed) return <div className="mx-7 mt-6 flex flex-wrap items-center gap-3 text-sm text-[#637069] sm:mx-10" role="status">
    <span>관련 미션을 불러오지 못했어요.</span>
    <button type="button" onClick={() => { setFailed(false); setAttempt((value) => value + 1); }} className="cursor-pointer font-semibold text-[#00783a] underline underline-offset-4 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#00783a]">다시 확인</button>
  </div>;
  if (!missions.length) return null;

  return <section aria-labelledby="related-missions-heading" className="mx-7 mt-6 rounded-2xl border border-[#c6dfce] bg-[#f1f8f3] p-5 sm:mx-10 sm:p-6">
    <h2 id="related-missions-heading" className="flex items-center gap-2 text-base font-bold text-[#00783a]">
      <AppIcon name="camera" className="size-5 shrink-0" />이 장소에서 참여할 수 있는 미션
    </h2>
    <ul className="mt-4 space-y-3">
      {missions.map((mission) => <li key={mission.id}>
        <Link href={`/missions/detail/?id=${mission.id}`} className="group flex cursor-pointer flex-col gap-3 rounded-xl border border-[#d8e7dc] bg-white p-4 transition hover:border-[#008f45] hover:bg-[#fbfdfb] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#00783a] sm:flex-row sm:items-center sm:justify-between">
          <span className="min-w-0 break-words text-sm font-bold leading-6 text-[#172033]">{mission.title || "사진 인증 미션"}</span>
          <span className="inline-flex shrink-0 items-center gap-2 text-sm font-bold text-[#00783a]">미션 참여하기<AppIcon name="arrowRight" className="size-4 transition-transform group-hover:translate-x-0.5" /></span>
        </Link>
      </li>)}
    </ul>
    <p className="mt-3 text-xs leading-5 text-[#637069]">미션별 사진 인증 조건을 확인해 주세요. 인증이 승인되면 스탬프가 지급됩니다.</p>
  </section>;
}
