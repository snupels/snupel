"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import type { ActivityHistoryResponse, AuthUser, MeBadgeResponse, RewardClaimResponse, StampbookResponse } from "@/lib/api/dto";
import { api } from "@/lib/api/service";
import { passportLevelLabel, resolvePassportLevel } from "@/lib/passportLevel";
import { AppIcon, type AppIconName } from "./AppIcon";
import heroImage from "@/imports/LandingPage/a0d5da596bc83d9effc7a18d6702727ac6b06d43.png";

type Stat = { label: string; value: string; icon: AppIconName; accent?: boolean };

export function MyPassportPage() {
  const router = useRouter();
  const [user, setUser] = useState<AuthUser | null>(null);
  const [stampbook, setStampbook] = useState<StampbookResponse | null>(null);
  const [history, setHistory] = useState<ActivityHistoryResponse[]>([]);
  const [badges, setBadges] = useState<MeBadgeResponse[]>([]);
  const [rewards, setRewards] = useState<RewardClaimResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    Promise.resolve().then(() => api.hasToken() ? api.me() : null)
      .then((profile) => {
        if (!profile) return;
        if (profile.onboardingRequired) {
          router.replace("/onboarding");
          return;
        }
        setUser(profile);
        return Promise.all([api.myStampbook(), api.activityHistory.list({ page: 1, size: 100 }), api.myBadges(), api.myRewards()]);
      })
      .then((result) => {
        if (!result) return;
        setStampbook(result[0]);
        setHistory(result[1]);
        setBadges(result[2]);
        setRewards(result[3]);
      })
      .catch(() => setError("내 패스포트 정보를 불러오지 못했습니다."))
      .finally(() => setLoading(false));
  }, [router]);

  if (loading) return <main className="grid min-h-[60vh] place-items-center bg-[#f3f7f4] text-sm text-[#6f7a87]">나의 패스포트를 불러오는 중…</main>;
  if (!user) return (
    <main className="grid min-h-[65vh] place-items-center bg-[#f3f7f4] px-4">
      <div className="max-w-md rounded-[24px] border border-[#dfe7e1] bg-white p-8 text-center shadow-sm">
        <AppIcon name="lock" className="mx-auto size-10 text-[#008f45]" />
        <h1 className="mt-5 text-2xl font-bold">로그인이 필요합니다</h1>
        <p className="mt-2 text-sm text-[#6f7a87]">로그인하면 수집한 스탬프와 인증 내역을 확인할 수 있어요.</p>
        <Link href="/login" className="mt-6 flex h-12 items-center justify-center rounded-xl bg-[#008f45] font-bold text-white">로그인하기</Link>
      </div>
    </main>
  );

  const collected = stampbook?.items.filter((stamp) => stamp.status === "collected") ?? [];
  const submissions = history.filter((item) => item.type === "submission");
  const recent = history.slice(0, 5);
  const approved = submissions.filter((item) => item.status === "approved").length;
  const pending = submissions.filter((item) => item.status === "pending").length;
  const regions = new Set(collected.map((stamp) => stamp.regionKo)).size;
  const level = resolvePassportLevel(collected.length, approved > 0);
  const displayName = user.nickname || user.email.split("@")[0];
  const stats: Stat[] = [
    { label: "모은 스탬프", value: stampbook ? `${collected.length}개` : "—", icon: "award" },
    { label: "인증한 지역", value: stampbook ? `${regions}곳` : "—", icon: "mapPin" },
    { label: "승인된 인증", value: error ? "—" : `${approved}개`, icon: "checkCircle", accent: true },
    { label: "검토 중", value: error ? "—" : `${pending}개`, icon: "timer" },
  ];

  return (
    <div className="bg-[#f3f7f4] text-[#172033]">
      <section className="relative overflow-hidden px-4 pb-24 pt-12 sm:px-6">
        <Image src={heroImage} alt="강원 산악 전경" fill priority sizes="100vw" className="object-cover" />
        <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(11,35,28,0.9),rgba(11,35,28,0.6))]" />
        <div className="relative mx-auto grid min-h-[420px] max-w-[1180px] items-center gap-10 py-10 lg:grid-cols-[1fr_400px]">
          <div className="text-white"><span className="rounded-full bg-white/15 px-3 py-1 text-xs font-semibold">MY PASSPORT</span><h1 className="mt-5 text-4xl font-bold tracking-[-0.04em] sm:text-5xl">{displayName}님의<br />강원 스포츠 패스포트</h1><p className="mt-5 max-w-xl leading-7 text-white/80">운영자 승인이 완료된 방문 인증과 스탬프를 확인하세요.</p><div className="mt-7 flex gap-3"><Link href="/stampbook" className="inline-flex h-12 items-center rounded-xl border border-white/60 px-6 text-sm font-bold">내 스탬프북 보기</Link><Link href="/account" className="inline-flex h-12 items-center rounded-xl border border-white/60 px-6 text-sm font-bold">개인정보 수정</Link></div></div>
          <aside className="rounded-[28px] border border-white/10 bg-[#172c40]/95 p-8 text-white shadow-2xl"><p className="text-xs font-bold text-[#ffc438]">GANGWON SPORTS PASSPORT</p><h2 className="mt-2 text-2xl font-bold">{passportLevelLabel(level)}</h2><p className="mt-3 text-sm text-white/70">{level.meaning}</p><dl className="mt-7 space-y-4 text-sm"><div className="flex justify-between"><dt className="text-white/60">획득 스탬프</dt><dd className="text-xl font-bold text-[#ffc438]">{collected.length}개</dd></div><div className="flex justify-between"><dt className="text-white/60">인증 신청</dt><dd className="text-xl font-bold">{submissions.length}개</dd></div></dl><div className="mt-6 border-t border-white/10 pt-5"><p className="text-xs text-white/50">최근 활동</p><p className="mt-1 text-sm font-bold">{recent[0]?.occurredAt.slice(0, 10) ?? "아직 활동 내역이 없습니다"}</p></div></aside>
        </div>
      </section>

      <section className="relative z-10 mx-auto -mt-16 grid max-w-[1180px] gap-4 px-4 sm:grid-cols-2 sm:px-6 lg:grid-cols-4">{stats.map((stat) => <article key={stat.label} className="rounded-2xl border border-[#e0e7e2] bg-white p-6 shadow-lg"><span className={`flex size-11 items-center justify-center rounded-xl ${stat.accent ? "bg-[#fff6dc] text-[#d99f00]" : "bg-[#e7f4ec] text-[#008f45]"}`}><AppIcon name={stat.icon} className="size-5" /></span><p className="mt-5 text-sm text-[#6f7a87]">{stat.label}</p><strong className="mt-1 block text-3xl">{stat.value}</strong></article>)}</section>

      <div className="mx-auto max-w-[1180px] px-4 py-14 sm:px-6">
        {error && <p role="alert" className="mb-6 rounded-xl bg-[#fff0ed] p-4 text-sm text-[#a03d32]">{error}</p>}
        <div className="grid gap-6 lg:grid-cols-[minmax(0,1.6fr)_minmax(300px,0.9fr)]">
          <section className="rounded-[24px] border border-[#e0e7e2] bg-white p-6 sm:p-8">
            <div className="flex items-end justify-between gap-4"><div><h2 className="text-2xl font-bold">나의 강원 스탬프북</h2><p className="mt-2 text-sm text-[#6f7a87]">최근 획득했거나 인증 가능한 스탬프입니다.</p></div><Link href="/stampbook" className="text-sm font-bold text-[#008f45]">전체보기</Link></div>
            <div className="mt-7 space-y-3">
              {(stampbook?.items.slice(0, 5) ?? []).map((stamp) => {
                const complete = stamp.status === "collected";
                return <article key={stamp.catalogId} className={`flex items-center gap-4 rounded-2xl border p-5 ${complete ? "border-[#33a568] bg-[#eef9f2]" : "border-[#dde4df]"}`}><span className={`flex size-12 shrink-0 items-center justify-center rounded-full ${complete ? "bg-[#008f45] text-white" : "bg-[#f1f4f2] text-[#8a9690]"}`}><AppIcon name={complete ? "checkCircle" : stamp.status === "available" ? "mapPin" : "lock"} className="size-6" /></span><div className="min-w-0 flex-1"><h3 className="font-bold">{stamp.courses[0]?.title ?? `${stamp.regionKo} ${stamp.sportKo} 스탬프`}</h3><p className="mt-1 text-sm text-[#6f7a87]">{stamp.regionKo} · {stamp.sportKo}{stamp.collectedAt ? ` · ${stamp.collectedAt.slice(0, 10)}` : ""}</p></div><span className="text-xs font-semibold">{complete ? "획득 완료" : stamp.status === "available" ? "인증 가능" : "잠김"}</span></article>;
              })}
              {!stampbook?.items.length && <p className="rounded-2xl bg-[#f6f8f7] p-8 text-center text-sm text-[#6f7a87]">표시할 스탬프가 없습니다.</p>}
            </div>
          </section>

          <aside className="space-y-6">
            <section className="rounded-[24px] border border-[#e0e7e2] bg-white p-6"><h2 className="text-xl font-bold">최근 활동</h2><div className="mt-4 space-y-2">{recent.map((item) => <article key={item.id} className="rounded-xl bg-[#f6f8f7] p-4"><div className="flex items-center justify-between gap-3"><p className="text-xs text-[#8a9490]">{item.occurredAt.slice(0, 10)}</p><span className="text-xs font-bold text-[#008f45]">{item.status === "approved" ? "승인" : item.status === "pending" ? "검토 중" : item.status === "rejected" ? "반려" : "완료"}</span></div><p className="mt-2 text-sm font-semibold">{item.title ?? `활동 #${item.activityId}`}</p></article>)}{!recent.length && <p className="py-6 text-center text-sm text-[#6f7a87]">아직 활동 이력이 없습니다.</p>}</div><Link href="/activity-history" className="mt-5 flex h-10 items-center justify-center border-t border-[#edf0ee] pt-4 text-sm font-bold text-[#008f45]">전체 활동 보기</Link></section>
            <section className="rounded-[24px] border border-[#e0e7e2] bg-white p-6"><h2 className="text-xl font-bold">배지와 리워드</h2><p className="mt-3 text-sm leading-6 text-[#6f7a87]">배지 {badges.length}개 획득 · 리워드 {rewards.filter((item) => item.status !== "eligible").length}개 신청</p><Link href="/badges" className="mt-5 flex h-10 items-center justify-center rounded-xl border border-[#aad2b8] text-sm font-bold text-[#008f45]">내 배지 보기</Link></section>
            <Link href="/courses" className="flex items-center justify-between rounded-[24px] bg-[#008f45] p-6 text-white"><span><strong className="block text-lg">새 코스 찾아보기</strong><span className="mt-1 block text-sm text-white/70">조건에 맞는 실제 코스를 확인하세요.</span></span><AppIcon name="arrowRight" className="size-5" /></Link>
          </aside>
        </div>
      </div>
    </div>
  );
}
