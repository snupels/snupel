"use client";

import Image from "next/image";
import Link from "next/link";
import { FormEvent, useCallback, useEffect, useRef, useState } from "react";
import type { ActivityHistoryResponse, ActivityHistoryStatus } from "@/lib/api/dto";
import { api } from "@/lib/api/service";
import { activityHistoryDetailHref, ACTIVITY_HISTORY_STATUS, ACTIVITY_HISTORY_TYPE } from "@/lib/activityHistory";
import { AppIcon } from "./AppIcon";

const PAGE_SIZE = 20;
const FILTERS = ["all", "pending", "approved", "rejected", "collected"] as const;
type HistoryFilter = "all" | ActivityHistoryStatus;

export function ActivityHistoryPage() {
  const [filter, setFilter] = useState<HistoryFilter>("all");
  const [queryDraft, setQueryDraft] = useState("");
  const [query, setQuery] = useState("");
  const [session, setSession] = useState<{ authenticated: boolean; version: number } | null>(null);

  useEffect(() => {
    const update = () => setSession((previous) => ({ authenticated: api.hasToken(), version: (previous?.version ?? 0) + 1 }));
    const timer = window.setTimeout(update, 0);
    window.addEventListener("sportspassport-auth-change", update);
    return () => {
      window.clearTimeout(timer);
      window.removeEventListener("sportspassport-auth-change", update);
    };
  }, []);

  function search(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setQuery(queryDraft.trim());
  }

  if (!session) return <main className="grid min-h-[60vh] place-items-center bg-[#f3f7f4] text-sm text-[#637069]">로그인 상태를 확인하는 중…</main>;
  if (!session.authenticated) return <LoginRequired />;

  return (
    <main className="min-h-screen bg-[#f3f7f4] px-5 pb-20 pt-10 text-[#172033] sm:px-8">
      <div className="mx-auto max-w-[1080px]">
        <Link href="/mypage" className="inline-flex items-center gap-2 text-sm font-semibold text-[#637069] hover:text-[#008f45]"><AppIcon name="chevronLeft" className="size-5" />나의 패스포트로 돌아가기</Link>
        <header className="mt-8 rounded-[28px] bg-[linear-gradient(135deg,#006f3b,#009b52)] px-6 py-8 text-white shadow-lg sm:px-10">
          <p className="text-xs font-bold tracking-[0.18em] text-white/60">MY ACTIVITY HISTORY</p>
          <h1 className="mt-2 text-3xl font-bold">나의 활동 이력</h1>
          <p className="mt-3 text-sm text-white/70">내 사진 인증의 심사 상태와 스탬프 획득, 관심 활동 기록을 확인하세요.</p>
        </header>
        <section className="mt-8">
          <form onSubmit={search} role="search" className="flex gap-2">
            <input type="search" value={queryDraft} onChange={(event) => setQueryDraft(event.target.value)} maxLength={100} placeholder="활동명, 장소, 지역 검색" aria-label="활동 이력 검색" className="h-13 min-w-0 flex-1 rounded-2xl border border-[#d7e2db] bg-white px-4 text-sm outline-none focus:border-[#008f45]" />
            <button type="submit" className="cursor-pointer rounded-xl bg-[#008f45] px-5 text-sm font-bold text-white hover:bg-[#00783a]">검색</button>
          </form>
          <div className="mt-4 flex flex-wrap gap-2" aria-label="인증 상태 필터">
            {FILTERS.map((value) => <button key={value} type="button" aria-pressed={filter === value} onClick={() => setFilter(value)} className={"cursor-pointer rounded-full border px-4 py-2 text-sm font-semibold " + (filter === value ? "border-[#008f45] bg-[#008f45] text-white" : "border-[#d9e3dd] bg-white text-[#657169]")}>{value === "all" ? "전체" : ACTIVITY_HISTORY_STATUS[value].label}</button>)}
            {(filter !== "all" || query) && <button type="button" onClick={() => { setFilter("all"); setQuery(""); setQueryDraft(""); }} className="cursor-pointer px-3 text-sm font-semibold text-[#637069] underline underline-offset-4">검색 초기화</button>}
          </div>
          <HistoryResults key={session.version + ":" + filter + ":" + query} filter={filter} query={query} />
        </section>
      </div>
    </main>
  );
}

function HistoryResults({ filter, query }: { filter: HistoryFilter; query: string }) {
  const [activities, setActivities] = useState<ActivityHistoryResponse[]>([]);
  const [page, setPage] = useState(0);
  const [hasMore, setHasMore] = useState(false);
  const [loading, setLoading] = useState(true);
  const [requiresLogin, setRequiresLogin] = useState(false);
  const [error, setError] = useState<{ page: number; message: string } | null>(null);
  const requestVersion = useRef(0);
  const requestLock = useRef(false);

  const loadPage = useCallback(async (nextPage: number) => {
    if (requestLock.current) return;
    requestLock.current = true;
    const version = ++requestVersion.current;
    setLoading(true);
    setError(null);
    try {
      const rows = await api.activityHistory.list({
        page: nextPage,
        size: PAGE_SIZE,
        q: query || undefined,
        status: filter === "all" ? undefined : filter,
      });
      if (version !== requestVersion.current) return;
      setActivities((previous) => nextPage === 1 ? rows : [...new Map([...previous, ...rows].map((item) => [item.id, item])).values()]);
      setPage(nextPage);
      setHasMore(rows.length === PAGE_SIZE);
    } catch (reason) {
      if (version !== requestVersion.current) return;
      const status = typeof reason === "object" && reason && "status" in reason ? Number(reason.status) : 0;
      if (status === 401) {
        setActivities([]);
        setRequiresLogin(true);
      } else {
        setError({ page: nextPage, message: "활동 이력을 불러오지 못했습니다. 잠시 후 다시 시도해 주세요." });
      }
    } finally {
      if (version === requestVersion.current) {
        requestLock.current = false;
        setLoading(false);
      }
    }
  }, [filter, query]);

  useEffect(() => {
    const timer = window.setTimeout(() => { void loadPage(1); }, 0);
    return () => {
      window.clearTimeout(timer);
      requestVersion.current += 1;
      requestLock.current = false;
    };
  }, [loadPage]);

  if (requiresLogin) return <LoginRequired compact />;
  return (
    <>
      {error && <div role="alert" className="mt-5 rounded-xl bg-[#fff0ed] p-4 text-sm text-[#a03d32]"><p>{error.message}</p><button type="button" onClick={() => { void loadPage(error.page); }} className="mt-3 cursor-pointer rounded-lg border border-[#d49b93] px-4 py-2 font-bold">다시 불러오기</button></div>}
      <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {activities.map((activity) => <HistoryCard key={activity.id} activity={activity} />)}
        {!loading && !error && activities.length === 0 && <div className="col-span-full flex min-h-[240px] flex-col items-center justify-center rounded-[24px] border border-[#dce5df] bg-white px-5 text-center text-[#68776e]"><AppIcon name="clipboard" className="size-11" /><p className="mt-4 font-semibold">{query || filter !== "all" ? "선택한 조건에 맞는 활동 이력이 없습니다." : "아직 기록된 활동이 없습니다."}</p><Link href="/missions" className="mt-5 text-sm font-bold text-[#008f45]">참여할 미션 찾기</Link></div>}
      </div>
      {loading && <p role="status" className="mt-6 text-center text-sm text-[#637069]">활동 이력을 불러오는 중…</p>}
      {!loading && !error && hasMore && <button type="button" onClick={() => { void loadPage(page + 1); }} className="mx-auto mt-7 flex cursor-pointer rounded-xl border border-[#9dcdb0] bg-white px-7 py-3 text-sm font-bold text-[#008f45]">이전 활동 더 보기</button>}
      {!loading && !error && !hasMore && activities.length > 0 && <p className="mt-7 text-center text-xs text-[#79867e]">조건에 맞는 모든 활동을 확인했습니다.</p>}
    </>
  );
}

function HistoryCard({ activity }: { activity: ActivityHistoryResponse }) {
  const status = ACTIVITY_HISTORY_STATUS[activity.status];
  return (
    <Link href={activityHistoryDetailHref(activity.id)} className="group block overflow-hidden rounded-[18px] border border-[#dce5df] bg-white shadow-sm transition hover:border-[#91bea1] hover:shadow-md focus-visible:outline focus-visible:outline-2 focus-visible:outline-[#008f45]">
      <article>
        <div className="relative aspect-[4/3] bg-[#e8eeea]">
          {activity.imageUrl ? <Image src={activity.imageUrl} alt={activity.type === "submission" ? "제출한 인증 사진" : (activity.placeName ?? "활동") + " 이미지"} fill sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw" className="object-cover" unoptimized /> : <span className="flex h-full items-center justify-center text-[#90a097]"><AppIcon name={activity.type === "stamp" ? "award" : "camera"} className="size-10" /></span>}
        </div>
        <div className="p-5">
          <div className="flex items-center justify-between gap-3"><span className={"rounded-full px-2.5 py-1 text-xs font-bold " + status.className}>{status.label}</span><time dateTime={activity.occurredAt} className="text-xs text-[#8a9490]">{activity.occurredAt.slice(0, 10).replaceAll("-", ".")}</time></div>
          <p className="mt-4 text-xs font-bold text-[#008f45]">{ACTIVITY_HISTORY_TYPE[activity.type]}</p>
          <h2 className="mt-1 font-bold">{activity.title ?? activity.placeName ?? "나의 활동"}</h2>
          <p className="mt-2 flex items-center gap-1.5 text-sm text-[#6f7a74]"><AppIcon name="mapPin" className="size-4 text-[#008f45]" />{activity.placeName ?? activity.sigun ?? "장소 정보 없음"}</p>
          {activity.rejectionReason && <p className="mt-4 line-clamp-2 rounded-lg bg-[#fff0ed] p-3 text-xs text-[#a03d32]">{activity.rejectionReason}</p>}
          <span className="mt-4 inline-flex items-center gap-1 text-xs font-bold text-[#008f45]">내 활동 상세 보기<AppIcon name="arrowRight" /></span>
        </div>
      </article>
    </Link>
  );
}

function LoginRequired({ compact = false }: { compact?: boolean }) {
  const content = <div className="max-w-md rounded-[24px] border border-[#dce5df] bg-white p-8 text-center"><AppIcon name="lock" className="mx-auto size-10 text-[#008f45]" /><h1 className="mt-5 text-2xl font-bold">로그인이 필요합니다</h1><p className="mt-2 text-sm text-[#637069]">로그인하면 내 인증 사진과 심사 결과, 스탬프 기록을 확인할 수 있어요.</p><Link href={"/login?next=" + encodeURIComponent("/activity-history/")} className="mt-6 flex h-12 items-center justify-center rounded-xl bg-[#008f45] font-bold text-white">로그인하기</Link></div>;
  return compact ? <div className="mt-6 flex justify-center">{content}</div> : <main className="grid min-h-[65vh] place-items-center bg-[#f3f7f4] px-4">{content}</main>;
}
