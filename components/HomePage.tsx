"use client";

import Image, { type StaticImageData } from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import { api } from "@/lib/api/service";
import { passportLevelLabel, resolvePassportLevel } from "@/lib/passportLevel";
import { AppIcon, type AppIconName } from "./AppIcon";
import hongcheonMarathonImage from "@/imports/LandingPage/2026-hongcheon-love-marathon.jpg";
import chuncheonMarathonImage from "@/imports/LandingPage/2026-chuncheon-marathon-hero.jpg";
import digitalTourCardImage from "@/imports/LandingPage/digital-tour-card-gangwon-hero.png";
import eventImage1 from "@/imports/LandingPage/205ec17d713405bedcfab3cf69b55f31151a8bf3.png";
import eventImage2 from "@/imports/LandingPage/9193ff8f95dcbcb73f018d079496fad4bcfa1dec.png";
import eventImage3 from "@/imports/LandingPage/a92d1f052a5f15d9f49f62dad2a919d5f418da27.png";
import eventImage4 from "@/imports/LandingPage/9509675bc89588078354909012b6022f47332ef9.png";
import mountainSportsImage from "@/imports/SportsAI/sports-ai-mountain.jpg";
import winterSportsImage from "@/imports/SportsAI/sports-ai-snow.jpg";
import waterSportsImage from "@/imports/SportsAI/sports-ai-water.jpg";
import athleticsSportsImage from "@/imports/SportsAI/sports-ai-running.jpg";

const categories: Array<{ image: StaticImageData | string; title: string; description: string; filter: string; contain?: boolean }> = [
  { image: mountainSportsImage, title: "산악 스포츠", description: "산악자전거 · 트레일 러닝", filter: "산악스포츠" },
  { image: winterSportsImage, title: "동계 스포츠", description: "스키 · 스노보드", filter: "동계스포츠" },
  { image: waterSportsImage, title: "수상 스포츠", description: "래프팅 · 카약 · 보트", filter: "수상스포츠" },
  { image: athleticsSportsImage, title: "육상 스포츠", description: "마라톤 · 트레킹 · 워킹", filter: "육상스포츠" },
  { image: "/olympic-rings-white.svg", title: "올림픽 레거시", description: "스키점프 · 경기장 투어", filter: "올림픽레거시", contain: true },
];

const heroChallenges: Array<{
  image: StaticImageData;
  tag: string;
  title: string;
  description: string;
  date: string;
  location: string;
  actionLabel?: string;
  href?: string;
}> = [
  {
    image: hongcheonMarathonImage,
    tag: "참가 접수중",
    title: "2026 홍천사랑마라톤대회",
    description: "홍천강을 따라 함께 달리는 러닝 페스티벌. 홍천종합운동장에서 힘차게 출발하세요.",
    date: "2026.10.04(일) 09:00",
    location: "홍천종합운동장",
    actionLabel: "대회 참가 신청",
    href: "https://www.hongcheonrun.net/participate.php",
  },
  {
    image: chuncheonMarathonImage,
    tag: "개최 예정",
    title: "2026 춘천마라톤",
    description: "아름다운 의암호 순환 코스를 달리는 대한민국 대표 가을 마라톤을 만나보세요.",
    date: "2026.10.25(일) 09:00",
    location: "춘천 공지천교",
    actionLabel: "공식 홈페이지",
    href: "https://www.chuncheonmarathon.com/",
  },
  {
    image: digitalTourCardImage,
    tag: "진행중",
    title: "서핑타고 강원여행 혜택쿠폰받자",
    description: "디지털 관광주민증을 등록하고 강원권 먹거리·관람·체험 혜택쿠폰을 받아보세요.",
    date: "2026.08.07 ~ 2026.10.31",
    location: "강원권 디지털 관광주민증 지역",
    actionLabel: "디지털 관광주민증 등록하기",
    href: "https://korean.visitkorea.or.kr/membership-event/coupon/event?round=15",
  },
];

const fallbackEvents: Array<{ image: StaticImageData | string; tag: string; title: string; date: string; reward: string; href?: string }> = [
  { image: eventImage1, tag: "트레일런", title: "양양 서프 트레일 2026", date: "2026.05.16 ~ 06.18", reward: "MTB 코스 완주 스탬프" },
  { image: eventImage2, tag: "MTB", title: "청산 MTB 페스티벌 2026", date: "2026.05.17", reward: "MTB 코스 완주 스탬프" },
  { image: eventImage3, tag: "축제", title: "인제 내린천 래프팅 축제", date: "2026.06.20 ~ 06.22", reward: "래프팅 체험 스탬프" },
  { image: eventImage4, tag: "MTB", title: "강촌 바이크래 페스티벌", date: "2026.05.23 ~ 06.29", reward: "코인 앱 완주 스탬프" },
];

const quickLinks: Array<{ icon: AppIconName; title: string; description: string; href?: string }> = [
  { icon: "map", title: "지역별로 보기", description: "강원 18개 시군의 활동을 지도에서 확인하세요.", href: "/map" },
  { icon: "calendar", title: "일정에 저장", description: "관심 활동과 행사를 내 일정에 모아보세요.", href: "https://calendar.google.com/calendar/u/0/r" },
  { icon: "users", title: "스포츠 피드", description: "강원에서 즐긴 순간을 사진으로 나눠보세요.", href: "/community" },
  { icon: "instagram", title: "Instargram", description: "강원 스포츠 패스포트의 새로운 소식을 만나보세요.", href: "https://www.instagram.com/gangwonsportspassport/" },
];

const gangwonWeatherRegions = [
  { name: "춘천시", latitude: 37.8813, longitude: 127.7298 },
  { name: "원주시", latitude: 37.3422, longitude: 127.9202 },
  { name: "강릉시", latitude: 37.7519, longitude: 128.8761 },
  { name: "동해시", latitude: 37.5247, longitude: 129.1143 },
  { name: "태백시", latitude: 37.1641, longitude: 128.9856 },
  { name: "속초시", latitude: 38.207, longitude: 128.5918 },
  { name: "삼척시", latitude: 37.4499, longitude: 129.1652 },
  { name: "홍천군", latitude: 37.6972, longitude: 127.8887 },
  { name: "횡성군", latitude: 37.4917, longitude: 127.985 },
  { name: "영월군", latitude: 37.1836, longitude: 128.4617 },
  { name: "평창군", latitude: 37.3705, longitude: 128.3903 },
  { name: "정선군", latitude: 37.3807, longitude: 128.6609 },
  { name: "철원군", latitude: 38.1467, longitude: 127.3134 },
  { name: "화천군", latitude: 38.1062, longitude: 127.7082 },
  { name: "양구군", latitude: 38.11, longitude: 127.9898 },
  { name: "인제군", latitude: 38.0697, longitude: 128.1707 },
  { name: "고성군", latitude: 38.3806, longitude: 128.4679 },
  { name: "양양군", latitude: 38.0754, longitude: 128.619 },
] as const;

const weatherLabels: Record<number, string> = {
  0: "맑음", 1: "대체로 맑음", 2: "부분적으로 흐림", 3: "흐림",
  45: "안개", 48: "서리 안개", 51: "약한 이슬비", 53: "이슬비", 55: "강한 이슬비",
  61: "약한 비", 63: "비", 65: "강한 비", 71: "약한 눈", 73: "눈", 75: "강한 눈",
  80: "약한 소나기", 81: "소나기", 82: "강한 소나기", 95: "뇌우", 96: "우박을 동반한 뇌우", 99: "강한 우박 뇌우",
};

export default function HomePage() {
  const [heroIndex, setHeroIndex] = useState(0);
  const [weatherRegionIndex, setWeatherRegionIndex] = useState(2);
  const [temperature, setTemperature] = useState<number | null>(null);
  const [temperatureRange, setTemperatureRange] = useState("날씨 불러오는 중");
  const [weatherDetail, setWeatherDetail] = useState("날씨 정보 확인 중");
  const [eventCards, setEventCards] = useState(fallbackEvents);
  const [passportProfile, setPassportProfile] = useState({ displayName: "", stampCount: 0, level: "Level 1 Beginner", authenticated: false });
  const heroChallenge = heroChallenges[heroIndex];
  const weatherRegion = gangwonWeatherRegions[weatherRegionIndex];
  const showPreviousHero = () => setHeroIndex((current) => (current - 1 + heroChallenges.length) % heroChallenges.length);
  const showNextHero = () => setHeroIndex((current) => (current + 1) % heroChallenges.length);
  const changeWeatherRegion = (direction: -1 | 1) => {
    setTemperature(null);
    setTemperatureRange("날씨 불러오는 중");
    setWeatherDetail("날씨 정보 확인 중");
    setWeatherRegionIndex((current) => (current + direction + gangwonWeatherRegions.length) % gangwonWeatherRegions.length);
  };

  useEffect(() => {
    let cancelled = false;

    api.openMeteoWeather({ latitude: weatherRegion.latitude, longitude: weatherRegion.longitude })
      .then((weather) => {
        if (cancelled) return;
        setTemperature(Math.round(weather.current.temperature_2m));
        setTemperatureRange(`최고 ${Math.round(weather.daily.temperature_2m_max[0])}° · 최저 ${Math.round(weather.daily.temperature_2m_min[0])}°C`);
        setWeatherDetail(`${weatherLabels[weather.current.weather_code] ?? "날씨 확인 중"} · 습도 ${weather.current.relative_humidity_2m}%`);
      })
      .catch(() => {
        if (cancelled) return;
        setTemperatureRange("날씨를 불러오지 못했습니다");
        setWeatherDetail("잠시 후 다시 확인해 주세요");
      });

    return () => {
      cancelled = true;
    };
  }, [weatherRegion.latitude, weatherRegion.longitude]);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      setTemperature(null);
      setTemperatureRange("날씨 불러오는 중");
      setWeatherDetail("날씨 정보 확인 중");
      setWeatherRegionIndex((current) => (current + 1) % gangwonWeatherRegions.length);
    }, 8000);

    return () => window.clearTimeout(timer);
  }, [weatherRegionIndex]);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      setHeroIndex((current) => (current + 1) % heroChallenges.length);
    }, 7000);

    return () => window.clearTimeout(timer);
  }, [heroIndex]);

  useEffect(() => {
    const user = api.currentUser();
    if (!api.hasToken()) return;
    const displayName = user?.email.split("@")[0] || "패스포트 회원";

    Promise.all([api.passports.list(), api.collectedStamps.list()])
      .then(async ([passports, stamps]) => {
        const userPassports = passports.filter((passport) => !user || passport.userId === user.id);
        const passportIds = new Set(userPassports.map((passport) => passport.id));
        const stampCount = passportIds.size > 0 ? stamps.filter((stamp) => passportIds.has(stamp.passportId)).length : stamps.length;
        const missionResults = await Promise.allSettled(userPassports.map((passport) => api.passportMissions(passport.id, 1, 100)));
        const completedFirstMission = missionResults.some((result) => result.status === "fulfilled" && result.value.some((mission) => mission.completed));
        setPassportProfile({ displayName, stampCount, level: passportLevelLabel(resolvePassportLevel(stampCount, completedFirstMission)), authenticated: true });
      })
      .catch(() => setPassportProfile((current) => ({ ...current, displayName, authenticated: true })));
  }, []);

  useEffect(() => {
    api.events.list({ page: 1, size: 100 })
      .then((items) => {
        if (items.length === 0) return;
        const sportsFirst = [...items]
          .sort((first, second) => Number(Boolean(second.sportName)) - Number(Boolean(first.sportName)))
          .slice(0, 4);
        setEventCards(sportsFirst.map((item, index) => ({
          image: item.representativeImageUrl ?? [eventImage1, eventImage2, eventImage3, eventImage4][index % 4],
          tag: item.sportName ? "스포츠 행사" : item.category === "festival" ? "축제" : "이벤트",
          title: item.placeName ?? item.sportName ?? `강원 행사 #${item.id}`,
          date: item.startsAt ? item.startsAt.slice(0, 10).replaceAll("-", ".") : "일정 확인 중",
          reward: item.hasMission ? "패스포트 미션 참여 가능" : (item.sigun ?? item.region ?? "강원특별자치도"),
          href: `/events/detail?id=${item.id}`,
        })));
      })
      .catch(() => undefined);
  }, []);

  return (
    <div className="bg-[#f3f7f4] text-[#172033]">
      <section className="bg-gradient-to-b from-[#e8f0eb] via-[#f3f7f4] to-[#f3f7f4] px-4 pb-14 pt-8 sm:px-6 lg:px-8">
        <div className="relative mx-auto min-h-[500px] max-w-[1280px] overflow-hidden rounded-[28px] bg-[#244839] shadow-[0_20px_60px_rgba(21,55,40,0.18)]">
          <Image key={heroChallenge.title} src={heroChallenge.image} alt={`${heroChallenge.title} 배경`} fill preload sizes="(max-width: 1280px) 100vw, 1280px" className="object-cover" />
          <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(10,35,27,0.78)_0%,rgba(10,35,27,0.48)_48%,rgba(10,35,27,0.65)_100%)]" />
          <div className="relative z-10 grid min-h-[500px] items-center gap-8 p-6 sm:p-10 lg:grid-cols-[190px_minmax(0,1fr)_220px] lg:p-12">
            <aside className="order-2 rounded-2xl border border-white/60 bg-white/95 p-5 shadow-xl backdrop-blur lg:order-1">
              <div className="flex items-center justify-between gap-2">
                <button type="button" onClick={() => changeWeatherRegion(-1)} aria-label="이전 지역 날씨" className="cursor-pointer rounded-full p-1 text-[#687385] transition hover:bg-[#edf3ef] hover:text-[#008f45]"><AppIcon name="chevronLeft" className="size-4" /></button>
                <p className="text-center text-xs font-semibold text-[#687385]">{weatherRegion.name} 오늘의 날씨</p>
                <button type="button" onClick={() => changeWeatherRegion(1)} aria-label="다음 지역 날씨" className="cursor-pointer rounded-full p-1 text-[#687385] transition hover:bg-[#edf3ef] hover:text-[#008f45]"><AppIcon name="chevronRight" className="size-4" /></button>
              </div>
              <div className="mt-2 flex items-center gap-2 text-[#162033]">
                <AppIcon name="cloudSun" className="size-8 text-[#f4b400]" />
                <strong className="text-3xl">{temperature === null ? "--" : temperature}°</strong>
                <span className="ml-auto text-[10px] font-medium text-[#8a9590]">{weatherRegionIndex + 1} / {gangwonWeatherRegions.length}</span>
              </div>
              <p className="mt-2 text-xs text-[#687385]">{temperatureRange}</p>
              <p className="mt-3 flex items-center gap-1.5 rounded-lg border border-[#f3d76c] bg-[#fff9df] px-2.5 py-2 text-[11px] text-[#9b6900]">
                <AppIcon name="activity" className="size-3.5" /> {weatherDetail}
              </p>
              <a href="https://open-meteo.com/" target="_blank" rel="noreferrer" className="mt-2 block text-right text-[9px] text-[#87918c] underline-offset-2 hover:underline">Weather data by Open-Meteo.com</a>
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
                {heroChallenge.href ? (
                  <a href={heroChallenge.href} target="_blank" rel="noopener noreferrer" className="inline-flex h-11 items-center gap-2 rounded-xl bg-[#00a94f] px-5 text-sm font-semibold text-white shadow-lg transition hover:bg-[#008f43] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white">
                    {heroChallenge.actionLabel ?? "자세히 보기"}<AppIcon name="arrowRight" />
                  </a>
                ) : (
                  <button type="button" className="inline-flex h-11 items-center gap-2 rounded-xl bg-[#00a94f] px-5 text-sm font-semibold text-white shadow-lg transition hover:bg-[#008f43] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white">
                    {heroChallenge.actionLabel ?? "챌린지 참여하기"}<AppIcon name="arrowRight" />
                  </button>
                )}
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
              <h2 className="text-xs font-semibold">나의 패스포트</h2>
              {passportProfile.authenticated ? <>
                <div className="mt-3 rounded-xl bg-[#008f45] p-4 text-center text-white">
                  <span className="mx-auto flex size-12 items-center justify-center rounded-full bg-white/15"><AppIcon name="mountain" className="size-6" /></span>
                  <strong className="mt-2 block text-base">{passportProfile.displayName}</strong>
                  <span className="mt-1 block text-xs font-medium text-white/75">{passportProfile.level}</span>
                </div>
                <div className="mt-3 rounded-lg bg-[#f3f5f4] p-3 text-center">
                  <span className="block text-[10px] text-[#7a8491]">보유 스탬프</span>
                  <strong className="mt-1 block text-lg text-[#008f45]">{passportProfile.stampCount}개</strong>
                </div>
                <Link href="/passport" className="mt-3 flex h-9 w-full items-center justify-center rounded-lg bg-[#008f45] text-xs font-semibold text-white transition hover:bg-[#00783a]">패스포트 보기</Link>
              </> : <Link href="/login" className="mt-3 flex min-h-44 flex-col items-center justify-center rounded-xl bg-[#008f45] p-4 text-center text-white transition hover:bg-[#00783a] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#008f45] focus-visible:ring-offset-2">
                <span className="flex size-12 items-center justify-center rounded-full bg-white/15"><AppIcon name="lock" className="size-6" /></span>
                <strong className="mt-3 text-base">로그인 필요</strong>
                <span className="mt-1 text-xs text-white/75">로그인하고 내 패스포트를 확인하세요</span>
              </Link>}
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
            {categories.map((category) => <Link key={category.title} href={{ pathname: "/sports", query: { sport: category.filter } }} className="group overflow-hidden rounded-2xl border border-[#e0e7e2] bg-white text-left shadow-sm transition hover:-translate-y-1 hover:border-[#9ac4aa] hover:shadow-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#008f45]"><span className="relative block aspect-[4/3] overflow-hidden bg-white"><Image src={category.image} alt={`${category.title} 대표 이미지`} fill sizes="(max-width: 768px) 50vw, 20vw" className={`${category.contain ? "object-contain p-5" : "object-cover transition duration-300 group-hover:scale-105"}`} /></span><span className="block border-t border-[#edf1ee] p-4"><strong className="block text-sm">{category.title}</strong><span className="mt-1 block text-xs text-[#7a8491]">{category.description}</span></span></Link>)}
          </div>
        </div>
      </section>

      <section className="bg-[#f3f7f4] py-12">
        <div className="mx-auto max-w-[1180px] px-4 sm:px-6">
          <div className="flex items-center justify-between"><h2 className="text-xl font-bold">지금 강원에서 열리는 행사</h2><Link href="/events" className="inline-flex items-center gap-1 text-sm font-semibold text-[#008f45]">전체보기<AppIcon name="arrowRight" /></Link></div>
          <div className="mt-7 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {eventCards.map((event) => {
              const card = <article className="group h-full overflow-hidden rounded-2xl border border-[#e0e7e2] bg-white shadow-sm transition group-hover:-translate-y-1 group-hover:shadow-lg"><div className="relative aspect-[4/2.35] overflow-hidden"><Image src={event.image} alt={`${event.title} 대표 이미지`} fill sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw" className="object-cover transition duration-300 group-hover:scale-105" /><span className="absolute left-3 top-3 rounded-md bg-white/95 px-2 py-1 text-xs font-semibold">{event.tag}</span></div><div className="p-4"><h3 className="font-bold">{event.title}</h3><p className="mt-2 flex items-center gap-1.5 text-xs text-[#6d7884]"><AppIcon name="calendar" />{event.date}</p><p className="mt-2 flex items-center gap-1.5 text-xs font-medium text-[#008f45]"><AppIcon name="award" />{event.reward}</p></div></article>;
              return event.href ? <Link key={event.title} href={event.href} className="group block cursor-pointer rounded-2xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#008f45]">{card}</Link> : <div key={event.title}>{card}</div>;
            })}
          </div>
        </div>
      </section>

      <section className="bg-white py-12">
        <div className="mx-auto grid max-w-[1180px] gap-5 px-4 sm:grid-cols-2 sm:px-6 lg:grid-cols-4">
          {quickLinks.map((link) => {
            const content = <><span className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-[#e8f3ec] text-[#008f45]"><AppIcon name={link.icon} className="size-5" /></span><span><strong className="block text-sm">{link.title}</strong><span className="mt-1 block text-xs text-[#7a8491]">{link.description}</span></span></>;
            const className = "flex items-center gap-4 rounded-2xl border border-[#e1e8e3] p-5 text-left transition hover:border-[#9ac4aa] hover:shadow-md";
            if (link.href?.startsWith("/")) return <Link key={link.title} href={link.href} className={`${className} cursor-pointer`}>{content}</Link>;
            return link.href ? <a key={link.title} href={link.href} target="_blank" rel="noopener noreferrer" className={`${className} cursor-pointer`}>{content}</a> : <button key={link.title} type="button" className={className}>{content}</button>;
          })}
        </div>
      </section>

    </div>
  );
}
