"use client";

import Image, { type StaticImageData } from "next/image";
import { useState } from "react";
import { AppIcon, type AppIconName } from "./AppIcon";
import heroImage from "@/imports/LandingPage/a0d5da596bc83d9effc7a18d6702727ac6b06d43.png";
import eventImage1 from "@/imports/LandingPage/205ec17d713405bedcfab3cf69b55f31151a8bf3.png";
import eventImage2 from "@/imports/LandingPage/9193ff8f95dcbcb73f018d079496fad4bcfa1dec.png";
import eventImage3 from "@/imports/LandingPage/a92d1f052a5f15d9f49f62dad2a919d5f418da27.png";
import eventImage4 from "@/imports/LandingPage/9509675bc89588078354909012b6022f47332ef9.png";

const categories: Array<{ icon: AppIconName; title: string; description: string }> = [
  { icon: "mountain", title: "산악 스포츠", description: "산악자전거 · 트레일 러닝" },
  { icon: "snowflake", title: "빙상 스포츠", description: "스키 · 스노보드" },
  { icon: "waves", title: "수상 스포츠", description: "래프팅 · 카약 · 보트" },
  { icon: "person", title: "육상 스포츠", description: "마라톤 · 트레킹 · 워킹" },
  { icon: "olympicRings", title: "올림픽 레거시", description: "스키점프 · 경기장 투어" },
];

const heroChallenges: Array<{
  image: StaticImageData;
  tag: string;
  title: string;
  description: string;
  date: string;
  location: string;
}> = [
  {
    image: heroImage,
    tag: "진행중",
    title: "2026 강원 트레일 챌린지",
    description: "푸른 산을 달리고, 고성봉을 오르며 강원의 자연을 온몸으로 만끽하세요.",
    date: "2026.06.03 ~ 2026.08.31",
    location: "강원특별자치도 산악지역 전역",
  },
  {
    image: eventImage2,
    tag: "참가 모집중",
    title: "평창 MTB 익스트림 2026",
    description: "평창의 시원한 고원과 숲길을 가르며 짜릿한 라이딩에 도전해 보세요.",
    date: "2026.06.20 ~ 2026.08.16",
    location: "평창군 MTB 코스 일대",
  },
  {
    image: eventImage3,
    tag: "진행중",
    title: "인제 내린천 워터 챌린지",
    description: "내린천의 힘찬 물살을 따라 강원의 여름을 가장 역동적으로 즐겨보세요.",
    date: "2026.07.01 ~ 2026.08.31",
    location: "인제군 내린천 일대",
  },
  {
    image: eventImage4,
    tag: "참가 모집중",
    title: "강릉 올림픽 레거시 투어",
    description: "동계올림픽의 감동이 남아 있는 경기장을 걸으며 특별한 도장을 모아보세요.",
    date: "2026.06.13 ~ 2026.10.31",
    location: "강릉 올림픽파크 및 경기장",
  },
];

const events: Array<{ image: StaticImageData; tag: string; title: string; date: string; reward: string }> = [
  { image: eventImage1, tag: "트레일런", title: "양양 서프 트레일 2026", date: "2026.05.16 ~ 06.18", reward: "MTB 코스 완주 스탬프" },
  { image: eventImage2, tag: "MTB", title: "청산 MTB 페스티벌 2026", date: "2026.05.17", reward: "MTB 코스 완주 스탬프" },
  { image: eventImage3, tag: "축제", title: "인제 내린천 래프팅 축제", date: "2026.06.20 ~ 06.22", reward: "래프팅 체험 스탬프" },
  { image: eventImage4, tag: "MTB", title: "강촌 바이크래 페스티벌", date: "2026.05.23 ~ 06.29", reward: "코인 앱 완주 스탬프" },
];

const quickLinks: Array<{ icon: AppIconName; title: string; description: string }> = [
  { icon: "newspaper", title: "스포츠 뉴스", description: "강원 스포츠 최신 소식" },
  { icon: "map", title: "코스 지도", description: "지역별 코스 안내" },
  { icon: "trophy", title: "대회 일정", description: "2026 대회 전체 일정" },
  { icon: "clipboard", title: "여행 정보", description: "숙박 · 교통 · 식당 가이드" },
];

export default function HomePage() {
  const [heroIndex, setHeroIndex] = useState(0);
  const heroChallenge = heroChallenges[heroIndex];
  const showPreviousHero = () => setHeroIndex((current) => (current - 1 + heroChallenges.length) % heroChallenges.length);
  const showNextHero = () => setHeroIndex((current) => (current + 1) % heroChallenges.length);

  return (
    <div className="bg-[#f3f7f4] text-[#172033]">
      <section className="bg-gradient-to-b from-[#e8f0eb] via-[#f3f7f4] to-[#f3f7f4] px-4 pb-14 pt-8 sm:px-6 lg:px-8">
        <div className="relative mx-auto min-h-[500px] max-w-[1280px] overflow-hidden rounded-[28px] bg-[#244839] shadow-[0_20px_60px_rgba(21,55,40,0.18)]">
          <Image key={heroChallenge.title} src={heroChallenge.image} alt={`${heroChallenge.title} 배경`} fill preload sizes="(max-width: 1280px) 100vw, 1280px" className="object-cover" />
          <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(10,35,27,0.78)_0%,rgba(10,35,27,0.48)_48%,rgba(10,35,27,0.65)_100%)]" />
          <div className="relative z-10 grid min-h-[500px] items-center gap-8 p-6 sm:p-10 lg:grid-cols-[190px_minmax(0,1fr)_220px] lg:p-12">
            <aside className="order-2 rounded-2xl border border-white/60 bg-white/95 p-5 shadow-xl backdrop-blur lg:order-1">
              <p className="text-xs font-medium text-[#687385]">강릉시 오늘의 날씨</p>
              <div className="mt-2 flex items-center gap-2 text-[#162033]">
                <AppIcon name="cloudSun" className="size-8 text-[#f4b400]" />
                <strong className="text-3xl">24°</strong>
              </div>
              <p className="mt-2 text-xs text-[#687385]">최고 28° · 최저 20°C</p>
              <p className="mt-3 flex items-center gap-1.5 rounded-lg border border-[#f3d76c] bg-[#fff9df] px-2.5 py-2 text-[11px] text-[#9b6900]">
                <AppIcon name="activity" className="size-3.5" /> 미세먼지 ‘보통’ 예상
              </p>
            </aside>

            <div className="order-1 max-w-2xl text-white lg:order-2" aria-live="polite">
              <span className="inline-flex rounded-full bg-[#02b957] px-3 py-1 text-xs font-semibold">{heroChallenge.tag}</span>
              <h1 className="mt-4 text-3xl font-bold tracking-[-0.04em] sm:text-4xl lg:text-[44px] lg:leading-[1.18]">{heroChallenge.title}</h1>
              <p className="mt-3 max-w-xl text-sm leading-6 text-white/90 sm:text-base">{heroChallenge.description}</p>
              <div className="mt-6 space-y-2 text-sm text-white/90">
                <p className="flex items-center gap-2"><AppIcon name="calendar" className="size-4" />{heroChallenge.date}</p>
                <p className="flex items-center gap-2"><AppIcon name="mapPin" className="size-4" />{heroChallenge.location}</p>
              </div>
              <div className="mt-7 flex flex-wrap gap-3">
                <button type="button" className="inline-flex h-11 items-center gap-2 rounded-xl bg-[#00a94f] px-5 text-sm font-semibold text-white shadow-lg transition hover:bg-[#008f43] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white">챌린지 참여하기<AppIcon name="arrowRight" /></button>
                <button type="button" className="inline-flex h-11 items-center gap-2 rounded-xl border border-white/25 bg-white/15 px-5 text-sm font-semibold text-white backdrop-blur transition hover:bg-white/25 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white">내 탐험 찾기<AppIcon name="map" /></button>
              </div>
              <div className="mt-6 flex items-center gap-3 text-sm text-white/90">
                <button type="button" onClick={showPreviousHero} aria-label="이전 챌린지" className="cursor-pointer rounded-full bg-white/15 p-1.5 transition hover:bg-white/30 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white"><AppIcon name="chevronLeft" /></button>
                <span className="min-w-9 text-center">{heroIndex + 1} / {heroChallenges.length}</span>
                <button type="button" onClick={showNextHero} aria-label="다음 챌린지" className="cursor-pointer rounded-full bg-white/15 p-1.5 transition hover:bg-white/30 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white"><AppIcon name="chevronRight" /></button>
                <div className="ml-1 flex gap-1.5" aria-label="챌린지 선택">
                  {heroChallenges.map((challenge, index) => (
                    <button
                      key={challenge.title}
                      type="button"
                      onClick={() => setHeroIndex(index)}
                      aria-label={`${index + 1}번째 챌린지 보기`}
                      aria-current={heroIndex === index ? "true" : undefined}
                      className={`h-1.5 cursor-pointer rounded-full transition-all ${heroIndex === index ? "w-6 bg-white" : "w-1.5 bg-white/40 hover:bg-white/70"}`}
                    />
                  ))}
                </div>
              </div>
            </div>

            <aside className="order-3 rounded-2xl bg-white p-4 text-[#172033] shadow-2xl">
              <div className="flex items-center justify-between text-xs font-semibold"><span>나의 패스포트</span><button type="button" className="text-[#008f45]">더보기</button></div>
              <div className="mt-3 rounded-xl bg-[#008f45] p-4 text-center text-white">
                <p className="text-[10px] text-white/80">2026 강원 스포츠 패스포트</p>
                <span className="mx-auto mt-3 flex size-12 items-center justify-center rounded-full bg-white/15"><AppIcon name="mountain" className="size-6" /></span>
                <strong className="mt-2 block text-sm">스노우 파인</strong>
              </div>
              <div className="mt-3 grid grid-cols-3 gap-2 text-center text-[10px]">
                <div className="rounded-lg bg-[#f3f5f4] p-2"><strong className="block text-sm text-[#008f45]">2/6</strong>방문</div>
                <div className="rounded-lg bg-[#f3f5f4] p-2"><strong className="block text-sm text-[#008f45]">1/3</strong>미션</div>
                <div className="rounded-lg bg-[#f3f5f4] p-2"><strong className="block text-sm text-[#008f45]">0/6</strong>달성</div>
              </div>
              <button type="button" className="mt-3 h-9 w-full rounded-lg bg-[#008f45] text-xs font-semibold text-white">패스포트 보기</button>
            </aside>
          </div>
        </div>
      </section>

      <div className="relative z-20 mx-auto -mt-[86px] max-w-[1180px] px-4 sm:px-6">
        <form role="search" action="/sports" className="flex min-h-20 items-center gap-3 rounded-2xl border border-[#dce5df] bg-white p-3 shadow-[0_18px_45px_rgba(25,70,49,0.18)] sm:p-4">
          <AppIcon name="search" className="ml-2 size-6 text-[#7a8780]" />
          <label htmlFor="home-search" className="sr-only">스포츠, 지역, 코스 검색</label>
          <input id="home-search" name="q" type="search" placeholder="스포츠, 지역, 코스를 검색해보세요" className="h-12 min-w-0 flex-1 rounded-xl bg-[#f3f5f4] px-4 text-sm outline-none placeholder:text-[#8c9691] focus:ring-2 focus:ring-[#008f45]/30" />
          <button type="submit" className="inline-flex h-12 shrink-0 items-center gap-2 rounded-xl bg-[#008f45] px-5 text-sm font-semibold text-white transition hover:bg-[#00783a] sm:px-7">검색<AppIcon name="arrowRight" /></button>
        </form>
      </div>

      <section className="bg-white pb-10 pt-16">
        <div className="mx-auto max-w-[1180px] px-4 sm:px-6">
          <h2 className="text-lg font-bold">이번 주말, 나에게 맞는 강원 스포츠 코스는?</h2>
          <div className="mt-7 grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-5">
            {categories.map((category) => <button key={category.title} type="button" className="group rounded-2xl border border-transparent p-4 text-center transition hover:border-[#cfe3d6] hover:bg-[#f3f7f4] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#008f45]"><span className="mx-auto flex size-12 items-center justify-center rounded-2xl bg-[#e8f3ec] text-[#008f45] transition group-hover:bg-[#008f45] group-hover:text-white"><AppIcon name={category.icon} className="size-6" /></span><strong className="mt-3 block text-sm">{category.title}</strong><span className="mt-1 block text-xs text-[#7a8491]">{category.description}</span></button>)}
          </div>
        </div>
      </section>

      <section className="bg-[#f3f7f4] py-12">
        <div className="mx-auto max-w-[1180px] px-4 sm:px-6">
          <div className="flex items-center justify-between"><h2 className="text-xl font-bold">지금 강원에서 열리는 행사</h2><button type="button" className="inline-flex items-center gap-1 text-sm font-semibold text-[#008f45]">전체보기<AppIcon name="arrowRight" /></button></div>
          <div className="mt-7 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {events.map((event) => <article key={event.title} className="overflow-hidden rounded-2xl border border-[#e0e7e2] bg-white shadow-sm transition hover:-translate-y-1 hover:shadow-lg"><div className="relative aspect-[4/2.35] overflow-hidden"><Image src={event.image} alt="" fill sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw" className="object-cover transition duration-300 hover:scale-105" /><span className="absolute left-3 top-3 rounded-md bg-white/95 px-2 py-1 text-xs font-semibold">{event.tag}</span></div><div className="p-4"><h3 className="font-bold">{event.title}</h3><p className="mt-2 flex items-center gap-1.5 text-xs text-[#6d7884]"><AppIcon name="calendar" />{event.date}</p><p className="mt-2 flex items-center gap-1.5 text-xs font-medium text-[#008f45]"><AppIcon name="award" />{event.reward}</p></div></article>)}
          </div>
        </div>
      </section>

      <section className="bg-white py-12">
        <div className="mx-auto grid max-w-[1180px] gap-5 px-4 sm:grid-cols-2 sm:px-6 lg:grid-cols-4">
          {quickLinks.map((link) => <button key={link.title} type="button" className="flex items-center gap-4 rounded-2xl border border-[#e1e8e3] p-5 text-left transition hover:border-[#9ac4aa] hover:shadow-md"><span className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-[#e8f3ec] text-[#008f45]"><AppIcon name={link.icon} className="size-5" /></span><span><strong className="block text-sm">{link.title}</strong><span className="mt-1 block text-xs text-[#7a8491]">{link.description}</span></span></button>)}
        </div>
      </section>

    </div>
  );
}
