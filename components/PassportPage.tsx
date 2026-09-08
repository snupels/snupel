"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import Image from "next/image";
import type { AuthUser, StampbookFilter, StampbookItem, StampbookResponse } from "@/lib/api/dto";
import { api } from "@/lib/api/service";
import { ApiError } from "@/lib/api/repository";
import { loginHref } from "@/lib/auth-flow";
import { AppIcon } from "./AppIcon";
import { PassportRewards } from "./PassportRewards";

const PAGE_SIZE = 6;
const STAMP_ROTATIONS = [-2.2, 1.4, -0.8, 2.1, -1.5, 0.7];
const FILTERS: Array<{ value: StampbookFilter; label: string }> = [
  { value: "all", label: "전체" },
  { value: "collected", label: "획득 완료" },
  { value: "available", label: "인증 가능" },
  { value: "locked", label: "잠김" },
];

function StampCard({ stamp }: { stamp: StampbookItem }) {
  const [imageFailed, setImageFailed] = useState(false);
  const collected = stamp.status === "collected";
  const available = stamp.status === "available";
  const mission = stamp.courses[0];
  return (
    <article className="text-center">
      <div
        className={`relative mx-auto flex aspect-[5/3] w-full max-w-[240px] items-center justify-center ${collected ? "" : "opacity-35 grayscale"}`}
        style={{ transform: `rotate(${STAMP_ROTATIONS[(stamp.catalogId - 1) % STAMP_ROTATIONS.length]}deg)` }}
      >
        {stamp.imageUrl && !imageFailed ? <Image src={stamp.imageUrl} onError={() => setImageFailed(true)} alt={`${stamp.regionKo} ${stamp.sportKo} 스탬프`} fill sizes="(max-width: 640px) 40vw, 240px" className="object-contain mix-blend-multiply" /> : <AppIcon name={collected ? "award" : available ? "mapPin" : "lock"} className="size-14 text-[#998452]" />}
      </div>
      <p className="mt-4 text-[10px] font-bold tracking-[0.16em] text-[#8a7b59]">{stamp.regionEn} · {stamp.sportEn}</p>
      <h3 className="mt-1 font-bold text-[#39362d]">{mission ? <Link href={`/missions/detail/?id=${mission.id}`} className="rounded hover:text-[#238256] hover:underline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#238256]">{mission.title ?? `${stamp.regionKo} ${stamp.sportKo} 미션`}</Link> : `${stamp.regionKo} ${stamp.sportKo} 스탬프`}</h3>
      <p className="mt-1 text-xs text-[#7d7461]">{stamp.regionKo} · {stamp.sportKo}</p>
      <p className={`mt-2 text-xs font-bold ${collected ? "text-[#238256]" : "text-[#8d846f]"}`}>
        {collected ? stamp.collectedAt?.slice(0, 10).replaceAll("-", ".") : available ? "미션을 눌러 인증 조건 확인" : "인증 가능 미션 준비 중"}
      </p>
    </article>
  );
}

export function PassportPage() {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [stampbook, setStampbook] = useState<StampbookResponse | null>(null);
  const [filter, setFilter] = useState<StampbookFilter>("all");
  const [tab, setTab] = useState<"stamps" | "rewards">("stamps");
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [reload, setReload] = useState(0);

  useEffect(() => {
    const syncTab = () => setTab(window.location.hash === "#rewards" ? "rewards" : "stamps");
    const timer = window.setTimeout(syncTab, 0);
    window.addEventListener("hashchange", syncTab);
    return () => { window.clearTimeout(timer); window.removeEventListener("hashchange", syncTab); };
  }, []);

  function selectTab(next: "stamps" | "rewards") {
    setTab(next);
    window.location.hash = next;
  }

  useEffect(() => {
    let active = true;
    const clearOnAuthChange = () => {
      active = false;
      setUser(null);
      setStampbook(null);
      setError("");
      setLoading(true);
      setPage(1);
      setReload((value) => value + 1);
    };
    window.addEventListener("sportspassport-auth-change", clearOnAuthChange);
    Promise.resolve().then(async () => {
      if (!active) return;
      setLoading(true);
      setError("");
      if (!api.hasToken()) return;
      const profile = await api.me();
      if (!active) return;
      setUser(profile);
      const stampbookData = await api.myStampbook();
      if (active) setStampbook(stampbookData);
    })
      .catch((reason) => {
        if (!active) return;
        if (reason instanceof ApiError && reason.status === 401) { setUser(null); setStampbook(null); return; }
        setError("스탬프북을 불러오지 못했습니다. 잠시 후 다시 시도해 주세요.");
      })
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; window.removeEventListener("sportspassport-auth-change", clearOnAuthChange); };
  }, [reload]);

  const filtered = useMemo(
    () => stampbook?.items.filter((stamp) => filter === "all" || stamp.status === filter) ?? [],
    [filter, stampbook],
  );
  const pageCount = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const visible = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);
  const counts: Record<StampbookFilter, number | string> = {
    all: stampbook?.summary.total ?? "—",
    collected: stampbook?.summary.collected ?? "—",
    available: stampbook?.summary.available ?? "—",
    locked: stampbook?.summary.locked ?? "—",
  };

  if (loading) return <main className="grid min-h-[65vh] place-items-center bg-[#171d2b] text-sm text-white/70">스탬프북을 불러오는 중…</main>;
  if (!user) return (
    <main className="grid min-h-[65vh] place-items-center bg-[#171d2b] px-4 text-white">
      <div className="max-w-md rounded-[24px] border border-white/10 bg-white/[0.05] p-8 text-center">
        <AppIcon name="lock" className="mx-auto size-10 text-[#d5ae66]" />
        <h1 className="mt-5 text-2xl font-bold">{error ? "정보를 불러올 수 없습니다" : "로그인이 필요합니다"}</h1>
        <p role={error ? "alert" : undefined} className="mt-2 text-sm leading-6 text-white/55">{error || "로그인하면 내 스탬프 획득 현황을 확인할 수 있어요."}</p>
        {error ? <button type="button" onClick={() => setReload((value) => value + 1)} className="mt-6 flex h-12 w-full cursor-pointer items-center justify-center rounded-xl bg-[#d5ae66] font-bold text-[#171d2b]">다시 시도</button> : <Link href={loginHref(typeof window === "undefined" ? "/stampbook/" : `${window.location.pathname}${window.location.search}${window.location.hash}`)} className="mt-6 flex h-12 items-center justify-center rounded-xl bg-[#d5ae66] font-bold text-[#171d2b]">로그인하기</Link>}
      </div>
    </main>
  );

  const displayName = user.nickname || user.email.split("@")[0];
  return (
    <div className="min-h-screen bg-[#171d2b] text-white">
      <header className="border-b border-white/10 bg-[#121824] px-4 py-10 sm:px-8">
        <div className="mx-auto flex max-w-[1320px] flex-col justify-between gap-6 sm:flex-row sm:items-end">
          <div><Link href="/mypage" className="mb-6 inline-flex items-center gap-1 text-sm text-white/65 hover:text-white"><AppIcon name="chevronLeft" className="size-4" />나의 패스포트로</Link><p className="text-xs font-bold tracking-[0.2em] text-[#d5ae66]">GANGWON SPORTS PASSPORT</p><h1 className="mt-3 text-3xl font-bold sm:text-4xl">{displayName}님의 스탬프북</h1><p className="mt-3 text-sm text-white/65">승인된 방문 인증만 획득 완료로 표시됩니다.</p></div>
          <div className="grid grid-cols-4 gap-2 text-center text-xs">{FILTERS.map((item) => <div key={item.value} className="rounded-xl bg-white/[0.06] px-3 py-3"><strong className="block text-xl text-[#d5ae66]">{counts[item.value]}</strong>{item.label}</div>)}</div>
        </div>
      </header>

      <nav aria-label="스탬프북 메뉴" className="border-b border-white/10 bg-[#121824]"><div className="mx-auto flex max-w-[1320px] gap-6 px-4 sm:px-8">
        <button type="button" aria-pressed={tab === "stamps"} onClick={() => selectTab("stamps")} className={`h-16 cursor-pointer border-b-2 text-sm font-bold ${tab === "stamps" ? "border-[#d5ae66] text-[#d5ae66]" : "border-transparent text-white/65 hover:text-white"}`}>스탬프 수집</button>
        <button type="button" aria-pressed={tab === "rewards"} onClick={() => selectTab("rewards")} className={`h-16 cursor-pointer border-b-2 text-sm font-bold ${tab === "rewards" ? "border-[#d5ae66] text-[#d5ae66]" : "border-transparent text-white/65 hover:text-white"}`}>패스포트 리워드</button>
      </div></nav>

      <main className="mx-auto max-w-[1320px] px-4 py-10 sm:px-8">
        {error && <div role="alert" className="mb-6 rounded-xl border border-red-300/20 bg-red-300/10 p-4 text-sm text-red-100">{error}<button type="button" onClick={() => setReload((value) => value + 1)} className="ml-3 cursor-pointer font-bold underline">다시 시도</button></div>}
        {tab === "stamps" ? <>
          <div className="flex flex-wrap gap-2">{FILTERS.map((item) => <button key={item.value} type="button" aria-pressed={filter === item.value} onClick={() => { setFilter(item.value); setPage(1); }} className={`cursor-pointer rounded-full border px-4 py-2 text-sm ${filter === item.value ? "border-[#d5ae66] bg-[#d5ae66] text-[#171d2b]" : "border-white/20 text-white/65 hover:border-white/50"}`}>{item.label} <span className="ml-1">{counts[item.value]}</span></button>)}</div>
          <section className="mt-8 overflow-hidden rounded-[22px] bg-[#f5f1df] text-[#2d2b24] shadow-2xl">
            <div className="flex min-h-[620px] items-center px-5 py-10 sm:px-9">{visible.length ? <div className="mx-auto grid w-full max-w-[880px] grid-cols-2 gap-x-8 gap-y-12 sm:gap-x-20">{visible.map((stamp) => <StampCard key={stamp.catalogId} stamp={stamp} />)}</div> : <div className="mx-auto text-center text-[#8d846f]"><AppIcon name="award" className="mx-auto size-12" /><p className="mt-4 font-semibold">해당 상태의 스탬프가 없습니다.</p><Link href="/missions" className="mt-4 inline-flex rounded-lg px-3 py-2 text-sm font-bold text-[#238256] underline">인증할 미션 찾아보기</Link></div>}</div>
            <div className="flex items-center justify-between border-t border-[#d5c79f] px-5 py-4 text-xs text-[#786f5d]"><button type="button" disabled={page <= 1} onClick={() => setPage((value) => value - 1)} className="min-h-10 cursor-pointer px-2 disabled:cursor-default disabled:opacity-25">이전</button><span aria-live="polite">{page} / {pageCount} · {filtered.length}개</span><button type="button" disabled={page >= pageCount} onClick={() => setPage((value) => value + 1)} className="min-h-10 cursor-pointer px-2 disabled:cursor-default disabled:opacity-25">다음</button></div>
          </section>
        </> : <PassportRewards stampCount={stampbook?.summary.collected ?? null} />}
      </main>
    </div>
  );
}
