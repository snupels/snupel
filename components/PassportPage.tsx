"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { AppIcon, type AppIconName } from "./AppIcon";

type StampStatus = "completed" | "available" | "locked";

type PassportStamp = {
  id: number;
  city: string;
  title: string;
  location: string;
  date?: string;
  status: StampStatus;
  icon: AppIconName;
  color: string;
};

const stamps: PassportStamp[] = [
  { id: 1, city: "SOKCHO", title: "설악산 트레일 챌린지", location: "속초·고성", date: "2026.05.15", status: "completed", icon: "mountain", color: "#087453" },
  { id: 2, city: "PYEONGCHANG", title: "오대산 선재길 힐링 트레킹", location: "평창", date: "2026.05.08", status: "completed", icon: "activity", color: "#b64e32" },
  { id: 3, city: "YANGYANG", title: "양양 서핑 입문 코스", location: "양양", date: "2026.04.29", status: "completed", icon: "waves", color: "#2274a5" },
  { id: 4, city: "PYEONGCHANG", title: "평창 MTB 익스트림", location: "평창", date: "2026.04.20", status: "completed", icon: "medal", color: "#7046a2" },
  { id: 5, city: "GANGNEUNG", title: "강릉 해변 러닝 코스", location: "강릉", status: "available", icon: "flame", color: "#b56a2d" },
  { id: 6, city: "INJE", title: "내린천 래프팅 어드벤처", location: "인제", status: "available", icon: "waves", color: "#297b8e" },
  { id: 7, city: "CHUNCHEON", title: "춘천 호반 라이딩", location: "춘천", status: "available", icon: "person", color: "#417b54" },
  { id: 8, city: "JEONGSEON", title: "하이원 하늘길 트레킹", location: "정선", status: "available", icon: "mountain", color: "#8b613d" },
  { id: 9, city: "GOSEONG", title: "고성 통일전망대 라이딩", location: "고성", status: "locked", icon: "map", color: "#77736a" },
  { id: 10, city: "DONGHAE", title: "동해 무릉계곡 트레킹", location: "동해", status: "locked", icon: "mountain", color: "#77736a" },
  { id: 11, city: "SAMCHEOK", title: "삼척 해안 자전거길", location: "삼척", status: "locked", icon: "person", color: "#77736a" },
  { id: 12, city: "HONGCHEON", title: "홍천강 카약 챌린지", location: "홍천", status: "locked", icon: "waves", color: "#77736a" },
  { id: 13, city: "WONJU", title: "원주 소금산 출렁다리", location: "원주", status: "locked", icon: "activity", color: "#77736a" },
  { id: 14, city: "TAEBAEK", title: "태백산 정상 챌린지", location: "태백", status: "locked", icon: "mountain", color: "#77736a" },
  { id: 15, city: "CHEORWON", title: "철원 한탄강 주상절리", location: "철원", status: "locked", icon: "mapPin", color: "#77736a" },
  { id: 16, city: "HWACHEON", title: "화천 산소길 라이딩", location: "화천", status: "locked", icon: "person", color: "#77736a" },
  { id: 17, city: "YANGGU", title: "양구 펀치볼 트레킹", location: "양구", status: "locked", icon: "mountain", color: "#77736a" },
  { id: 18, city: "YEONGWOL", title: "영월 별마로 천문대", location: "영월", status: "locked", icon: "cloudSun", color: "#77736a" },
];

const filters: Array<{ value: "all" | StampStatus; label: string; count: number }> = [
  { value: "all", label: "전체", count: 18 },
  { value: "completed", label: "인증 완료", count: 4 },
  { value: "available", label: "인증 가능", count: 4 },
  { value: "locked", label: "미개방", count: 10 },
];

const PAGE_SIZE = 6;

function StampMark({ stamp }: { stamp: PassportStamp }) {
  const isLocked = stamp.status === "locked";
  const isAvailable = stamp.status === "available";

  return (
    <div className={`relative mx-auto w-full max-w-[205px] ${stamp.id % 2 === 0 ? "rotate-[1.5deg]" : "-rotate-[1.5deg]"}`}>
      <div
        className={`rounded-[20px] border-[4px] p-1.5 ${isLocked ? "border-dashed opacity-35" : ""}`}
        style={{ borderColor: stamp.color }}
      >
        <div className="rounded-[13px] border-2 px-3 py-3" style={{ borderColor: stamp.color }}>
          <div className="flex items-center justify-between text-[8px] font-bold tracking-[0.28em]" style={{ color: stamp.color }}>
            <span>GANGWON</span>
            <span>#{String(stamp.id).padStart(2, "0")}</span>
          </div>
          <div className="mt-2 flex items-center justify-center gap-2">
            <strong className="text-[22px] tracking-[0.08em]" style={{ color: stamp.color }}>{stamp.city}</strong>
            <AppIcon name={isLocked ? "bookmark" : stamp.icon} className="size-6" style={{ color: stamp.color }} />
          </div>
          <div className="mt-1 flex items-center justify-between border-t pt-1.5 text-[8px] font-bold tracking-[0.16em]" style={{ borderColor: stamp.color, color: stamp.color }}>
            <span>{isAvailable ? "READY" : isLocked ? "COMING SOON" : "VERIFIED"}</span>
            <span>KOR · 2026</span>
          </div>
        </div>
      </div>
      {isAvailable && (
        <span className="absolute -right-2 -top-2 rounded-full bg-[#c49a52] px-2 py-1 text-[9px] font-bold text-[#171d2b] shadow">
          인증 가능
        </span>
      )}
    </div>
  );
}

function StampEntry({ stamp }: { stamp: PassportStamp }) {
  return (
    <article className={`text-center ${stamp.status === "locked" ? "opacity-55" : ""}`}>
      <StampMark stamp={stamp} />
      <h3 className="mt-4 text-sm font-bold text-[#2d2b24]">{stamp.title}</h3>
      <p className="mt-1 flex items-center justify-center gap-1 text-xs text-[#8b826d]">
        <AppIcon name="mapPin" className="size-3" />
        {stamp.location}
      </p>
      <p className={`mt-1.5 text-xs font-semibold ${stamp.status === "completed" ? "text-[#24805d]" : "text-[#a0957d]"}`}>
        {stamp.date ?? (stamp.status === "available" ? "방문 인증을 기다리고 있어요" : "추후 공개 예정")}
      </p>
    </article>
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
      <div className="border-b border-white/5 bg-[#0d1422]">
        <div className="mx-auto flex max-w-[1320px] gap-12 px-5 sm:px-8">
          <button
            type="button"
            onClick={() => setTab("stamps")}
            className={`flex h-[68px] items-center gap-2 border-b-2 px-2 text-sm font-bold transition-colors ${tab === "stamps" ? "border-[#d5ae66] text-[#d5ae66]" : "border-transparent text-white/30 hover:text-white/60"}`}
          >
            도장 수집
            <span className="rounded-full bg-white/10 px-2 py-0.5 text-xs">4</span>
          </button>
          <button
            type="button"
            onClick={() => setTab("rewards")}
            className={`flex h-[68px] items-center gap-2 border-b-2 px-2 text-sm font-bold transition-colors ${tab === "rewards" ? "border-[#d5ae66] text-[#d5ae66]" : "border-transparent text-white/30 hover:text-white/60"}`}
          >
            리워드
            <span className="rounded-full bg-white/10 px-2 py-0.5 text-xs">1</span>
          </button>
        </div>
      </div>

      <main className="mx-auto max-w-[1320px] px-4 py-10 sm:px-8 sm:py-14">
        <div className="mb-8 flex items-center justify-between gap-4">
          <div>
            <p className="text-xs font-bold tracking-[0.2em] text-[#d5ae66]">MY SPORTS PASSPORT</p>
            <h1 className="mt-2 text-3xl font-bold">강원 스포츠 패스포트</h1>
          </div>
          <Link href="/mypage" className="inline-flex items-center gap-2 rounded-full border border-white/15 px-4 py-2 text-sm text-white/65 transition-colors hover:border-white/30 hover:text-white">
            <AppIcon name="chevronLeft" className="size-4" />
            마이페이지
          </Link>
        </div>

        {tab === "stamps" ? (
          <>
            <div className="flex flex-wrap gap-2.5">
              {filters.map((item) => (
                <button
                  key={item.value}
                  type="button"
                  onClick={() => selectFilter(item.value)}
                  className={`rounded-full border px-5 py-2.5 text-sm transition-colors ${filter === item.value ? "border-[#d5ae66] bg-[#d5ae66] text-[#171d2b]" : "border-white/10 bg-white/[0.04] text-white/45 hover:border-white/20 hover:text-white/70"}`}
                >
                  {item.label}
                  <span className={`ml-2 rounded-full px-2 py-0.5 text-xs ${filter === item.value ? "bg-black/10" : "bg-white/5"}`}>{item.count}</span>
                </button>
              ))}
            </div>

            <section className="mt-10 overflow-hidden rounded-[22px] bg-[#f5f1df] text-[#2d2b24] shadow-[0_22px_50px_rgba(0,0,0,0.35)]">
              <div className="flex items-center justify-between border-b border-[#c5a35f] bg-[repeating-linear-gradient(135deg,rgba(146,126,76,0.035)_0,rgba(146,126,76,0.035)_2px,transparent_2px,transparent_14px)] px-6 py-5 sm:px-10">
                <div className="flex items-center gap-3">
                  <span className="flex size-9 items-center justify-center rounded-full border border-[#b89a59] text-[#a38343]">
                    <AppIcon name="mountain" className="size-5" />
                  </span>
                  <div>
                    <p className="text-[11px] font-bold tracking-[0.3em] text-[#34845f]">GANGWON SPORTS PASSPORT</p>
                    <p className="mt-1 text-[10px] tracking-[0.18em] text-[#9e8d68]">강원 스포츠 패스포트 · 방문인증</p>
                  </div>
                </div>
                <div className="text-right text-[10px] tracking-[0.12em] text-[#9e8d68]">
                  <strong className="text-[#6f634a]">{String(page).padStart(2, "0")} / {String(pageCount).padStart(2, "0")}</strong>
                  <p className="mt-1">홍길동 · HONG GIL DONG</p>
                </div>
              </div>

              <div className="min-h-[650px] bg-[repeating-linear-gradient(135deg,rgba(146,126,76,0.025)_0,rgba(146,126,76,0.025)_1px,transparent_1px,transparent_13px)] px-5 py-12 sm:px-10 lg:px-16">
                {visibleStamps.length > 0 ? (
                  <div className="grid gap-x-12 gap-y-14 sm:grid-cols-2 lg:grid-cols-3">
                    {visibleStamps.map((stamp) => <StampEntry key={stamp.id} stamp={stamp} />)}
                  </div>
                ) : (
                  <div className="flex min-h-[500px] flex-col items-center justify-center text-[#9e947f]">
                    <AppIcon name="award" className="size-12" />
                    <p className="mt-4 font-semibold">해당 상태의 도장이 없습니다.</p>
                  </div>
                )}
              </div>

              <div className="flex items-center justify-between border-t border-[#d5c79f] px-6 py-4 text-xs text-[#8e8269] sm:px-10">
                <button type="button" disabled={page <= 1} onClick={() => setPage((current) => Math.max(1, current - 1))} className="inline-flex items-center gap-1 disabled:opacity-25">
                  <AppIcon name="chevronLeft" className="size-4" />
                  이전 페이지
                </button>
                <span>{filteredStamps.length}개의 도장</span>
                <button type="button" disabled={page >= pageCount} onClick={() => setPage((current) => Math.min(pageCount, current + 1))} className="inline-flex items-center gap-1 disabled:opacity-25">
                  다음 페이지
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
              <p className="mt-3 text-sm leading-6 text-white/55">도장 4개 수집을 완료해 강원 스포츠 웰컴 키트 교환권이 열렸습니다.</p>
              <button type="button" className="mt-7 h-11 w-full rounded-xl bg-[#d5ae66] text-sm font-bold text-[#171d2b]">리워드 확인하기</button>
            </article>
            <article className="rounded-[22px] border border-white/10 bg-white/[0.04] p-7">
              <span className="flex size-12 items-center justify-center rounded-full bg-white/10 text-white/40">
                <AppIcon name="trophy" className="size-6" />
              </span>
              <p className="mt-6 text-xs font-bold tracking-[0.2em] text-white/30">NEXT REWARD</p>
              <h2 className="mt-2 text-2xl font-bold text-white/65">스포츠 마스터 리워드</h2>
              <p className="mt-3 text-sm leading-6 text-white/35">도장 10개를 모으면 지역 스포츠 체험 할인권이 열립니다.</p>
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
