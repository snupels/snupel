"use client";

import Image from "next/image";
import Link from "next/link";
import { useMemo, useState } from "react";
import { BADGE_REWARD_MILESTONES } from "@/lib/badgeRewards";
import { DEFAULT_COLLECTED_BADGE_IDS } from "@/lib/badgeCatalog";
import { AppIcon } from "./AppIcon";

type StampStatus = "completed" | "available" | "locked";

type PassportStamp = {
  id: number;
  regionKo: string;
  regionEn: string;
  sportKo: string;
  sportEn: string;
  courseName: string;
  image: string;
  date?: string;
  status: StampStatus;
};

const regions = [
  { ko: "춘천", en: "CHUNCHEON", slug: "chuncheon", landmarks: ["삼악산", "의암호", "엘리시안 강촌", "춘천 스포츠타운", "소양강"] },
  { ko: "원주", en: "WONJU", slug: "wonju", landmarks: ["치악산", "섬강", "오크밸리", "원주 종합운동장", "원주천"] },
  { ko: "강릉", en: "GANGNEUNG", slug: "gangneung", landmarks: ["대관령", "경포호", "강릉 스노우파크", "강릉 올림픽파크", "경포 해변"] },
  { ko: "동해", en: "DONGHAE", slug: "donghae", landmarks: ["무릉계곡", "망상 해변", "동해 스노우파크", "동해 웰니스파크", "추암 해변"] },
  { ko: "태백", en: "TAEBAEK", slug: "taebaek", landmarks: ["태백산", "황지연못", "태백 스노우파크", "태백 고원체육관", "고원 스포츠길"] },
  { ko: "속초", en: "SOKCHO", slug: "sokcho", landmarks: ["설악산", "영랑호", "설악 스노우파크", "속초 스포츠파크", "청초호"] },
  { ko: "삼척", en: "SAMCHEOK", slug: "samcheok", landmarks: ["덕항산", "장호항", "삼척 스노우파크", "삼척 종합운동장", "새천년 해안길"] },
  { ko: "홍천", en: "HONGCHEON", slug: "hongcheon", landmarks: ["팔봉산", "홍천강", "비발디파크", "홍천 스포츠타운", "수타사 숲길"] },
  { ko: "횡성", en: "HOENGSEONG", slug: "hoengseong", landmarks: ["태기산", "횡성호", "웰리힐리파크", "횡성 종합운동장", "섬강 둘레길"] },
  { ko: "영월", en: "YEONGWOL", slug: "yeongwol", landmarks: ["봉래산", "동강", "영월 스노우파크", "영월 스포츠파크", "청령포"] },
  { ko: "평창", en: "PYEONGCHANG", slug: "pyeongchang", landmarks: ["오대산", "평창강", "용평 스노우파크", "평창 올림픽플라자", "대관령 고원길"] },
  { ko: "정선", en: "JEONGSEON", slug: "jeongseon", landmarks: ["민둥산", "동강 정선", "하이원 스노우파크", "정선 스포츠타운", "아리랑 러닝길"] },
  { ko: "철원", en: "CHEORWON", slug: "cheorwon", landmarks: ["명성산", "한탄강", "철원 스노우파크", "철원 종합운동장", "주상절리길"] },
  { ko: "화천", en: "HWACHEON", slug: "hwacheon", landmarks: ["용화산", "파로호", "화천 산천어파크", "화천 생활체육공원", "북한강"] },
  { ko: "양구", en: "YANGGU", slug: "yanggu", landmarks: ["대암산", "파로호 양구", "양구 스노우파크", "양구 종합운동장", "한반도섬"] },
  { ko: "인제", en: "INJE", slug: "inje", landmarks: ["점봉산", "내린천", "인제 스노우파크", "인제 스포츠타운", "자작나무숲"] },
  { ko: "고성", en: "GOSEONG", slug: "goseong", landmarks: ["설악산 북부", "송지호", "고성 스노우파크", "고성 종합운동장", "통일전망대 해안길"] },
  { ko: "양양", en: "YANGYANG", slug: "yangyang", landmarks: ["오색 주전골", "죽도 해변", "양양 스노우파크", "양양 종합운동장", "낙산 해변"] },
] as const;

const sports = [
  { ko: "산악", en: "MOUNTAIN", slug: "mountain", suffix: "트레일 챌린지" },
  { ko: "수상", en: "WATER", slug: "water", suffix: "워터 어드벤처" },
  { ko: "설상", en: "SNOW", slug: "snow", suffix: "스노우 챌린지" },
  { ko: "올림픽", en: "OLYMPIC", slug: "olympic", suffix: "올림픽 스포츠 투어" },
  { ko: "육상", en: "ATHLETICS", slug: "athletics", suffix: "러닝 챌린지" },
] as const;

const completedDates = ["2026.05.15", "2026.05.08", "2026.04.29", "2026.04.20"];

const stamps: PassportStamp[] = regions.flatMap((region, regionIndex) =>
  sports.map((sport, sportIndex) => {
    const id = regionIndex * sports.length + sportIndex + 1;
    const status: StampStatus = id <= 4 ? "completed" : id <= 8 ? "available" : "locked";
    const fileName = `${String(id).padStart(2, "0")}-${region.slug}-${sport.slug}.svg`;

    return {
      id,
      regionKo: region.ko,
      regionEn: region.en,
      sportKo: sport.ko,
      sportEn: sport.en,
      courseName: `${region.landmarks[sportIndex]} ${sport.suffix}`,
      image: `/stampbook-stamps/${fileName}`,
      date: completedDates[id - 1],
      status,
    };
  }),
);

const statusLabels: Record<StampStatus, string> = {
  completed: "인증 완료",
  available: "인증 가능",
  locked: "미개방",
};

const PAGE_SIZE = 6;
const stampRotations = [
  "-rotate-[2.2deg]",
  "rotate-[1.4deg]",
  "-rotate-[0.8deg]",
  "rotate-[2.1deg]",
  "-rotate-[1.5deg]",
  "rotate-[0.7deg]",
] as const;
const completedCount = stamps.filter((stamp) => stamp.status === "completed").length;
const availableCount = stamps.filter((stamp) => stamp.status === "available").length;
const lockedCount = stamps.filter((stamp) => stamp.status === "locked").length;
const collectedBadgeCount = DEFAULT_COLLECTED_BADGE_IDS.length;

const filters: Array<{ value: "all" | StampStatus; label: string; count: number }> = [
  { value: "all", label: "전체", count: stamps.length },
  { value: "completed", label: statusLabels.completed, count: completedCount },
  { value: "available", label: statusLabels.available, count: availableCount },
  { value: "locked", label: statusLabels.locked, count: lockedCount },
];

function StampEntry({ stamp }: { stamp: PassportStamp }) {
  const isLocked = stamp.status === "locked";
  const rotation = stampRotations[(stamp.id - 1) % stampRotations.length];

  return (
    <article className={`relative text-center ${isLocked ? "opacity-45 grayscale" : ""}`}>
      <div className={`relative mx-auto aspect-[5/3] w-full max-w-[240px] ${rotation}`}>
        <Image
          src={stamp.image}
          alt={`${stamp.regionKo} ${stamp.sportKo} 스탬프`}
          fill
          sizes="(max-width: 640px) 42vw, 240px"
          className="object-contain opacity-90 mix-blend-multiply"
        />
        {isLocked && (
          <span className="absolute inset-0 flex items-center justify-center">
            <span className="flex size-9 items-center justify-center rounded-full bg-[#2d2b24]/70 text-white">
              <AppIcon name="lock" className="size-4" />
            </span>
          </span>
        )}
      </div>

      <div className="mt-3">
        <h3 className="text-sm font-bold text-[#2d2b24]">
          {stamp.courseName}
        </h3>
        <p className="mt-1 text-[10px] font-bold tracking-[0.14em] text-[#9a8c70]">
          {stamp.regionEn} · {stamp.sportEn}
        </p>
        <p
          className={`mt-1.5 text-xs font-semibold ${
            stamp.status === "completed"
              ? "text-[#24805d]"
              : stamp.status === "available"
                ? "text-[#b07b31]"
                : "text-[#9d9584]"
          }`}
        >
          {stamp.date ?? statusLabels[stamp.status]}
        </p>
      </div>
    </article>
  );
}

function PassportHeader() {
  return (
    <header className="bg-[linear-gradient(135deg,#0b1220_0%,#111a2a_55%,#0c1422_100%)]">
      <div className="mx-auto max-w-[1320px] px-5 pb-9 pt-7 sm:px-8 sm:pb-11 sm:pt-9">
        <Link
          href="/mypage"
          className="inline-flex items-center gap-2 text-sm text-white/45 transition-colors hover:text-white/80"
        >
          <AppIcon name="chevronLeft" className="size-4" />
          내 패스포트로
        </Link>

        <div className="mt-8 flex flex-col justify-between gap-8 lg:flex-row lg:items-center">
          <div>
            <div className="flex items-center gap-5">
              <span className="flex size-16 shrink-0 items-center justify-center rounded-full border border-[#d5ae66]/60 bg-[#d5ae66]/10 text-[#d5ae66] sm:size-[72px]">
                <AppIcon name="mountain" className="size-8" />
              </span>
              <div>
                <h1 className="text-3xl font-black tracking-[-0.03em] text-white sm:text-[40px]">
                  SPORTS PASSPORT
                </h1>
                <p className="mt-1 text-sm tracking-[0.18em] text-white/35">강원 스포츠 패스포트</p>
              </div>
            </div>

            <div className="mt-7 flex flex-wrap items-center gap-x-4 gap-y-2 text-sm text-white/35">
              <span>
                소지인 <strong className="ml-2 text-white/80">패스포트 회원</strong>
              </span>
              <span className="hidden h-4 w-px bg-white/15 sm:block" />
              <span>
                발급일 <strong className="ml-2 font-medium text-white/65">2026.01.01</strong>
              </span>
            </div>
          </div>

          <div className="grid w-full grid-cols-3 gap-2.5 lg:w-auto lg:gap-4">
            {[
              { value: completedCount, suffix: ` / ${stamps.length}`, label: "인증 도장" },
              { value: collectedBadgeCount, suffix: "개", label: "획득 배지" },
              { value: availableCount, suffix: "개", label: "인증 가능" },
            ].map((stat) => (
              <div
                key={stat.label}
                className="flex min-h-[94px] min-w-0 flex-col items-center justify-center rounded-2xl border border-white/10 bg-white/[0.045] px-3 text-center sm:min-w-[128px]"
              >
                <p className="text-2xl font-light text-white sm:text-3xl">
                  {stat.value}
                  <span className="ml-1 text-xs text-white/30">{stat.suffix}</span>
                </p>
                <p className="mt-2 text-xs text-white/35">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </header>
  );
}

export function PassportPage() {
  const [tab, setTab] = useState<"stamps" | "rewards">("stamps");
  const [filter, setFilter] = useState<"all" | StampStatus>("all");
  const [page, setPage] = useState(1);

  const filteredStamps = useMemo(
    () => stamps.filter((stamp) => filter === "all" || stamp.status === filter),
    [filter],
  );
  const pageCount = Math.max(1, Math.ceil(filteredStamps.length / PAGE_SIZE));
  const visibleStamps = filteredStamps.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  function selectFilter(nextFilter: "all" | StampStatus) {
    setFilter(nextFilter);
    setPage(1);
  }

  return (
    <div className="min-h-screen bg-[#111827] text-white">
      <PassportHeader />

      <div className="border-y border-white/5 bg-[#111827]">
        <div className="mx-auto flex max-w-[1320px] gap-10 px-5 sm:px-8">
          <button
            type="button"
            onClick={() => setTab("stamps")}
            className={`flex h-[64px] items-center gap-2 border-b-2 px-2 text-sm font-bold transition-colors ${
              tab === "stamps"
                ? "border-[#d5ae66] text-[#d5ae66]"
                : "border-transparent text-white/30 hover:text-white/60"
            }`}
          >
            도장 수집
            <span className="rounded-full bg-white/10 px-2 py-0.5 text-xs">{completedCount}</span>
          </button>
          <button
            type="button"
            onClick={() => setTab("rewards")}
            className={`flex h-[64px] items-center gap-2 border-b-2 px-2 text-sm font-bold transition-colors ${
              tab === "rewards"
                ? "border-[#d5ae66] text-[#d5ae66]"
                : "border-transparent text-white/30 hover:text-white/60"
            }`}
          >
            리워드
            <span className="rounded-full bg-white/10 px-2 py-0.5 text-xs">{BADGE_REWARD_MILESTONES.length}</span>
          </button>
        </div>
      </div>

      <main className="mx-auto max-w-[1320px] px-4 py-9 sm:px-8 sm:py-11">
        {tab === "stamps" ? (
          <>
            <div className="flex flex-wrap gap-2.5">
              {filters.map((item) => (
                <button
                  key={item.value}
                  type="button"
                  onClick={() => selectFilter(item.value)}
                  className={`rounded-full border px-5 py-2.5 text-sm transition-colors ${
                    filter === item.value
                      ? "border-[#d5ae66] bg-[#d5ae66] text-[#171d2b]"
                      : "border-white/10 bg-white/[0.04] text-white/45 hover:border-white/20 hover:text-white/70"
                  }`}
                >
                  {item.label}
                  <span
                    className={`ml-2 rounded-full px-2 py-0.5 text-xs ${
                      filter === item.value ? "bg-black/10" : "bg-white/5"
                    }`}
                  >
                    {item.count}
                  </span>
                </button>
              ))}
            </div>

            <section className="mt-8 overflow-hidden rounded-[22px] bg-[#f5f1df] text-[#2d2b24] shadow-[0_22px_50px_rgba(0,0,0,0.35)]">
              <div className="flex items-center justify-between border-b border-[#c5a35f] bg-[repeating-linear-gradient(135deg,rgba(146,126,76,0.035)_0,rgba(146,126,76,0.035)_2px,transparent_2px,transparent_14px)] px-5 py-5 sm:px-9">
                <div className="flex items-center gap-3">
                  <span className="flex size-9 items-center justify-center rounded-full border border-[#b89a59] text-[#a38343]">
                    <AppIcon name="mountain" className="size-5" />
                  </span>
                  <div>
                    <p className="text-[10px] font-bold tracking-[0.23em] text-[#34845f] sm:text-[11px]">
                      GANGWON SPORTS PASSPORT
                    </p>
                    <p className="mt-1 text-[9px] tracking-[0.14em] text-[#9e8d68] sm:text-[10px]">
                      강원 스포츠 패스포트 · 방문 인증
                    </p>
                  </div>
                </div>
                <div className="text-right text-[10px] tracking-[0.1em] text-[#9e8d68]">
                  <strong className="text-[#6f634a]">
                    {String(page).padStart(2, "0")} / {String(pageCount).padStart(2, "0")}
                  </strong>
                  <p className="mt-1 hidden sm:block">PASSPORT MEMBER</p>
                </div>
              </div>

              <div className="min-h-[680px] bg-[repeating-linear-gradient(135deg,rgba(146,126,76,0.025)_0,rgba(146,126,76,0.025)_1px,transparent_1px,transparent_13px)] px-4 py-10 sm:px-8 lg:px-10">
                {visibleStamps.length > 0 ? (
                  <div className="mx-auto grid max-w-[880px] grid-cols-2 gap-x-8 gap-y-12 sm:gap-x-20 sm:gap-y-14">
                    {visibleStamps.map((stamp) => (
                      <StampEntry key={stamp.id} stamp={stamp} />
                    ))}
                  </div>
                ) : (
                  <div className="flex min-h-[460px] flex-col items-center justify-center text-[#9e947f]">
                    <AppIcon name="award" className="size-12" />
                    <p className="mt-4 font-semibold">해당 상태의 도장이 없습니다.</p>
                  </div>
                )}
              </div>

              <div className="flex items-center justify-between border-t border-[#d5c79f] px-5 py-4 text-xs text-[#8e8269] sm:px-9">
                <button
                  type="button"
                  disabled={page <= 1}
                  onClick={() => setPage((current) => Math.max(1, current - 1))}
                  className="inline-flex items-center gap-1 disabled:opacity-25"
                >
                  <AppIcon name="chevronLeft" className="size-4" />
                  이전
                </button>
                <span>{filteredStamps.length}개의 도장</span>
                <button
                  type="button"
                  disabled={page >= pageCount}
                  onClick={() => setPage((current) => Math.min(pageCount, current + 1))}
                  className="inline-flex items-center gap-1 disabled:opacity-25"
                >
                  다음
                  <AppIcon name="chevronRight" className="size-4" />
                </button>
              </div>
            </section>
          </>
        ) : (
          <section>
            <div>
              <p className="text-xs font-bold tracking-[0.2em] text-[#d5ae66]">BADGE REWARDS</p>
              <h2 className="mt-2 text-3xl font-bold">배지를 모을수록 커지는 리워드</h2>
              <p className="mt-3 text-sm text-white/45">현재 획득한 배지 {collectedBadgeCount}개 · 전체 배지 12개</p>
            </div>
            <div className="mt-8 grid gap-5 lg:grid-cols-3">
              {BADGE_REWARD_MILESTONES.map((reward) => {
                const achieved = collectedBadgeCount >= reward.threshold;
                const progress = Math.min(100, (collectedBadgeCount / reward.threshold) * 100);
                const remaining = Math.max(0, reward.threshold - collectedBadgeCount);

                return (
                  <article
                    key={reward.threshold}
                    className={`rounded-[22px] border p-7 ${
                      achieved
                        ? "border-[#d5ae66]/40 bg-[linear-gradient(145deg,#2a2530,#161e2e)] shadow-xl"
                        : "border-white/10 bg-white/[0.04]"
                    }`}
                  >
                    <div className="flex items-start justify-between gap-4">
                      <span className={`flex size-12 items-center justify-center rounded-full ${achieved ? "bg-[#d5ae66] text-[#171d2b]" : "bg-white/10 text-white/40"}`}>
                        <AppIcon name={reward.threshold === 1 ? "award" : "gift"} className="size-6" />
                      </span>
                      <span className={`rounded-full px-3 py-1 text-xs font-bold ${achieved ? "bg-[#d5ae66]/15 text-[#d5ae66]" : "bg-white/5 text-white/35"}`}>
                        {achieved ? "달성 완료" : `${remaining}개 남음`}
                      </span>
                    </div>
                    <p className={`mt-6 text-xs font-bold tracking-[0.14em] ${achieved ? "text-[#d5ae66]" : "text-white/30"}`}>
                      배지 {reward.threshold}개 달성 · {reward.fulfillment}
                    </p>
                    <h3 className={`mt-2 text-xl font-bold ${achieved ? "text-white" : "text-white/65"}`}>{reward.title}</h3>
                    <p className={`mt-3 min-h-12 text-sm leading-6 ${achieved ? "text-white/55" : "text-white/35"}`}>{reward.description}</p>
                    <div className="mt-6 h-2 overflow-hidden rounded-full bg-white/10">
                      <div className="h-full rounded-full bg-[#d5ae66]" style={{ width: `${progress}%` }} />
                    </div>
                    <p className="mt-2 text-right text-xs text-white/35">{Math.min(collectedBadgeCount, reward.threshold)} / {reward.threshold}</p>
                  </article>
                );
              })}
            </div>
          </section>
        )}
      </main>
    </div>
  );
}
