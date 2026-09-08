"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import type { ActivityHistoryResponse, ActivityHistoryStatus } from "@/lib/api/dto";
import { api } from "@/lib/api/service";
import { AppIcon, type AppIconName } from "./AppIcon";

const STATUS: Record<ActivityHistoryStatus, { label: string; icon: AppIconName; className: string }> = {
  pending: { label: "검토 중", icon: "timer", className: "bg-[#fff5d9] text-[#9a7100]" },
  approved: { label: "승인 완료", icon: "checkCircle", className: "bg-[#e5f5eb] text-[#008f45]" },
  rejected: { label: "반려", icon: "lock", className: "bg-[#fff0ed] text-[#b14b3d]" },
  collected: { label: "수집 완료", icon: "award", className: "bg-[#e8eefb] text-[#345da7]" },
};
const TYPE_LABEL = { submission: "사진 인증", stamp: "스탬프 획득", saved: "관심 활동 저장" };
const FILTERS = ["all", "pending", "approved", "rejected", "collected"] as const;

export function ActivityHistoryPage() {
  const [activities, setActivities] = useState<ActivityHistoryResponse[]>([]);
  const [filter, setFilter] = useState<"all" | ActivityHistoryStatus>("all");
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [authenticated, setAuthenticated] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    Promise.resolve().then(async () => {
      if (!api.hasToken()) return;
      setAuthenticated(true);
      setActivities(await api.activityHistory.list({ page: 1, size: 100 }));
    }).catch(() => setError("활동 이력을 불러오지 못했습니다. 잠시 후 다시 시도해 주세요."))
      .finally(() => setLoading(false));
  }, []);

  const visible = useMemo(() => {
    const normalized = query.trim().toLocaleLowerCase("ko-KR");
    return activities.filter((activity) => {
      const text = `${activity.title ?? ""} ${activity.placeName ?? ""} ${activity.sigun ?? ""} ${STATUS[activity.status].label}`;
      return (filter === "all" || activity.status === filter) && (!normalized || text.toLocaleLowerCase("ko-KR").includes(normalized));
    });
  }, [activities, filter, query]);

  if (loading) return <main className="grid min-h-[60vh] place-items-center bg-[#f3f7f4] text-sm text-[#637069]">활동 이력을 불러오는 중…</main>;
  if (!authenticated) return <LoginRequired />;

  return (
    <main className="min-h-screen bg-[#f3f7f4] px-5 pb-20 pt-10 text-[#172033] sm:px-8">
      <div className="mx-auto max-w-[1080px]">
        <Link href="/mypage" className="inline-flex items-center gap-2 text-sm font-semibold text-[#637069] hover:text-[#008f45]"><AppIcon name="chevronLeft" className="size-5" />마이페이지로 돌아가기</Link>
        <header className="mt-8 rounded-[28px] bg-[linear-gradient(135deg,#006f3b,#009b52)] px-6 py-8 text-white shadow-lg sm:px-10">
          <p className="text-xs font-bold tracking-[0.18em] text-white/60">MY ACTIVITY HISTORY</p>
          <h1 className="mt-2 text-3xl font-bold">나의 활동 이력</h1>
          <p className="mt-3 text-sm text-white/70">사진 인증, 스탬프 획득, 관심 활동 저장 기록을 확인하세요.</p>
        </header>
        <section className="mt-8">
          <input type="search" value={query} onChange={(event) => setQuery(event.target.value)} placeholder="활동명, 장소, 지역 검색" aria-label="활동 이력 검색" className="h-13 w-full rounded-2xl border border-[#d7e2db] bg-white px-4 text-sm outline-none focus:border-[#008f45]" />
          <div className="mt-4 flex flex-wrap gap-2">{FILTERS.map((value) => <button key={value} type="button" onClick={() => setFilter(value)} className={`rounded-full border px-4 py-2 text-sm font-semibold ${filter === value ? "border-[#008f45] bg-[#008f45] text-white" : "border-[#d9e3dd] bg-white text-[#657169]"}`}>{value === "all" ? "전체" : STATUS[value].label} <span className="ml-1 text-xs opacity-70">{value === "all" ? activities.length : activities.filter((item) => item.status === value).length}</span></button>)}</div>
          {error && <p role="alert" className="mt-4 rounded-xl bg-[#fff0ed] p-4 text-sm text-[#a03d32]">{error}</p>}
          <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {visible.map((activity) => <HistoryCard key={activity.id} activity={activity} />)}
            {!visible.length && <div className="col-span-full flex min-h-[260px] flex-col items-center justify-center rounded-[24px] border border-[#dce5df] bg-white text-[#8b9690]"><AppIcon name="clipboard" className="size-11" /><p className="mt-4 font-semibold">표시할 활동 이력이 없습니다.</p></div>}
          </div>
        </section>
      </div>
    </main>
  );
}

function HistoryCard({ activity }: { activity: ActivityHistoryResponse }) {
  const status = STATUS[activity.status];
  return (
    <article className="overflow-hidden rounded-[18px] border border-[#dce5df] bg-white shadow-sm">
      <div className="aspect-[4/3] bg-[#e8eeea] bg-cover bg-center" style={activity.imageUrl ? { backgroundImage: `url(${activity.imageUrl})` } : undefined}>
        {!activity.imageUrl && <span className="flex h-full items-center justify-center text-[#90a097]"><AppIcon name={activity.type === "stamp" ? "award" : "camera"} className="size-10" /></span>}
      </div>
      <div className="p-5">
        <div className="flex items-center justify-between gap-3"><span className={`rounded-full px-2.5 py-1 text-xs font-bold ${status.className}`}>{status.label}</span><span className="text-xs text-[#8a9490]">{activity.occurredAt.slice(0, 10).replaceAll("-", ".")}</span></div>
        <p className="mt-4 text-xs font-bold text-[#008f45]">{TYPE_LABEL[activity.type]}</p>
        <h2 className="mt-1 font-bold">{activity.title ?? `활동 #${activity.activityId}`}</h2>
        <p className="mt-2 flex items-center gap-1.5 text-sm text-[#6f7a74]"><AppIcon name="mapPin" className="size-4 text-[#008f45]" />{activity.placeName ?? activity.sigun ?? "장소 정보 없음"}</p>
        {activity.rejectionReason && <p className="mt-4 rounded-lg bg-[#fff0ed] p-3 text-xs text-[#a03d32]">{activity.rejectionReason}</p>}
        <Link href={`/activity-feed/detail?id=${activity.activityId}`} className="mt-4 inline-flex items-center gap-1 text-xs font-bold text-[#008f45]">활동 상세 보기<AppIcon name="arrowRight" /></Link>
      </div>
    </article>
  );
}

function LoginRequired() {
  return (
    <main className="grid min-h-[65vh] place-items-center bg-[#f3f7f4] px-4">
      <div className="max-w-md rounded-[24px] border border-[#dce5df] bg-white p-8 text-center">
        <AppIcon name="lock" className="mx-auto size-10 text-[#008f45]" />
        <h1 className="mt-5 text-2xl font-bold">로그인이 필요합니다</h1>
        <p className="mt-2 text-sm text-[#637069]">로그인하면 인증, 스탬프, 저장 활동 이력을 확인할 수 있어요.</p>
        <Link href="/login" className="mt-6 flex h-12 items-center justify-center rounded-xl bg-[#008f45] font-bold text-white">로그인하기</Link>
      </div>
    </main>
  );
}
