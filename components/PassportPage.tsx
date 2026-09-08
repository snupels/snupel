"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import type { AuthUser, MeBadgeResponse, RewardClaimResponse, StampbookFilter, StampbookItem, StampbookResponse } from "@/lib/api/dto";
import { api } from "@/lib/api/service";
import { BADGE_REWARD_MILESTONES } from "@/lib/badgeRewards";
import { AppIcon } from "./AppIcon";

const PAGE_SIZE = 6;
const REWARD_STATUS = { eligible: "배송 신청 가능", requested: "배송 신청 완료", preparing: "상품 준비 중", shipped: "배송 중", completed: "지급 완료" };
const FILTERS: Array<{ value: StampbookFilter; label: string }> = [
  { value: "all", label: "전체" },
  { value: "collected", label: "획득 완료" },
  { value: "available", label: "인증 가능" },
  { value: "locked", label: "잠김" },
];

function StampCard({ stamp }: { stamp: StampbookItem }) {
  const collected = stamp.status === "collected";
  const available = stamp.status === "available";
  return (
    <article className="text-center">
      <div
        className={`relative mx-auto flex aspect-square max-w-[230px] items-center justify-center overflow-hidden rounded-full border-[10px] ${collected ? "border-[#b5914b] bg-white shadow-xl" : "border-[#d8d0b8] bg-[#e7e1ce]"}`}
        style={stamp.imageUrl ? { backgroundImage: `url(${stamp.imageUrl})`, backgroundPosition: "center", backgroundSize: "cover" } : undefined}
      >
        {!stamp.imageUrl && <AppIcon name={collected ? "award" : available ? "mapPin" : "lock"} className="size-14 text-[#998452]" />}
        {!collected && <span className="absolute inset-0 bg-[#eee9da]/65 backdrop-grayscale" />}
        {!collected && <AppIcon name={available ? "mapPin" : "lock"} className="absolute size-9 text-[#817966]" />}
      </div>
      <p className="mt-4 text-[10px] font-bold tracking-[0.16em] text-[#8a7b59]">{stamp.regionEn} · {stamp.sportEn}</p>
      <h3 className="mt-1 font-bold text-[#39362d]">{stamp.courses[0]?.title ?? `${stamp.regionKo} ${stamp.sportKo} 스탬프`}</h3>
      <p className="mt-1 text-xs text-[#7d7461]">{stamp.regionKo} · {stamp.sportKo}</p>
      <p className={`mt-2 text-xs font-bold ${collected ? "text-[#238256]" : "text-[#8d846f]"}`}>
        {collected ? stamp.collectedAt?.slice(0, 10).replaceAll("-", ".") : available ? "방문 인증 가능" : "선행 조건 필요"}
      </p>
    </article>
  );
}

export function PassportPage() {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [stampbook, setStampbook] = useState<StampbookResponse | null>(null);
  const [badges, setBadges] = useState<MeBadgeResponse[]>([]);
  const [rewards, setRewards] = useState<RewardClaimResponse[]>([]);
  const [filter, setFilter] = useState<StampbookFilter>("all");
  const [tab, setTab] = useState<"stamps" | "rewards">("stamps");
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    Promise.resolve().then(async () => {
      if (!api.hasToken()) return;
      const profile = await api.me();
      setUser(profile);
      const [stampbookData, badgeData, rewardData] = await Promise.all([api.myStampbook(), api.myBadges(), api.myRewards()]);
      setStampbook(stampbookData);
      setBadges(badgeData);
      setRewards(rewardData);
    })
      .catch(() => setError("스탬프북을 불러오지 못했습니다. 잠시 후 다시 시도해 주세요."))
      .finally(() => setLoading(false));
  }, []);

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
        <h1 className="mt-5 text-2xl font-bold">로그인이 필요합니다</h1>
        <p className="mt-2 text-sm leading-6 text-white/55">로그인하면 내 스탬프 획득 현황을 확인할 수 있어요.</p>
        <Link href="/login" className="mt-6 flex h-12 items-center justify-center rounded-xl bg-[#d5ae66] font-bold text-[#171d2b]">로그인하기</Link>
      </div>
    </main>
  );

  const displayName = user.nickname || user.email.split("@")[0];
  return (
    <div className="min-h-screen bg-[#171d2b] text-white">
      <header className="border-b border-white/10 bg-[#121824] px-4 py-10 sm:px-8">
        <div className="mx-auto flex max-w-[1320px] flex-col justify-between gap-6 sm:flex-row sm:items-end">
          <div><p className="text-xs font-bold tracking-[0.2em] text-[#d5ae66]">GANGWON SPORTS PASSPORT</p><h1 className="mt-3 text-3xl font-bold sm:text-4xl">{displayName}님의 스탬프북</h1><p className="mt-3 text-sm text-white/50">승인된 방문 인증만 획득 완료로 표시됩니다.</p></div>
          <div className="grid grid-cols-4 gap-2 text-center text-xs">{FILTERS.map((item) => <div key={item.value} className="rounded-xl bg-white/[0.06] px-3 py-3"><strong className="block text-xl text-[#d5ae66]">{counts[item.value]}</strong>{item.label}</div>)}</div>
        </div>
      </header>

      <nav className="border-b border-white/10 bg-[#121824]"><div className="mx-auto flex max-w-[1320px] gap-6 px-4 sm:px-8">
        <button type="button" onClick={() => setTab("stamps")} className={`h-16 border-b-2 text-sm font-bold ${tab === "stamps" ? "border-[#d5ae66] text-[#d5ae66]" : "border-transparent text-white/40"}`}>스탬프 수집</button>
        <button type="button" onClick={() => setTab("rewards")} className={`h-16 border-b-2 text-sm font-bold ${tab === "rewards" ? "border-[#d5ae66] text-[#d5ae66]" : "border-transparent text-white/40"}`}>리워드 안내</button>
      </div></nav>

      <main className="mx-auto max-w-[1320px] px-4 py-10 sm:px-8">
        {error && <p role="alert" className="mb-6 rounded-xl border border-red-300/20 bg-red-300/10 p-4 text-sm text-red-100">{error}</p>}
        {tab === "stamps" ? <>
          <div className="flex flex-wrap gap-2">{FILTERS.map((item) => <button key={item.value} type="button" onClick={() => { setFilter(item.value); setPage(1); }} className={`rounded-full border px-4 py-2 text-sm ${filter === item.value ? "border-[#d5ae66] bg-[#d5ae66] text-[#171d2b]" : "border-white/10 text-white/55"}`}>{item.label} <span className="ml-1">{counts[item.value]}</span></button>)}</div>
          <section className="mt-8 overflow-hidden rounded-[22px] bg-[#f5f1df] text-[#2d2b24] shadow-2xl">
            <div className="flex min-h-[620px] items-center px-5 py-10 sm:px-9">{visible.length ? <div className="grid w-full grid-cols-2 gap-x-8 gap-y-12 sm:grid-cols-3">{visible.map((stamp) => <StampCard key={stamp.catalogId} stamp={stamp} />)}</div> : <div className="mx-auto text-center text-[#8d846f]"><AppIcon name="award" className="mx-auto size-12" /><p className="mt-4 font-semibold">해당 상태의 스탬프가 없습니다.</p></div>}</div>
            <div className="flex items-center justify-between border-t border-[#d5c79f] px-5 py-4 text-xs text-[#786f5d]"><button type="button" disabled={page <= 1} onClick={() => setPage((value) => value - 1)} className="disabled:opacity-25">이전</button><span>{page} / {pageCount} · {filtered.length}개</span><button type="button" disabled={page >= pageCount} onClick={() => setPage((value) => value + 1)} className="disabled:opacity-25">다음</button></div>
          </section>
        </> : <section>
          <p className="text-xs font-bold tracking-[0.2em] text-[#d5ae66]">BADGE REWARDS</p><h2 className="mt-2 text-3xl font-bold">배지 달성 리워드 안내</h2><p className="mt-3 text-sm text-white/50">현재 배지 {badges.length}개를 획득했습니다.</p>
          <div className="mt-8 grid gap-5 lg:grid-cols-3">{BADGE_REWARD_MILESTONES.map((reward) => {
            const claim = rewards.find((item) => item.milestone === `badge_${reward.threshold}`);
            const status = reward.threshold === 1 ? `${badges.length}개 획득` : claim ? REWARD_STATUS[claim.status] : "미달성";
            return <article key={reward.threshold} className="rounded-[22px] border border-white/10 bg-white/[0.04] p-7"><AppIcon name={reward.threshold === 1 ? "award" : "gift"} className="size-8 text-[#d5ae66]" /><p className="mt-6 text-xs font-bold text-[#d5ae66]">배지 {reward.threshold}개 달성 · {reward.fulfillment}</p><h3 className="mt-2 text-xl font-bold">{reward.title}</h3><p className="mt-3 text-sm leading-6 text-white/45">{reward.description}</p><p className="mt-5 text-sm font-bold">{status}</p>{claim?.status === "eligible" && <Link href="/badges" className="mt-5 inline-flex h-10 items-center rounded-xl bg-[#d5ae66] px-4 text-sm font-bold text-[#171d2b]">배송 신청하기</Link>}</article>;
          })}</div>
        </section>}
      </main>
    </div>
  );
}
