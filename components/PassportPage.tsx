"use client";

import Image from "next/image";
import Link from "next/link";
import { useMemo, useState } from "react";
import { AppIcon } from "./AppIcon";

type StampStatus = "completed" | "available" | "locked";

type PassportStamp = {
  id: number;
  regionKo: string;
  regionEn: string;
  sportKo: string;
  sportEn: string;
  image: string;
  date?: string;
  status: StampStatus;
};

const regions = [
  { ko: "춘천", en: "CHUNCHEON", slug: "chuncheon" },
  { ko: "원주", en: "WONJU", slug: "wonju" },
  { ko: "강릉", en: "GANGNEUNG", slug: "gangneung" },
  { ko: "동해", en: "DONGHAE", slug: "donghae" },
  { ko: "태백", en: "TAEBAEK", slug: "taebaek" },
  { ko: "속초", en: "SOKCHO", slug: "sokcho" },
  { ko: "삼척", en: "SAMCHEOK", slug: "samcheok" },
  { ko: "홍천", en: "HONGCHEON", slug: "hongcheon" },
  { ko: "횡성", en: "HOENGSEONG", slug: "hoengseong" },
  { ko: "영월", en: "YEONGWOL", slug: "yeongwol" },
  { ko: "평창", en: "PYEONGCHANG", slug: "pyeongchang" },
  { ko: "정선", en: "JEONGSEON", slug: "jeongseon" },
  { ko: "철원", en: "CHEORWON", slug: "cheorwon" },
  { ko: "화천", en: "HWACHEON", slug: "hwacheon" },
  { ko: "양구", en: "YANGGU", slug: "yanggu" },
  { ko: "인제", en: "INJE", slug: "inje" },
  { ko: "고성", en: "GOSEONG", slug: "goseong" },
  { ko: "양양", en: "YANGYANG", slug: "yangyang" },
] as const;

const sports = [
  { ko: "산악", en: "MOUNTAIN", slug: "mountain" },
  { ko: "수상", en: "WATER", slug: "water" },
  { ko: "설상", en: "SNOW", slug: "snow" },
  { ko: "올림픽", en: "OLYMPIC", slug: "olympic" },
  { ko: "육상", en: "ATHLETICS", slug: "athletics" },
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
      image: `/stamps/${fileName}`,
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
          {stamp.regionKo} {stamp.sportKo} 스탬프
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
              { value: 1, suffix: "개", label: "보유 리워드" },
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
            <span className="rounded-full bg-white/10 px-2 py-0.5 text-xs">1</span>
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
          <section className="grid gap-6 sm:grid-cols-2">
            <article className="rounded-[22px] border border-[#d5ae66]/30 bg-[linear-gradient(145deg,#2a2530,#161e2e)] p-7 shadow-xl">
              <span className="flex size-12 items-center justify-center rounded-full bg-[#d5ae66] text-[#171d2b]">
                <AppIcon name="gift" className="size-6" />
              </span>
              <p className="mt-6 text-xs font-bold tracking-[0.2em] text-[#d5ae66]">AVAILABLE REWARD</p>
              <h2 className="mt-2 text-2xl font-bold">강원 Explorer 리워드</h2>
              <p className="mt-3 text-sm leading-6 text-white/55">
                도장 4개 수집을 완료해 강원 스포츠 한정 세트 교환권이 열렸습니다.
              </p>
              <button
                type="button"
                className="mt-7 h-11 w-full rounded-xl bg-[#d5ae66] text-sm font-bold text-[#171d2b]"
              >
                리워드 확인하기
              </button>
            </article>
            <article className="rounded-[22px] border border-white/10 bg-white/[0.04] p-7">
              <span className="flex size-12 items-center justify-center rounded-full bg-white/10 text-white/40">
                <AppIcon name="trophy" className="size-6" />
              </span>
              <p className="mt-6 text-xs font-bold tracking-[0.2em] text-white/30">LOCKED REWARD</p>
              <h2 className="mt-2 text-2xl font-bold text-white/65">스포츠 마스터 리워드</h2>
              <p className="mt-3 text-sm leading-6 text-white/35">
                도장 10개를 모으면 지역 스포츠 체험 할인권이 열립니다.
              </p>
              <div className="mt-7 h-2 overflow-hidden rounded-full bg-white/10">
                <div className="h-full w-[40%] rounded-full bg-[#d5ae66]/70" />
              </div>
              <p className="mt-2 text-right text-xs text-white/30">4 / 10</p>
            </article>
          </section>
        )}
      </main>
    </div>
  );
}
