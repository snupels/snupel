"use client";

import Image, { type StaticImageData } from "next/image";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { api } from "@/lib/api/service";
import { AppIcon, type AppIconName } from "./AppIcon";
import course1 from "@/imports/LandingPage/205ec17d713405bedcfab3cf69b55f31151a8bf3.png";
import course2 from "@/imports/LandingPage/9509675bc89588078354909012b6022f47332ef9.png";
import course3 from "@/imports/LandingPage/9193ff8f95dcbcb73f018d079496fad4bcfa1dec.png";
import course4 from "@/imports/LandingPage/8e9a5a4d4cc419ba26665781de8936f2c62517a7.png";

type ActivityStatus = "인증 완료" | "도장 획득" | "저장";

type MissionActivity = {
  id: string;
  date: string;
  title: string;
  place: string;
  status: ActivityStatus;
  icon: AppIconName;
  image: StaticImageData;
};

const fallbackActivities: MissionActivity[] = [
  { id: "fallback-1", date: "2026.05.15", title: "설악산 트레일 챌린지", place: "속초 · 고성", status: "인증 완료", icon: "checkCircle", image: course1 },
  { id: "fallback-2", date: "2026.05.10", title: "오대산 선재길 힐링 트레킹", place: "평창", status: "도장 획득", icon: "award", image: course2 },
  { id: "fallback-3", date: "2026.05.02", title: "평창 MTB 익스트림", place: "평창", status: "저장", icon: "bookmark", image: course3 },
  { id: "fallback-4", date: "2026.04.29", title: "양양 서핑 입문 코스", place: "양양", status: "인증 완료", icon: "checkCircle", image: course4 },
];

const filters: Array<"전체" | ActivityStatus> = ["전체", "인증 완료", "도장 획득", "저장"];
const feedImages = [course1, course2, course3, course4];

function formatActivityDate(value: string) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value.slice(0, 10).replaceAll("-", ".");
  return new Intl.DateTimeFormat("ko-KR", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  })
    .format(date)
    .replaceAll(" ", "")
    .replace(/\.$/, "");
}

export function ActivityHistoryPage() {
  const [activities, setActivities] = useState(fallbackActivities);
  const [filter, setFilter] = useState<"전체" | ActivityStatus>("전체");
  const [query, setQuery] = useState("");

  useEffect(() => {
    if (!api.hasToken()) return;

    api.activities
      .list()
      .then((items) => {
        if (items.length === 0) return;
        setActivities(
          items
            .map((item, index) => ({
              id: `activity-${item.id}`,
              date: formatActivityDate(item.createdAt),
              title: item.sportName ?? item.placeName ?? `스포츠 미션 #${item.id}`,
              place: [item.region, item.placeName].filter(Boolean).join(" · ") || "강원특별자치도",
              status: "인증 완료" as const,
              icon: "checkCircle" as const,
              image: feedImages[index % feedImages.length],
            }))
            .sort((a, b) => b.date.localeCompare(a.date)),
        );
      })
      .catch(() => undefined);
  }, []);

  const visibleActivities = useMemo(() => {
    const normalizedQuery = query.trim().toLocaleLowerCase("ko-KR");
    return activities.filter((activity) => {
      const matchesFilter = filter === "전체" || activity.status === filter;
      const matchesQuery =
        normalizedQuery.length === 0 ||
        [activity.title, activity.place, activity.status]
          .join(" ")
          .toLocaleLowerCase("ko-KR")
          .includes(normalizedQuery);
      return matchesFilter && matchesQuery;
    });
  }, [activities, filter, query]);
  const completedCount = activities.filter((activity) => activity.status === "인증 완료").length;
  const stampCount = activities.filter((activity) => activity.status === "도장 획득").length;
  const uniquePlaces = new Set(activities.map((activity) => activity.place)).size;

  return (
    <div className="min-h-screen bg-[#f3f7f4] text-[#172033]">
      <main className="mx-auto max-w-[1080px] px-5 pb-20 pt-10 sm:px-8 sm:pt-14">
        <Link href="/mypage" className="inline-flex items-center gap-2 text-sm font-semibold text-[#637069] transition-colors hover:text-[#008f45]">
          <AppIcon name="chevronLeft" className="size-5" />
          마이페이지로 돌아가기
        </Link>

        <header className="mt-8 overflow-hidden rounded-[28px] bg-[linear-gradient(135deg,#006f3b,#009b52)] px-6 py-8 text-white shadow-[0_18px_40px_rgba(0,111,59,0.2)] sm:px-10 sm:py-10">
          <div className="flex flex-col justify-between gap-8 sm:flex-row sm:items-end">
            <div>
              <span className="flex size-12 items-center justify-center rounded-2xl bg-white/15">
                <AppIcon name="clipboard" className="size-6" />
              </span>
              <p className="mt-6 text-xs font-bold tracking-[0.18em] text-white/60">MY ACTIVITY HISTORY</p>
              <h1 className="mt-2 text-3xl font-bold tracking-[-0.04em] sm:text-4xl">나의 인증 활동</h1>
              <p className="mt-3 text-sm text-white/70">지금까지 참여하고 인증한 강원 스포츠 미션을 모아봤어요.</p>
            </div>
            <div className="grid grid-cols-3 gap-2 sm:gap-3">
              {[
                { value: completedCount, label: "인증 완료" },
                { value: stampCount, label: "도장 획득" },
                { value: uniquePlaces, label: "활동 장소" },
              ].map((stat) => (
                <div key={stat.label} className="min-w-[82px] rounded-2xl bg-white/10 px-3 py-4 text-center backdrop-blur sm:min-w-[100px]">
                  <strong className="text-2xl">{stat.value}</strong>
                  <p className="mt-1 text-[11px] text-white/60">{stat.label}</p>
                </div>
              ))}
            </div>
          </div>
        </header>

        <section className="mx-auto mt-8 max-w-[780px]">
          <div className="relative">
            <AppIcon name="search" className="pointer-events-none absolute left-4 top-1/2 size-5 -translate-y-1/2 text-[#89958e]" />
            <input
              type="search"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="코스명, 지역, 인증 상태 검색"
              aria-label="인증 활동 검색"
              className="h-13 w-full rounded-2xl border border-[#d7e2db] bg-white pl-12 pr-4 text-sm outline-none transition-all placeholder:text-[#9aa49e] focus:border-[#008f45] focus:ring-4 focus:ring-[#008f45]/10"
            />
          </div>

          <div className="mt-4 flex flex-wrap gap-2">
            {filters.map((item) => {
              const count = item === "전체" ? activities.length : activities.filter((activity) => activity.status === item).length;
              return (
                <button
                  key={item}
                  type="button"
                  onClick={() => setFilter(item)}
                  className={`cursor-pointer rounded-full border px-4 py-2 text-sm font-semibold transition-colors ${
                    filter === item
                      ? "border-[#008f45] bg-[#008f45] text-white"
                      : "border-[#d9e3dd] bg-white text-[#657169] hover:border-[#93c6a7] hover:text-[#008f45]"
                  }`}
                >
                  {item} <span className="ml-1 text-xs opacity-70">{count}</span>
                </button>
              );
            })}
          </div>

          <div className="mt-4 flex items-center justify-between text-sm text-[#7c8781]">
            <p>인증 활동 <strong className="text-[#172033]">{visibleActivities.length}개</strong></p>
            {(query || filter !== "전체") && (
              <button
                type="button"
                onClick={() => {
                  setQuery("");
                  setFilter("전체");
                }}
                className="cursor-pointer font-semibold text-[#008f45] hover:text-[#006d35]"
              >
                검색 초기화
              </button>
            )}
          </div>

          <div className="mt-4 space-y-5">
            {visibleActivities.length > 0 ? (
              visibleActivities.map((activity) => {
                const completed = activity.status === "인증 완료";
                const stamped = activity.status === "도장 획득";
                return (
                  <article key={activity.id} className="overflow-hidden rounded-[24px] border border-[#dce5df] bg-white shadow-[0_8px_26px_rgba(23,32,51,0.06)]">
                    <header className="flex items-center justify-between gap-4 px-5 py-4 sm:px-6">
                      <div className="flex min-w-0 items-center gap-3">
                        <span className="flex size-10 shrink-0 items-center justify-center rounded-full bg-[#008f45] text-sm font-bold text-white">강원</span>
                        <div className="min-w-0">
                          <p className="truncate text-sm font-bold">강원 스포츠 패스포트</p>
                          <p className="mt-0.5 text-xs text-[#8a9490]">{activity.date}</p>
                        </div>
                      </div>
                      <span className={`shrink-0 rounded-full px-3 py-1 text-xs font-bold ${
                        completed
                          ? "bg-[#e5f5eb] text-[#008f45]"
                          : stamped
                            ? "bg-[#fff5d9] text-[#c28e00]"
                            : "bg-[#eef1ef] text-[#6d7872]"
                      }`}>
                        {activity.status}
                      </span>
                    </header>

                    <div className="relative aspect-[16/8] overflow-hidden bg-[#e8eeea]">
                      <Image src={activity.image} alt={`${activity.title} 활동 사진`} fill sizes="(max-width: 780px) 100vw, 780px" className="object-cover transition-transform duration-500 hover:scale-[1.02]" />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/45 via-transparent to-transparent" />
                      <span className={`absolute bottom-4 left-4 flex size-11 items-center justify-center rounded-full shadow-lg ${
                        completed
                          ? "bg-[#008f45] text-white"
                          : stamped
                            ? "bg-[#ffc438] text-[#493600]"
                            : "bg-white text-[#637069]"
                      }`}>
                        <AppIcon name={activity.icon} className="size-5" />
                      </span>
                    </div>

                    <div className="px-5 py-5 sm:px-6">
                      <h2 className="text-xl font-bold tracking-[-0.02em]">{activity.title}</h2>
                      <p className="mt-3 flex items-center gap-1.5 text-sm text-[#6f7a74]">
                        <AppIcon name="mapPin" className="size-4 text-[#008f45]" />
                        {activity.place}
                      </p>
                      <div className="mt-5 flex items-center justify-between border-t border-[#edf1ee] pt-4 text-sm">
                        <span className="inline-flex items-center gap-2 font-semibold text-[#008f45]">
                          <AppIcon name={completed ? "checkCircle" : stamped ? "award" : "bookmark"} className="size-4" />
                          {completed ? "미션 인증 기록" : stamped ? "도장 획득 기록" : "저장한 미션"}
                        </span>
                        <span className="text-xs text-[#9aa49e]">GANGWON 2026</span>
                      </div>
                    </div>
                  </article>
                );
              })
            ) : (
              <div className="flex min-h-[280px] flex-col items-center justify-center rounded-[24px] border border-[#dce5df] bg-white text-[#8b9690]">
                <AppIcon name="clipboard" className="size-11" />
                <p className="mt-4 font-semibold">검색 결과가 없습니다.</p>
              </div>
            )}
          </div>
        </section>
      </main>
    </div>
  );
}
