"use client";

import Image, { type StaticImageData } from "next/image";
import Link from "next/link";
import { Suspense, useEffect, useRef, useState } from "react";
import { useSearchParams } from "next/navigation";
import { api } from "@/lib/api/service";
import { sportsFacilityType } from "@/lib/sportsFacility";
import { isExcludedSportPlace, sportsImage } from "@/lib/sportsImage";
import { AppIcon, type AppIconName } from "./AppIcon";
import { CoursePreferences } from "./CoursePreferences";
import heroImage from "@/imports/LandingPage/a0d5da596bc83d9effc7a18d6702727ac6b06d43.png";
import image1 from "@/imports/LandingPage/205ec17d713405bedcfab3cf69b55f31151a8bf3.png";
import image2 from "@/imports/LandingPage/9193ff8f95dcbcb73f018d079496fad4bcfa1dec.png";
import image3 from "@/imports/LandingPage/a92d1f052a5f15d9f49f62dad2a919d5f418da27.png";
import image4 from "@/imports/LandingPage/9509675bc89588078354909012b6022f47332ef9.png";

export type PortalPageKey = "sports" | "courses" | "missions" | "events" | "mypage";

const portalQuickLinks: Array<{ icon: AppIconName; title: string; text: string; href?: string }> = [
  { icon: "map", title: "지역별로 보기", text: "강원 18개 시군의 활동을 지도에서 확인하세요.", href: "/map" },
  { icon: "calendar", title: "일정에 저장", text: "관심 활동과 행사를 내 일정에 모아보세요.", href: "https://calendar.google.com/calendar/u/0/r" },
  { icon: "clipboard", title: "여행 정보", text: "숙박 · 교통 · 식당 가이드" },
  { icon: "instagram", title: "Instargram", text: "강원 스포츠 패스포트의 새로운 소식을 만나보세요.", href: "https://www.instagram.com/gangwonsportspassport/" },
];

type PageConfig = {
  eyebrow: string;
  title: string;
  description: string;
  icon: AppIconName;
  action: { label: string; href: string };
  stats: Array<{ value: string; label: string }>;
  sectionTitle: string;
  sectionDescription: string;
  cards: Array<{ image: StaticImageData | string; tag: string; secondaryTag?: string; facilityTag?: string; title: string; description: string; meta: string; icon: AppIconName; href?: string; hidden?: boolean }>;
};

const configs: Record<PortalPageKey, PageConfig> = {
  sports: {
    eyebrow: "스포츠 탐색",
    title: "강원 곳곳의 스포츠를 한눈에",
    description: "지역과 종목, 난이도를 기준으로 지금 즐길 수 있는 스포츠를 찾아보세요.",
    icon: "mountain",
    action: { label: "맞춤 코스 보기", href: "/courses" },
    stats: [],
    sectionTitle: "지금 인기 있는 스포츠",
    sectionDescription: "계절과 지역을 고려해 가장 반응이 좋은 활동을 골랐습니다.",
    cards: [
      { image: image1, tag: "트레일런", title: "설악산 능선 트레일", description: "초록 능선을 따라 달리는 중급 트레일 코스", meta: "고성 · 12.4km", icon: "mountain" },
      { image: image2, tag: "MTB", title: "청산 MTB 파크", description: "숲길과 다운힐을 함께 즐기는 산악자전거 코스", meta: "정선 · 3시간", icon: "activity" },
      { image: image3, tag: "래프팅", title: "내린천 수상 스포츠", description: "시원한 계곡에서 즐기는 팀 래프팅 체험", meta: "인제 · 2시간", icon: "waves" },
      { image: image4, tag: "라이딩", title: "강촌 호반 라이딩", description: "북한강 풍경을 따라 달리는 편안한 자전거길", meta: "춘천 · 28km", icon: "person" },
    ],
  },
  courses: {
    eyebrow: "맞춤 코스",
    title: "하루와 취향에 맞춘 강원 여행",
    description: "스포츠와 지역 명소를 자연스럽게 연결한 일정으로 계획 부담을 줄였습니다.",
    icon: "map",
    action: { label: "스포츠부터 찾기", href: "/sports" },
    stats: [],
    sectionTitle: "추천 맞춤 코스",
    sectionDescription: "소요 시간과 난이도가 명확한 코스만 모았습니다.",
    cards: [
      { image: image1, tag: "1박 2일", title: "대관령 하늘길 트레킹", description: "트레킹과 목장 풍경을 함께 즐기는 주말 코스", meta: "중급 · 5시간", icon: "mountain" },
      { image: image3, tag: "당일", title: "동해 패들 & 서핑", description: "오전 패들보드와 오후 서핑을 잇는 바다 코스", meta: "초급 · 6시간", icon: "waves" },
      { image: image4, tag: "1박 2일", title: "춘천 라이딩 & 미식", description: "호반 라이딩 뒤 지역 음식을 즐기는 여유로운 일정", meta: "초중급 · 30km", icon: "person" },
      { image: image2, tag: "당일", title: "정선 MTB 어드벤처", description: "숲길 라이딩과 케이블카 전망을 묶은 활동형 코스", meta: "중급 · 4시간", icon: "activity" },
    ],
  },
  missions: {
    eyebrow: "패스포트 미션",
    title: "도전하고 인증하며 패스포트를 완성하세요",
    description: "스포츠 참여와 지역 방문을 기록하고 스탬프와 리워드를 모아보세요.",
    icon: "award",
    action: { label: "내 패스포트", href: "/mypage" },
    stats: [],
    sectionTitle: "이번 달 추천 미션",
    sectionDescription: "처음 참여해도 완료 조건을 쉽게 이해할 수 있는 미션입니다.",
    cards: [
      { image: image1, tag: "주간", title: "트레일 10km 완주", description: "지정 트레일 코스에서 10km 이상 활동을 기록하세요.", meta: "보상 · 능선 스탬프", icon: "medal" },
      { image: image2, tag: "지역", title: "정선 스포츠 2곳 방문", description: "정선의 스포츠 명소 두 곳에서 방문 인증을 남기세요.", meta: "보상 · 500 포인트", icon: "mapPin" },
      { image: image3, tag: "체험", title: "수상 스포츠 첫 도전", description: "래프팅, 카약, 서핑 중 한 종목에 참여하세요.", meta: "보상 · 물결 배지", icon: "waves" },
      { image: image4, tag: "월간", title: "강원 3개 지역 탐험", description: "서로 다른 세 지역에서 스포츠 활동을 완료하세요.", meta: "보상 · 탐험가 스탬프", icon: "trophy" },
    ],
  },
  events: {
    eyebrow: "이벤트 · 축제",
    title: "스포츠가 축제가 되는 순간",
    description: "대회, 체험 행사, 지역 축제 일정을 한곳에서 확인하고 참여하세요.",
    icon: "calendar",
    action: { label: "미션과 함께 보기", href: "/missions" },
    stats: [],
    sectionTitle: "다가오는 행사",
    sectionDescription: "접수 상태와 일정이 확인된 행사만 보여드립니다.",
    cards: [
      { image: image1, tag: "06.16", title: "양양 서프 트레일 2026", description: "산과 바다를 잇는 양양 대표 트레일 대회", meta: "접수 중 · 양양", icon: "calendar" },
      { image: image2, tag: "06.17", title: "청산 MTB 페스티벌", description: "레이스와 가족 체험이 함께 열리는 MTB 축제", meta: "접수 중 · 정선", icon: "activity" },
      { image: image3, tag: "06.20", title: "내린천 래프팅 축제", description: "래프팅 경기와 초보자 체험 프로그램", meta: "무료 체험 · 인제", icon: "waves" },
      { image: image4, tag: "06.23", title: "강촌 바이크 페스티벌", description: "호반 라이딩과 자전거 문화를 즐기는 주말", meta: "현장 접수 · 춘천", icon: "person" },
    ],
  },
  mypage: {
    eyebrow: "마이페이지",
    title: "홍길동님의 강원 스포츠 패스포트",
    description: "방문 기록, 스탬프, 진행 중인 미션과 다음 리워드를 한눈에 확인하세요.",
    icon: "trophy",
    action: { label: "새 미션 찾기", href: "/missions" },
    stats: [{ value: "7", label: "모은 스탬프" }, { value: "5", label: "인증 장소" }, { value: "3", label: "다음 리워드까지" }],
    sectionTitle: "최근 활동",
    sectionDescription: "인증 기록과 이어서 도전할 활동을 정리했습니다.",
    cards: [
      { image: image1, tag: "완료", title: "설악산 트레일 챌린지", description: "10km 완주 기록이 패스포트에 반영되었습니다.", meta: "2026.06.12", icon: "medal" },
      { image: image2, tag: "진행 중", title: "정선 스포츠 2곳 방문", description: "한 곳을 인증했습니다. 한 곳이 더 남았습니다.", meta: "1 / 2 완료", icon: "mapPin" },
      { image: image3, tag: "추천", title: "내린천 수상 스포츠", description: "현재 스탬프 조합과 가장 잘 맞는 다음 활동입니다.", meta: "리워드 +300", icon: "waves" },
      { image: image4, tag: "리워드", title: "탐험가 레벨 2", description: "스탬프 세 개를 더 모으면 새로운 혜택이 열립니다.", meta: "진행률 70%", icon: "award" },
    ],
  },
};

type FilterGroup = { label: string; key: string; items: Array<{ label: string; value: string; icon: AppIconName }> };

const regions = ["전체 지역", "춘천", "원주", "강릉", "동해", "태백", "속초", "삼척", "홍천", "평창", "정선", "인제", "양양"].map((label) => ({ label, value: label === "전체 지역" ? "" : label, icon: "mapPin" as AppIconName }));
const sports = [
  { label: "전체 스포츠", value: "", icon: "medal" as AppIconName },
  { label: "산악스포츠", value: "산악스포츠", icon: "mountain" as AppIconName },
  { label: "빙상스포츠", value: "빙상스포츠", icon: "snowflake" as AppIconName },
  { label: "수상스포츠", value: "수상스포츠", icon: "waves" as AppIconName },
  { label: "육상스포츠", value: "육상스포츠", icon: "person" as AppIconName },
  { label: "올림픽레거시", value: "올림픽레거시", icon: "olympicRings" as AppIconName },
];

const filterGroups: Partial<Record<PortalPageKey, FilterGroup[]>> = {
  sports: [{ label: "스포츠 종류", key: "sport", items: sports }, { label: "지역", key: "region", items: regions }],
  courses: [{ label: "카테고리", key: "category", items: sports.map((item) => ({ ...item, label: item.label === "전체 스포츠" ? "전체" : item.label })) }],
  missions: [{ label: "스포츠 종류", key: "sport", items: sports }, { label: "지역", key: "region", items: regions }],
  events: [{ label: "지역", key: "region", items: regions }],
};

const cardImages = [image1, image2, image3, image4];
const themeLabels = { healing: "힐링", thrill: "스릴", photo_spot: "포토 스팟", stamp: "스탬프" };
const sportsPageSize = 20;

function sportCategory(sportName: string | null) {
  const sport = sportName?.toLowerCase() ?? "";
  if (["hiking", "trekking", "trail", "trail_running", "mtb"].some((value) => sport.includes(value))) return "산악스포츠";
  if (["ski", "snow", "skating", "ice"].some((value) => sport.includes(value))) return "빙상스포츠";
  if (["surf", "rafting", "kayak", "water", "sailing", "marine", "ocean", "yacht", "canoe", "wakeboard", "paddle", "sup", "snorkel", "scuba"].some((value) => sport.includes(value))) return "수상스포츠";
  if (["running", "marathon", "walking", "athletics"].some((value) => sport.includes(value))) return "육상스포츠";
  if (["olympic", "legacy"].some((value) => sport.includes(value))) return "올림픽레거시";
  return "스포츠";
}

function sportCategories(
  sportName: string | null,
  metadata: Record<string, unknown> | null | undefined,
) {
  const labels: Record<string, string> = {
    snow: "빙상스포츠",
    olympic_legacy: "올림픽레거시",
  };
  const metadataCategories = Array.isArray(metadata?.sport_categories)
    ? metadata.sport_categories
      .map((value) => labels[String(value)] ?? "")
      .filter(Boolean)
    : [];
  return [...new Set(metadataCategories.length ? metadataCategories : [sportCategory(sportName)])];
}

function sportIcon(category: string): AppIconName {
  if (category === "산악스포츠") return "mountain";
  if (category === "빙상스포츠") return "snowflake";
  if (category === "수상스포츠") return "waves";
  if (category === "육상스포츠") return "person";
  if (category === "올림픽레거시") return "olympicRings";
  return "activity";
}

function activityDate(startsAt?: string | null, endsAt?: string | null) {
  const format = (value: string) => value.slice(0, 10).replaceAll("-", ".");
  if (startsAt && endsAt) return `${format(startsAt)} ~ ${format(endsAt)}`;
  return startsAt ? format(startsAt) : "일정 확인 중";
}

async function loadCards(page: PortalPageKey, dataPage = 1): Promise<PageConfig["cards"]> {
  if (page === "sports") {
    return (await api.sports.list({ page: dataPage, size: sportsPageSize }))
      .map((activity) => {
        const categories = sportCategories(activity.sportName, activity.metadata);
        const category = categories[0];
        return {
          image: sportsImage(activity, categories),
          tag: category,
          secondaryTag: categories[1],
          facilityTag: sportsFacilityType(activity) ?? undefined,
          title: activity.placeName ?? activity.sportName ?? `스포츠 활동 #${activity.id}`,
          description: activity.summary ?? `${activity.sigun ?? "강원"} · ${category}`,
          meta: [activity.sigun, activity.address ?? activity.region].filter(Boolean).join(" · ") || "강원특별자치도",
          icon: sportIcon(category),
          href: `/sports/detail?id=${activity.id}`,
          hidden: isExcludedSportPlace(activity.placeName),
        };
      });
  }
  if (page === "events") {
    const events = await api.events.list({ page: 1, size: 100 });
    return [...events]
      .sort((first, second) => Number(Boolean(second.sportName)) - Number(Boolean(first.sportName)))
      .map((activity, index) => ({
      image: activity.representativeImageUrl ?? cardImages[index % cardImages.length],
      tag: activity.sportName ? "스포츠 행사" : activity.category === "festival" ? "축제" : "이벤트",
      title: activity.placeName ?? activity.sportName ?? `행사 #${activity.id}`,
      description: activity.summary ?? "강원에서 열리는 스포츠 행사입니다.",
      meta: `${activityDate(activity.startsAt, activity.endsAt)} · ${activity.sigun ?? activity.region ?? "강원"}`,
      icon: "calendar" as const,
      href: `/events/detail?id=${activity.id}`,
      }));
  }
  if (page === "courses") {
    return (await api.courses.list()).map((course, index) => ({
      image: cardImages[index % cardImages.length],
      tag: themeLabels[course.theme],
      title: course.title ?? `${themeLabels[course.theme]} 코스 #${course.id}`,
      description: course.description ?? (course.recommendedCompanion ? `${course.recommendedCompanion}와 함께하기 좋은 코스` : "추천 스포츠 코스"),
      meta: course.estimatedDurationMinutes ? `약 ${course.estimatedDurationMinutes}분` : "소요 시간 미정",
      icon: "map" as const,
    }));
  }
  if (page === "missions") {
    return (await api.badges.list()).map((badge, index) => ({
      image: cardImages[index % cardImages.length],
      tag: "배지",
      title: `배지 #${badge.id}`,
      description: badge.description ?? "스포츠 활동으로 획득할 수 있는 배지",
      meta: "패스포트 리워드",
      icon: "award" as const,
    }));
  }

  return (await api.activities.list())
    .map((activity, index) => ({
      image: cardImages[index % cardImages.length],
      tag: activity.category === "sports" ? "스포츠" : activity.category === "event" ? "이벤트" : "축제",
      title: activity.sportName ?? activity.placeName ?? `활동 #${activity.id}`,
      description: activity.placeName ? `${activity.placeName}에서 즐기는 강원 스포츠 활동` : "강원 스포츠 활동",
      meta: [activity.region, activity.placeName].filter(Boolean).join(" · ") || "장소 미정",
      icon: activity.category === "sports" ? "activity" as const : "calendar" as const,
    }));
}

export function PortalPage({ page }: { page: PortalPageKey }) {
  return <Suspense><PortalPageContent page={page} /></Suspense>;
}

function PortalPageContent({ page }: { page: PortalPageKey }) {
  const searchParams = useSearchParams();
  const activeFilters = Object.fromEntries(searchParams.entries());
  const activeSportFilters = searchParams.getAll("sport").filter(Boolean);
  const activeRegionFilters = searchParams.getAll("region").filter(Boolean);
  const preferenceValues = Object.fromEntries(
    [...searchParams.keys()].map((key) => {
      const values = searchParams.getAll(key);
      return [key, values.length > 1 ? values : values[0]];
    }),
  );
  const recommendationQuery = searchParams.toString();
  const recommendationRequested = page === "courses";
  const recommendationNeedsLogin = recommendationRequested && !api.hasToken();
  const config = configs[page];
  const pageFilters = filterGroups[page] ?? [];
  const [remoteCards, setRemoteCards] = useState<PageConfig["cards"] | null>(null);
  const [apiMessage, setApiMessage] = useState("");
  const recommendationPending = recommendationRequested && !recommendationNeedsLogin && remoteCards === null && !apiMessage;
  const [sportsPage, setSportsPage] = useState(1);
  const [hasMoreSports, setHasMoreSports] = useState(true);
  const [loadingMoreSports, setLoadingMoreSports] = useState(false);
  const [loadMoreError, setLoadMoreError] = useState(false);
  const sportsSentinelRef = useRef<HTMLDivElement>(null);
  const sportsLoadingRef = useRef(false);

  useEffect(() => {
    const publicPage = page === "sports" || page === "events";
    if (page === "courses" && recommendationRequested) return;
    if (!publicPage && !api.hasToken()) return;
    let cancelled = false;
    let retryTimer: ReturnType<typeof setTimeout> | undefined;
    let attempts = 0;

    const requestCards = () => loadCards(page)
      .then((cards) => {
        if (cancelled) return;
        setRemoteCards(cards);
        if (page === "sports") {
          setSportsPage(1);
          setHasMoreSports(cards.length === sportsPageSize);
          setLoadMoreError(false);
        }
        setApiMessage(cards.length ? "" : "등록된 데이터가 없습니다.");
      })
      .catch(() => {
        if (cancelled) return;
        attempts += 1;
        if (attempts < 4) {
          setApiMessage("데이터 연결을 다시 시도하고 있습니다.");
          retryTimer = setTimeout(requestCards, 1500);
          return;
        }
        setApiMessage("데이터를 불러오지 못했습니다. 잠시 후 새로고침해 주세요.");
      });

    void requestCards();
    return () => {
      cancelled = true;
      if (retryTimer) clearTimeout(retryTimer);
    };
  }, [page, recommendationRequested]);

  useEffect(() => {
    if (page !== "courses" || !recommendationRequested) return;
    if (!api.hasToken()) return;

    const params = new URLSearchParams(recommendationQuery);
    const selectedTheme = params.get("theme");
    const theme = selectedTheme === "thrill" || selectedTheme === "photo_spot" || selectedTheme === "stamp"
      ? selectedTheme
      : "healing";
    const availableMinutes = Number(params.get("availableMinutes"));
    let cancelled = false;

    api.courseRecommendations({
      theme,
      region: params.get("region") || "강원특별자치도",
      sigun: params.get("sigun") || "강릉시",
      sport: params.get("sport") || null,
      availableMinutes: Number.isInteger(availableMinutes) && availableMinutes > 0 && availableMinutes <= 1440
        ? availableMinutes
        : 360,
    }).then(async (recommendation) => {
      const activities = await Promise.all(recommendation.stops.map((stop) => (
        api.activities.get(stop.activityId).catch(() => null)
      )));
      if (cancelled) return;

      const recommendedCards: PageConfig["cards"] = recommendation.stops.map((stop, index) => {
        const activity = activities[index];
        const category = sportCategory(activity?.sportName ?? params.get("sport"));
        return {
          image: activity ? sportsImage(activity, [category]) : cardImages[index % cardImages.length],
          tag: themeLabels[theme],
          facilityTag: activity ? sportsFacilityType(activity) ?? undefined : undefined,
          title: activity?.placeName ?? activity?.sportName ?? `추천 장소 #${stop.activityId}`,
          description: stop.reason,
          meta: [activity?.sigun ?? params.get("sigun"), `약 ${stop.estimatedMinutes}분`].filter(Boolean).join(" · "),
          icon: sportIcon(category),
          href: activity ? `/sports/detail?id=${activity.id}` : undefined,
        };
      });
      setRemoteCards(recommendedCards);
      setApiMessage(recommendedCards.length
        ? `추천 일치도 ${recommendation.matchScore}% · ${recommendation.usedAi ? "AI 맞춤 추천" : "조건 기반 추천"}`
        : "선택한 조건에 맞는 추천 코스가 없습니다. 지역이나 종목을 바꿔 다시 시도해 주세요.");
    }).catch((error: unknown) => {
      if (cancelled) return;
      setRemoteCards([]);
      const status = typeof error === "object" && error && "status" in error ? Number(error.status) : 0;
      setApiMessage(status === 401
        ? "로그인 정보가 만료되었습니다. 다시 로그인한 뒤 추천받아 주세요."
        : "맞춤 코스를 불러오지 못했습니다. 잠시 후 다시 시도해 주세요.");
    });

    return () => { cancelled = true; };
  }, [page, recommendationQuery, recommendationRequested]);

  useEffect(() => {
    const sentinel = sportsSentinelRef.current;
    if (page !== "sports" || remoteCards === null || !hasMoreSports || loadMoreError || !sentinel) return;

    const observer = new IntersectionObserver((entries) => {
      if (!entries[0]?.isIntersecting || sportsLoadingRef.current) return;

      const nextPage = sportsPage + 1;
      sportsLoadingRef.current = true;
      setLoadingMoreSports(true);
      loadCards("sports", nextPage)
        .then((newCards) => {
          setRemoteCards((current) => [...(current ?? []), ...newCards]);
          setSportsPage(nextPage);
          setHasMoreSports(newCards.length === sportsPageSize);
          setLoadMoreError(false);
        })
        .catch(() => setLoadMoreError(true))
        .finally(() => {
          sportsLoadingRef.current = false;
          setLoadingMoreSports(false);
        });
    }, { rootMargin: "320px 0px" });

    observer.observe(sentinel);
    return () => observer.disconnect();
  }, [hasMoreSports, loadMoreError, page, remoteCards, sportsPage]);

  const fallbackCards = page === "courses" ? [] : config.cards;
  const cards = ((recommendationNeedsLogin ? [] : remoteCards) ?? fallbackCards).filter((card) => {
    if (card.hidden) return false;
    const query = activeFilters.q?.toLowerCase();
    const matchesSport = page === "courses" || activeSportFilters.length === 0 || activeSportFilters.some((sport) => (
      card.title.includes(sport) || card.tag.includes(sport) || card.secondaryTag?.includes(sport) || card.facilityTag?.includes(sport)
    ));
    const matchesRegion = page === "courses" || activeRegionFilters.length === 0 || activeRegionFilters.some((region) => card.meta.includes(region));
    return (!query || `${card.title} ${card.description} ${card.meta}`.toLowerCase().includes(query))
      && matchesRegion
      && matchesSport;
  });

  return (
    <div className="bg-[#f3f7f4] text-[#172033]">
      <section className="bg-gradient-to-b from-[#e6f0e9] to-[#f3f7f4] px-4 pb-10 pt-12 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-[1180px]">
          <div className="relative flex min-h-[320px] flex-col justify-end gap-8 overflow-hidden rounded-[28px] bg-[#173a2d] p-7 shadow-[0_24px_70px_rgba(28,72,51,0.18)] sm:p-10 lg:flex-row lg:items-end lg:justify-between">
            <Image src={heroImage} alt="강원 산악 전경" fill priority sizes="(max-width: 1180px) 100vw, 1180px" className="object-cover" />
            <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(9,36,27,0.88)_0%,rgba(9,36,27,0.58)_62%,rgba(9,36,27,0.38)_100%)]" />
            <div className="relative max-w-3xl text-white">
              <span className="inline-flex size-12 items-center justify-center rounded-2xl bg-white/15 text-white backdrop-blur"><AppIcon name={config.icon} className="size-6" /></span>
              <p className="mt-5 text-sm font-semibold text-[#75e5a5]">{config.eyebrow}</p>
              <h1 className="mt-2 text-3xl font-bold tracking-[-0.04em] sm:text-4xl">{config.title}</h1>
              <p className="mt-4 max-w-2xl leading-7 text-white/80">{config.description}</p>
            </div>
            <Link href={config.action.href} className="relative inline-flex h-12 shrink-0 items-center justify-center gap-2 rounded-xl bg-[#00a94f] px-6 text-sm font-semibold text-white shadow-lg transition hover:bg-[#008f43] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white">{config.action.label}<AppIcon name="arrowRight" /></Link>
          </div>
          {config.stats.length > 0 && <div className="mt-6 grid gap-4 sm:grid-cols-3">
            {config.stats.map((stat) => <div key={stat.label} className="rounded-2xl border border-[#dfe8e2] bg-white px-6 py-5 shadow-sm"><strong className="text-2xl text-[#008f45]">{stat.value}</strong><span className="ml-2 text-sm text-[#6f7a87]">{stat.label}</span></div>)}
          </div>}
        </div>
      </section>

      {page === "courses" && <CoursePreferences values={preferenceValues} />}

      <section className="bg-white py-12">
        <div className="mx-auto max-w-[1180px] px-4 sm:px-6">
          <div className="flex flex-col gap-5 md:flex-row md:items-end md:justify-between">
            <div><h2 className="text-2xl font-bold">{config.sectionTitle}</h2><p className="mt-2 text-sm text-[#6f7a87]">{config.sectionDescription}</p></div>
            <form action={`/${page}`} role="search" className="flex w-full max-w-sm items-center gap-2 rounded-xl border border-[#dbe4de] bg-[#f5f7f6] px-3"><AppIcon name="search" className="size-4 text-[#738078]" /><label htmlFor={`${page}-search`} className="sr-only">{config.eyebrow} 검색</label><input id={`${page}-search`} name="q" type="search" placeholder="검색어를 입력하세요" className="h-11 min-w-0 flex-1 bg-transparent text-sm outline-none" /></form>
          </div>
          {pageFilters.length > 0 && <div className="mt-6 space-y-3 border-y border-[#e4ebe6] py-4">
            {pageFilters.map((group) => <div key={group.key} className="flex items-center gap-3">
              <span className="w-20 shrink-0 text-xs font-semibold text-[#778279]">{group.label}</span>
              <div className="flex min-w-0 gap-2 overflow-x-auto pb-1">
                {group.items.map((item) => {
                  const multiSelect = group.key === "sport" || group.key === "region";
                  const activeValues = group.key === "sport" ? activeSportFilters : activeRegionFilters;
                  const active = multiSelect
                    ? item.value ? activeValues.includes(item.value) : activeValues.length === 0
                    : (activeFilters[group.key] ?? "") === item.value;
                  const nextParams = new URLSearchParams(searchParams.toString());
                  nextParams.delete(group.key);
                  if (multiSelect && item.value) {
                    const nextValues = active
                      ? activeValues.filter((value) => value !== item.value)
                      : [...activeValues, item.value];
                    nextValues.forEach((value) => nextParams.append(group.key, value));
                  } else if (!multiSelect && item.value) {
                    nextParams.set(group.key, item.value);
                  }
                  const query = nextParams.toString();
                  const href = query ? `/${page}?${query}` : `/${page}`;
                  return <Link key={item.label} href={href} aria-label={`${item.label}${active ? " 선택됨" : ""}`} className={`inline-flex h-9 shrink-0 items-center gap-1.5 rounded-full border px-4 text-xs font-semibold transition ${active ? "border-[#008f45] bg-[#008f45] text-white" : "border-[#dfe6e1] bg-white text-[#5f6b63] hover:border-[#8db69b] hover:text-[#008f45]"}`}><AppIcon name={item.icon} />{item.label}</Link>;
                })}
              </div>
            </div>)}
          </div>}
          {(recommendationNeedsLogin || recommendationPending || apiMessage) && <p className="mt-6 rounded-xl bg-[#f3f7f4] px-4 py-3 text-sm text-[#5f6b63]">{recommendationNeedsLogin ? "맞춤 코스 추천은 로그인이 필요합니다. 상단의 로그인 버튼으로 로그인한 뒤 다시 추천받아 주세요." : recommendationPending ? "강릉시 힐링 코스를 추천하고 있습니다." : apiMessage}</p>}
          <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {cards.map((card, index) => {
              const content = <article className="group h-full overflow-hidden rounded-2xl border border-[#e0e7e2] bg-white shadow-sm transition group-hover:-translate-y-1 group-hover:shadow-xl"><div className="relative aspect-[4/2.5] overflow-hidden"><Image src={card.image} alt={`${card.title} 대표 이미지`} fill sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw" className="object-cover transition duration-300 group-hover:scale-105" /><div className="absolute left-3 top-3 flex flex-wrap gap-1.5"><span className="rounded-lg bg-white/95 px-2.5 py-1 text-xs font-semibold text-[#344054]">{card.tag}</span>{card.secondaryTag && <span className="rounded-lg bg-[#173a2d]/95 px-2.5 py-1 text-xs font-semibold text-white">{card.secondaryTag}</span>}</div></div><div className="p-5"><span className="flex size-9 items-center justify-center rounded-xl bg-[#e8f3ec] text-[#008f45]"><AppIcon name={card.icon} className="size-4" /></span><h3 className="mt-4 font-bold">{card.title}</h3>{card.facilityTag && <p className="mt-2 flex items-center gap-1.5 text-xs font-bold text-[#8a6800]"><AppIcon name="clipboard" />{card.facilityTag}</p>}<p className="mt-2 min-h-10 text-sm leading-5 text-[#6f7a87]">{card.description}</p><p className="mt-4 flex items-center gap-1.5 text-xs font-semibold text-[#008f45]"><AppIcon name="mapPin" />{card.meta}</p></div></article>;
              return card.href ? <Link key={`${card.title}-${index}`} href={card.href} className="group block cursor-pointer rounded-2xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#008f45]">{content}</Link> : <div key={`${card.title}-${index}`}>{content}</div>;
            })}
          </div>
          {page === "sports" && remoteCards !== null && (
            <div ref={sportsSentinelRef} className="flex min-h-24 items-center justify-center" aria-live="polite">
              {loadingMoreSports && <span className="inline-flex items-center gap-2 text-sm font-semibold text-[#008f45]"><span className="size-4 animate-spin rounded-full border-2 border-[#b9dac5] border-t-[#008f45]" />스포츠를 더 불러오는 중...</span>}
              {!hasMoreSports && !loadMoreError && <span className="text-sm text-[#7a867f]">모든 스포츠를 확인했습니다.</span>}
              {loadMoreError && <button type="button" onClick={() => setLoadMoreError(false)} className="cursor-pointer rounded-xl border border-[#b9d5c3] bg-white px-4 py-2 text-sm font-semibold text-[#008f45] hover:bg-[#f0f8f3]">다시 불러오기</button>}
            </div>
          )}
        </div>
      </section>

      <section className="bg-[#f3f7f4] py-12">
        <div className="mx-auto grid max-w-[1180px] gap-5 px-4 sm:grid-cols-2 sm:px-6 lg:grid-cols-4">
          {portalQuickLinks.map((item) => {
            const content = <><span className="flex size-10 items-center justify-center rounded-xl bg-[#e8f3ec] text-[#008f45]"><AppIcon name={item.icon} className="size-5" /></span><h3 className="mt-4 font-bold">{item.title}</h3><p className="mt-2 text-sm leading-6 text-[#6f7a87]">{item.text}</p></>;
            const className = "rounded-2xl border border-[#dfe8e2] bg-white p-6";
            if (item.href?.startsWith("/")) return <Link key={item.title} href={item.href} className={`${className} cursor-pointer transition hover:border-[#9ac4aa] hover:shadow-md`}>{content}</Link>;
            return item.href ? <a key={item.title} href={item.href} target="_blank" rel="noopener noreferrer" className={`${className} cursor-pointer transition hover:border-[#9ac4aa] hover:shadow-md`}>{content}</a> : <div key={item.title} className={className}>{content}</div>;
          })}
        </div>
      </section>
    </div>
  );
}
