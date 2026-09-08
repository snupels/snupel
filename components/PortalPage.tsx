"use client";

import Image, { type StaticImageData } from "next/image";
import Link from "next/link";
import Script from "next/script";
import { Suspense, useEffect, useRef, useState } from "react";
import { useSearchParams } from "next/navigation";
import { api } from "@/lib/api/service";
import { missionPresentation } from "@/lib/missionCatalog";
import { isGeneralSportsFacility, sportsFacilityType } from "@/lib/sportsFacility";
import { isExcludedSportActivity, sportsImage } from "@/lib/sportsImage";
import { AppIcon, type AppIconName } from "./AppIcon";
import { CoursePreferences } from "./CoursePreferences";
import heroImage from "@/imports/LandingPage/a0d5da596bc83d9effc7a18d6702727ac6b06d43.png";

export type PortalPageKey = "sports" | "courses" | "missions" | "events" | "mypage";

const portalQuickLinks: Array<{ icon: AppIconName; title: string; text: string; href?: string }> = [
  { icon: "map", title: "지역별로 보기", text: "강원 18개 시군의 활동을 지도에서 확인하세요.", href: "/map" },
  { icon: "calendar", title: "일정에 저장", text: "관심 활동과 행사를 내 일정에 모아보세요.", href: "https://calendar.google.com/calendar/u/0/r" },
  { icon: "users", title: "스포츠 피드", text: "강원에서 즐긴 순간을 사진으로 나눠보세요.", href: "/community" },
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
};

type PortalCard = { image: string | StaticImageData; tag: string; secondaryTag?: string; facilityTag?: string; title: string; description: string; meta: string; icon: AppIconName; href?: string; mapHref?: string; order?: number; hidden?: boolean; latitude?: number | null; longitude?: number | null; sigun?: string | null; kakaoPlaceId?: string | null };

type CoursePlan = {
  title: string;
  description: string;
  stopCount: number;
  activityMinutes: number;
  travelMinutes: number;
  totalEstimatedMinutes: number;
  legs: Array<{ distanceKm: number; travelMinutes: number }>;
  mapHref: string | null;
};

const configs: Record<PortalPageKey, PageConfig> = {
  sports: {
    eyebrow: "스포츠 탐색",
    title: "강원 곳곳의 스포츠를 한눈에",
    description: "지역과 종목을 골라 강원의 스포츠 장소와 이용 정보를 찾아보세요.",
    icon: "mountain",
    action: { label: "맞춤 코스 보기", href: "/courses" },
    stats: [],
    sectionTitle: "강원 스포츠 장소",
    sectionDescription: "공공 관광정보를 바탕으로 장소와 이용 정보를 확인해 보세요.",
  },
  courses: {
    eyebrow: "맞춤 코스",
    title: "하루와 취향에 맞춘 강원 여행",
    description: "스포츠와 지역 명소를 자연스럽게 연결한 일정으로 계획 부담을 줄였습니다.",
    icon: "map",
    action: { label: "스포츠부터 찾기", href: "/sports" },
    stats: [],
    sectionTitle: "추천 맞춤 코스",
    sectionDescription: "추천 장소를 방문 순서대로 연결한 하나의 일정입니다.",
  },
  missions: {
    eyebrow: "패스포트 미션",
    title: "도전하고 인증하며 패스포트를 완성하세요",
    description: "스포츠 참여와 지역 방문을 기록하고 스탬프와 리워드를 모아보세요.",
    icon: "award",
    action: { label: "내 패스포트", href: "/mypage" },
    stats: [],
    sectionTitle: "참여할 수 있는 미션",
    sectionDescription: "처음 참여해도 완료 조건을 쉽게 이해할 수 있는 미션입니다.",
  },
  events: {
    eyebrow: "이벤트 · 축제",
    title: "스포츠가 축제가 되는 순간",
    description: "대회, 체험 행사, 지역 축제 일정을 한곳에서 확인하고 참여하세요.",
    icon: "calendar",
    action: { label: "미션과 함께 보기", href: "/missions" },
    stats: [],
    sectionTitle: "다가오는 행사",
    sectionDescription: "행사 일정과 장소를 확인하고, 참가 접수는 공식 안내에서 확인해 주세요.",
  },
  mypage: {
    eyebrow: "마이페이지",
    title: "나의 강원 스포츠 패스포트",
    description: "방문 기록, 스탬프, 진행 중인 미션과 다음 리워드를 한눈에 확인하세요.",
    icon: "trophy",
    action: { label: "새 미션 찾기", href: "/missions" },
    stats: [],
    sectionTitle: "최근 활동",
    sectionDescription: "인증 기록과 이어서 도전할 활동을 정리했습니다.",
  },
};

type FilterGroup = { label: string; key: string; items: Array<{ label: string; value: string; icon: AppIconName }> };

const regions = ["전체 지역", "춘천", "원주", "강릉", "동해", "태백", "속초", "삼척", "홍천", "횡성", "영월", "평창", "정선", "철원", "화천", "양구", "인제", "고성", "양양"].map((label) => ({ label, value: label === "전체 지역" ? "" : label, icon: "mapPin" as AppIconName }));
const sports = [
  { label: "전체 스포츠", value: "", icon: "medal" as AppIconName },
  { label: "산악스포츠", value: "산악스포츠", icon: "mountain" as AppIconName },
  { label: "동계스포츠", value: "동계스포츠", icon: "snowflake" as AppIconName },
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

const unavailablePhoto = "/place-image-unavailable.svg";
const themeLabels = { healing: "힐링", thrill: "스릴", photo_spot: "포토 스팟", stamp: "스탬프" };
const sportsPageSize = 20;
const KAKAO_MAP_KEY = process.env.NEXT_PUBLIC_KAKAO_MAP_APP_KEY;

type KakaoPlaceResult = { id: string; place_name: string; x: string; y: string };
type KakaoPlacesSdk = {
  maps: {
    load(callback: () => void): void;
    LatLng: new (latitude: number, longitude: number) => object;
    services: {
      Status: { OK: string };
      Places: new () => {
        keywordSearch(query: string, callback: (results: KakaoPlaceResult[], status: string) => void, options: { location: object; radius: number }): void;
      };
    };
  };
};

function kakaoMapPoint(title: string, latitude: number, longitude: number) {
  return `${encodeURIComponent(title)},${latitude},${longitude}`;
}

function kakaoRouteHref(stops: Array<{ title: string; latitude: number | null; longitude: number | null; placeId?: string | null }>) {
  if (stops.length < 2 || stops.length > 7 || stops.some((stop) => !stop.placeId && (stop.latitude === null || stop.longitude === null))) return null;
  return `https://map.kakao.com/link/by/car/${stops.map((stop) => stop.placeId ?? kakaoMapPoint(stop.title, stop.latitude!, stop.longitude!)).join("/")}`;
}

function kakaoPlaceHref(title: string, sigun?: string | null, placeId?: string | null) {
  return placeId
    ? `https://map.kakao.com/link/map/${placeId}`
    : `https://map.kakao.com/link/search/${encodeURIComponent([title, sigun].filter(Boolean).join(" "))}`;
}

function findKakaoPlaceId(title: string, latitude: number | null, longitude: number | null) {
  const kakao = window.kakao as unknown as KakaoPlacesSdk | undefined;
  if (!kakao || latitude === null || longitude === null) return Promise.resolve(null);
  const normalizedTitle = title.replace(/\s+/g, "");
  return new Promise<string | null>((resolve) => {
    new kakao.maps.services.Places().keywordSearch(title, (results, status) => {
      if (status !== kakao.maps.services.Status.OK) return resolve(null);
      const matches = results.filter((result) => {
        const name = result.place_name.replace(/\s+/g, "");
        return name.includes(normalizedTitle) || normalizedTitle.includes(name);
      });
      const nearest = matches.sort((a, b) => (
        (Number(a.y) - latitude) ** 2 + (Number(a.x) - longitude) ** 2
        - (Number(b.y) - latitude) ** 2 - (Number(b.x) - longitude) ** 2
      ))[0];
      resolve(nearest?.id ?? null);
    }, { location: new kakao.maps.LatLng(latitude, longitude), radius: 2000 });
  });
}

function sportCategory(sportName: string | null, placeName?: string | null) {
  const sport = sportName?.toLowerCase() ?? "";
  const place = placeName?.replace(/\s+/g, "").toLowerCase() ?? "";
  if (isGeneralSportsFacility(placeName)) return "스포츠";
  const isWalkingRoute = ["둘레길", "탐방로", "산소길", "트레킹", "걷기길", "산책로"].some((value) => place.includes(value))
    || /(?:길|로)$/.test(place);
  if (["짚와이어", "짚라인", "zipwire", "zipline"].some((value) => place.includes(value))) return "산악스포츠";
  if (["mtb", "hiking", "등산", "산악"].some((value) => sport.includes(value))) return "산악스포츠";
  if (["ski", "snow", "skating", "ice"].some((value) => sport.includes(value))) return "동계스포츠";
  if (["surf", "rafting", "kayak", "water", "sailing", "marine", "ocean", "yacht", "canoe", "wakeboard", "paddle", "sup", "snorkel", "scuba"].some((value) => sport.includes(value))) return "수상스포츠";
  if (isWalkingRoute || ["trekking", "trail", "running", "marathon", "walking", "athletics", "트레킹", "트레일", "러닝", "마라톤", "워킹", "걷기"].some((value) => sport.includes(value))) return "육상스포츠";
  if (["paragliding"].some((value) => sport.includes(value))) return "산악스포츠";
  if (["olympic", "legacy"].some((value) => sport.includes(value))) return "올림픽레거시";
  return "스포츠";
}

function sportCategories(
  sportName: string | null,
  metadata: Record<string, unknown> | null | undefined,
  placeName?: string | null,
) {
  const labels: Record<string, string> = {
    snow: "동계스포츠",
    olympic_legacy: "올림픽레거시",
  };
  const metadataCategories = Array.isArray(metadata?.sport_categories)
    ? metadata.sport_categories
      .map((value) => labels[String(value)] ?? "")
      .filter(Boolean)
    : [];
  return [...new Set(metadataCategories.length ? metadataCategories : [sportCategory(sportName, placeName)])];
}

function sportIcon(category: string): AppIconName {
  if (category === "산악스포츠") return "mountain";
  if (category === "동계스포츠") return "snowflake";
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

async function loadCards(page: PortalPageKey, dataPage = 1): Promise<PortalCard[]> {
  if (page === "sports") {
    return (await api.sports.list({ page: dataPage, size: sportsPageSize }))
      .map((activity) => {
        const categories = sportCategories(activity.sportName, activity.metadata, activity.placeName);
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
          hidden: isExcludedSportActivity(activity),
        };
      });
  }
  if (page === "events") {
    const events = await api.events.list({ page: 1, size: 100 });
    return [...events]
      .sort((first, second) => Number(Boolean(second.sportName)) - Number(Boolean(first.sportName)))
      .map((activity) => ({
      image: activity.representativeImageUrl ?? unavailablePhoto,
      tag: activity.sportName ? "스포츠 행사" : activity.category === "festival" ? "축제" : "이벤트",
      title: activity.placeName ?? activity.sportName ?? `행사 #${activity.id}`,
      description: activity.summary ?? "강원에서 열리는 스포츠 행사입니다.",
      meta: `${activityDate(activity.startsAt, activity.endsAt)} · ${activity.sigun ?? activity.region ?? "강원"}`,
      icon: "calendar" as const,
      href: `/events/detail?id=${activity.id}`,
      }));
  }
  if (page === "courses") {
    return (await api.courses.list()).map((course) => ({
      image: course.representativeImageUrl ?? unavailablePhoto,
      tag: themeLabels[course.theme],
      title: course.title ?? `${themeLabels[course.theme]} 코스 #${course.id}`,
      description: course.description ?? (course.recommendedCompanion ? `${course.recommendedCompanion}와 함께하기 좋은 코스` : "추천 스포츠 코스"),
      meta: course.estimatedDurationMinutes ? `약 ${course.estimatedDurationMinutes}분` : "소요 시간 미정",
      icon: "map" as const,
    }));
  }
  if (page === "missions") {
    const allCourses = [];
    for (let pageNumber = 1; ; pageNumber += 1) {
      const batch = await api.courses.list(pageNumber, 100);
      allCourses.push(...batch);
      if (batch.length < 100) break;
    }
    const courses = allCourses.filter((course) => course.isPublished && course.category === "event");
    const itineraries = await Promise.all(courses.map((course) => (
      api.courseItinerary(course.id).catch(() => null)
    )));
    return courses.map((course, index) => {
      const presentation = missionPresentation(course, itineraries[index]?.stops[0]);
      return {
        image: course.representativeImageUrl ?? sportsImage({ placeName: course.title ?? null, sportName: course.sportName, representativeImageUrl: null, metadata: null }, [presentation.category.replace(/\s/g, "")]),
        tag: presentation.category,
        title: course.title ?? `이벤트 미션 #${course.id}`,
        description: "",
        meta: `${presentation.region} · 스탬프 1개`,
        icon: presentation.category === "올림픽 레거시" ? "olympicRings" as const : "medal" as const,
        href: `/missions/detail?id=${course.id}`,
      };
    });
  }

  return (await api.activities.list())
    .map((activity) => ({
      image: activity.representativeImageUrl ?? unavailablePhoto,
      tag: activity.category === "sports" ? "스포츠" : activity.category === "event" ? "이벤트" : "축제",
      title: activity.sportName ?? activity.placeName ?? `활동 #${activity.id}`,
      description: activity.placeName ? `${activity.placeName}에서 즐기는 강원 스포츠 활동` : "강원 스포츠 활동",
      meta: [activity.region, activity.placeName].filter(Boolean).join(" · ") || "장소 미정",
      icon: activity.category === "sports" ? "activity" as const : "calendar" as const,
    }));
}

export function PortalPage({ page }: { page: PortalPageKey }) {
  return <Suspense><PortalPageRoute page={page} /></Suspense>;
}

function PortalPageRoute({ page }: { page: PortalPageKey }) {
  const query = useSearchParams().toString();
  // A new recommendation must not briefly display the previous route's result.
  return <PortalPageContent key={page === "courses" ? `${page}:${query}` : page} page={page} />;
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
  const recommendationRequested = page === "courses" && searchParams.get("recommend") === "1";
  const recommendationNeedsLogin = recommendationRequested && !api.hasToken();
  const config = configs[page];
  const pageFilters = filterGroups[page] ?? [];
  const [remoteCards, setRemoteCards] = useState<PortalCard[] | null>(null);
  const [coursePlan, setCoursePlan] = useState<CoursePlan | null>(null);
  const [kakaoPlacesReady, setKakaoPlacesReady] = useState(false);
  const [apiMessage, setApiMessage] = useState("");
  const [retryAttempt, setRetryAttempt] = useState(0);
  const [initialLoadFailed, setInitialLoadFailed] = useState(false);
  const recommendationPending = recommendationRequested && !recommendationNeedsLogin && remoteCards === null && !apiMessage;
  const [sportsPage, setSportsPage] = useState(1);
  const [hasMoreSports, setHasMoreSports] = useState(true);
  const [loadingMoreSports, setLoadingMoreSports] = useState(false);
  const [loadMoreError, setLoadMoreError] = useState(false);
  const sportsSentinelRef = useRef<HTMLDivElement>(null);
  const sportsLoadingRef = useRef(false);
  const kakaoLookupRef = useRef("");

  useEffect(() => {
    const publicPage = page === "sports" || page === "events" || page === "missions";
    if (page === "courses") return;
    if (!publicPage && !api.hasToken()) return;
    let cancelled = false;
    let retryTimer: ReturnType<typeof setTimeout> | undefined;
    let attempts = 0;

    const requestCards = () => loadCards(page)
      .then((cards) => {
        if (cancelled) return;
        setRemoteCards(cards);
        setInitialLoadFailed(false);
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
        setInitialLoadFailed(true);
        setApiMessage("데이터를 불러오지 못했습니다. 다시 불러오기를 눌러 주세요.");
      });

    void requestCards();
    return () => {
      cancelled = true;
      if (retryTimer) clearTimeout(retryTimer);
    };
  }, [page, recommendationRequested, retryAttempt]);

  useEffect(() => {
    if (page !== "courses" || !recommendationRequested) return;
    if (!api.hasToken()) return;

    const params = new URLSearchParams(recommendationQuery);
    const selectedTheme = params.get("theme");
    const theme = selectedTheme === "thrill" || selectedTheme === "photo_spot" || selectedTheme === "stamp"
      ? selectedTheme
      : "healing";
    const availableMinutes = Number(params.get("availableMinutes"));
    const selectedMinutes = Number.isInteger(availableMinutes) && availableMinutes > 0 && availableMinutes <= 1440
      ? availableMinutes
      : 360;
    let cancelled = false;

    api.courseRecommendations({
      theme,
      region: params.get("region") || "강원특별자치도",
      sigun: params.get("sigun") || "강릉시",
      sport: params.get("sport") || null,
      availableMinutes: selectedMinutes,
    }).then((recommendation) => {
      if (cancelled) return;

      const recommendedCards: PortalCard[] = recommendation.stops.map((stop, index) => {
        const category = sportCategory(params.get("sport"), stop.placeName);
        const title = stop.placeName ?? `추천 장소 #${stop.activityId}`;
        return {
          image: stop.representativeImageUrl ?? unavailablePhoto,
          tag: themeLabels[theme],
          title,
          description: stop.reason,
          meta: [stop.address ?? "주소 정보 없음", `활동 약 ${stop.estimatedMinutes}분`].join(" · "),
          icon: sportIcon(category),
          href: `/sports/detail/?id=${stop.activityId}`,
          mapHref: kakaoPlaceHref(title, params.get("sigun")),
          order: index + 1,
          latitude: stop.latitude,
          longitude: stop.longitude,
          sigun: params.get("sigun"),
        };
      });
      setRemoteCards(recommendedCards);
      setCoursePlan(recommendedCards.length ? {
        title: recommendation.title,
        description: recommendation.description,
        stopCount: recommendedCards.length,
        activityMinutes: recommendation.activityMinutes,
        travelMinutes: recommendation.travelMinutes,
        totalEstimatedMinutes: recommendation.totalEstimatedMinutes,
        legs: recommendation.legs,
        mapHref: kakaoRouteHref(recommendedCards.map((card, index) => ({
          title: card.title,
          latitude: recommendation.stops[index].latitude,
          longitude: recommendation.stops[index].longitude,
        }))),
      } : null);
      setApiMessage(recommendedCards.length
        ? `추천 일치도 ${recommendation.matchScore}% · ${recommendation.usedAi ? "AI 맞춤 추천" : "조건 기반 추천"}`
        : "선택한 조건에 맞는 추천 코스가 없습니다. 지역이나 종목을 바꿔 다시 시도해 주세요.");
    }).catch((error: unknown) => {
      if (cancelled) return;
      setRemoteCards([]);
      setCoursePlan(null);
      const status = typeof error === "object" && error && "status" in error ? Number(error.status) : 0;
      setApiMessage(status === 401
        ? "로그인 정보가 만료되었습니다. 다시 로그인한 뒤 추천받아 주세요."
        : "맞춤 코스를 불러오지 못했습니다. 잠시 후 다시 시도해 주세요.");
    });

    return () => { cancelled = true; };
  }, [page, recommendationQuery, recommendationRequested]);

  const kakaoLookupKey = page === "courses" && remoteCards
    ? `${recommendationQuery}:${remoteCards.map((card) => card.title).join("|")}`
    : "";

  useEffect(() => {
    if (!kakaoPlacesReady || !remoteCards?.length || !kakaoLookupKey || kakaoLookupRef.current === kakaoLookupKey) return;
    kakaoLookupRef.current = kakaoLookupKey;
    let cancelled = false;

    void Promise.all(remoteCards.map((card) => (
      findKakaoPlaceId(card.title, card.latitude ?? null, card.longitude ?? null).catch(() => null)
    ))).then((placeIds) => {
      if (cancelled) return;
      const enrichedCards = remoteCards.map((card, index) => ({
        ...card,
        kakaoPlaceId: placeIds[index],
        mapHref: kakaoPlaceHref(card.title, card.sigun, placeIds[index]),
      }));
      setRemoteCards(enrichedCards);
      setCoursePlan((plan) => plan ? {
        ...plan,
        mapHref: kakaoRouteHref(enrichedCards.map((card) => ({
          title: card.title,
          latitude: card.latitude ?? null,
          longitude: card.longitude ?? null,
          placeId: card.kakaoPlaceId,
        }))),
      } : plan);
    }).catch(() => {
      if (!cancelled) kakaoLookupRef.current = "";
    });

    return () => { cancelled = true; };
  }, [kakaoLookupKey, kakaoPlacesReady, remoteCards]);

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

  const cards = (recommendationNeedsLogin ? [] : remoteCards ?? []).filter((card) => {
    if (card.hidden) return false;
    const query = activeFilters.q?.toLowerCase();
    const matchesSport = page === "courses" || activeSportFilters.length === 0 || activeSportFilters.some((sport) => (
      card.title.includes(sport) || card.tag.replace(/\s/g, "").includes(sport.replace(/\s/g, "")) || card.secondaryTag?.includes(sport) || card.facilityTag?.includes(sport)
    ));
    const matchesRegion = page === "courses" || activeRegionFilters.length === 0 || activeRegionFilters.some((region) => card.meta.includes(region));
    return (!query || `${card.title} ${card.description} ${card.meta}`.toLowerCase().includes(query))
      && matchesRegion
      && matchesSport;
  });

  return (
    <div className="bg-[#f3f7f4] text-[#172033]">
      {page === "courses" && KAKAO_MAP_KEY && <Script id="kakao-map-sdk" src={`https://dapi.kakao.com/v2/maps/sdk.js?appkey=${KAKAO_MAP_KEY}&autoload=false&libraries=clusterer,services`} strategy="afterInteractive" onReady={() => (window.kakao as unknown as KakaoPlacesSdk | undefined)?.maps.load(() => setKakaoPlacesReady(true))} onError={() => { kakaoLookupRef.current = ""; setKakaoPlacesReady(false); }} />}
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

      {page === "courses" && <CoursePreferences key={recommendationPending || Boolean(coursePlan) ? "collapsed" : "expanded"} values={preferenceValues} collapsed={recommendationPending || Boolean(coursePlan)} />}

      <section className="bg-white py-12">
        <div className="mx-auto max-w-[1180px] px-4 sm:px-6">
          <div className="flex flex-col gap-5 md:flex-row md:items-end md:justify-between">
            <div><h2 className="text-2xl font-bold">{config.sectionTitle}</h2><p className="mt-2 text-sm text-[#6f7a87]">{config.sectionDescription}</p></div>
            {page !== "courses" && <form key={searchParams.toString()} action={`/${page}`} role="search" className="flex w-full max-w-sm items-center gap-2 rounded-xl border border-[#dbe4de] bg-[#f5f7f6] px-3">
              {activeSportFilters.map((value) => <input key={`sport-${value}`} type="hidden" name="sport" value={value} />)}
              {activeRegionFilters.map((value) => <input key={`region-${value}`} type="hidden" name="region" value={value} />)}
              <label htmlFor={`${page}-search`} className="sr-only">{config.eyebrow} 검색</label>
              <input id={`${page}-search`} name="q" defaultValue={activeFilters.q ?? ""} type="search" placeholder="장소명이나 지역을 검색하세요" className="h-11 min-w-0 flex-1 bg-transparent text-sm outline-none" />
              <button type="submit" aria-label="검색" className="flex size-9 shrink-0 cursor-pointer items-center justify-center rounded-lg text-[#008f45] hover:bg-[#e5f3ea] focus-visible:outline focus-visible:outline-2 focus-visible:outline-[#008f45]"><AppIcon name="search" className="size-4" /></button>
            </form>}
          </div>
          {page !== "courses" && pageFilters.length > 0 && <div className="mt-6 space-y-3 border-y border-[#e4ebe6] py-4">
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
          {(recommendationNeedsLogin || recommendationPending || apiMessage) && <div role="status" className="mt-6 rounded-xl bg-[#f3f7f4] px-4 py-3 text-sm text-[#5f6b63]">
            <p>{recommendationNeedsLogin ? "로그인하면 선택한 조건으로 맞춤 코스를 추천받을 수 있어요." : recommendationPending ? `${searchParams.get("sigun") || "강릉시"}의 선택한 조건에 맞는 코스를 추천하고 있습니다.` : apiMessage}</p>
            {recommendationNeedsLogin && <Link href={`/login?next=${encodeURIComponent(`/courses/?${recommendationQuery}`)}`} className="mt-3 inline-flex rounded-lg bg-[#008f45] px-4 py-2 font-bold text-white">로그인하고 추천받기</Link>}
            {initialLoadFailed && <button type="button" onClick={() => { setInitialLoadFailed(false); setApiMessage(""); setRetryAttempt((attempt) => attempt + 1); }} className="mt-3 cursor-pointer rounded-lg border border-[#9dcdb0] px-4 py-2 font-bold text-[#00783a]">다시 불러오기</button>}
          </div>}
          {page !== "courses" && remoteCards === null && !initialLoadFailed && <p role="status" className="mt-6 text-sm text-[#637069]">{config.eyebrow} 정보를 불러오는 중입니다…</p>}
          {remoteCards !== null && cards.length === 0 && !recommendationNeedsLogin && !apiMessage && <div className="mt-6 rounded-2xl border border-[#dfe8e2] p-8 text-center">
            <p className="text-sm text-[#637069]">{page === "sports" && hasMoreSports ? "조건에 맞는 장소를 찾기 위해 다음 스포츠 정보를 불러오고 있습니다." : "선택한 조건에 맞는 결과가 없습니다. 검색어나 지역·종목을 바꿔 보세요."}</p>
            <Link href={`/${page}`} className="mt-4 inline-flex text-sm font-bold text-[#008f45]">검색 조건 초기화</Link>
          </div>}
          {coursePlan && <section aria-labelledby="recommended-course-title" className="mt-6 flex flex-col gap-6 rounded-[24px] border border-[#cfe1d5] bg-[#f3f8f5] p-6 sm:p-7 lg:flex-row lg:items-center lg:justify-between">
            <div className="max-w-3xl">
              <p className="text-xs font-bold text-[#008f45]">나만의 추천 일정</p>
              <h3 id="recommended-course-title" className="mt-2 text-2xl font-bold tracking-[-0.03em]">{coursePlan.title}</h3>
              <p className="mt-3 text-sm leading-6 text-[#59675f]">{coursePlan.description}</p>
              <div className="mt-4 flex flex-wrap gap-2 text-xs font-semibold text-[#405149]">
                <span className="rounded-full bg-white px-3 py-1.5">{coursePlan.stopCount}개 장소</span>
                <span className="rounded-full bg-white px-3 py-1.5">활동 {coursePlan.activityMinutes}분</span>
                <span className="rounded-full bg-white px-3 py-1.5">이동 {coursePlan.travelMinutes}분</span>
                <span className="rounded-full bg-white px-3 py-1.5">총 예상 {coursePlan.totalEstimatedMinutes}분</span>
              </div>
            </div>
            {coursePlan.mapHref ? <a href={coursePlan.mapHref} target="_blank" rel="noopener noreferrer" className="inline-flex h-12 shrink-0 items-center justify-center gap-2 rounded-xl bg-[#008f45] px-6 text-sm font-bold text-white transition hover:bg-[#00783a] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#008f45] focus-visible:ring-offset-2"><AppIcon name="map" className="size-4" />카카오맵 전체 길찾기<AppIcon name="arrowRight" className="size-4" /></a> : <p className="max-w-52 text-xs leading-5 text-[#6f7a87]">모든 장소의 좌표가 확인되면 전체 길찾기를 열 수 있습니다.</p>}
          </section>}
          <div className={`mt-8 grid gap-5 sm:grid-cols-2 ${page === "courses" ? "lg:grid-cols-5" : "lg:grid-cols-4"}`}>
            {cards.map((card, index) => {
              const content = <article className="group flex h-full flex-col overflow-hidden rounded-2xl border border-[#e0e7e2] bg-white shadow-sm transition group-hover:-translate-y-1 group-hover:shadow-xl"><div className="relative aspect-[4/2.5] overflow-hidden"><Image src={card.image} alt={`${card.title} 대표 이미지`} fill sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw" className="object-cover transition duration-300 group-hover:scale-105" /><div className="absolute left-3 top-3 flex flex-wrap gap-1.5">{card.order && <span className="flex size-7 items-center justify-center rounded-full bg-[#008f45] text-xs font-bold text-white" aria-label={`${card.order}번째 장소`}>{card.order}</span>}<span className="rounded-lg bg-white/95 px-2.5 py-1 text-xs font-semibold text-[#344054]">{card.tag}</span>{card.secondaryTag && <span className="rounded-lg bg-[#173a2d]/95 px-2.5 py-1 text-xs font-semibold text-white">{card.secondaryTag}</span>}</div></div><div className="flex flex-1 flex-col p-5"><span className="flex size-9 items-center justify-center rounded-xl bg-[#e8f3ec] text-[#008f45]"><AppIcon name={card.icon} className="size-4" /></span><h3 className="mt-4 font-bold">{card.title}</h3>{card.facilityTag && <p className="mt-2 flex items-center gap-1.5 text-xs font-bold text-[#8a6800]"><AppIcon name="clipboard" />{card.facilityTag}</p>}{card.description && <p className="mt-2 min-h-10 text-sm leading-5 text-[#6f7a87]">{card.description}</p>}<p className="mt-4 flex items-center gap-1.5 text-xs font-semibold text-[#008f45]"><AppIcon name="mapPin" />{card.meta}</p>{card.mapHref && <div className="mt-auto flex gap-2 border-t border-[#edf1ee] pt-4"><a href={card.mapHref} target="_blank" rel="noopener noreferrer" className="inline-flex h-9 flex-1 items-center justify-center gap-1.5 rounded-lg bg-[#fae100] px-3 text-xs font-bold text-[#191919] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#8a7d00]"><AppIcon name="map" />카카오맵</a>{card.href && <Link href={card.href} className="inline-flex h-9 items-center justify-center rounded-lg border border-[#dce5df] px-3 text-xs font-bold text-[#526058] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#008f45]">상세</Link>}</div>}</div></article>;
              const leg = page === "courses" ? coursePlan?.legs[index - 1] : undefined;
              return <div key={`${card.title}-${index}`} className="flex flex-col gap-3">{leg && <div className="flex items-center justify-center gap-2 rounded-xl border border-dashed border-[#b9d5c3] bg-[#e8f3ec] px-3 py-2 text-xs font-semibold text-[#405149]"><AppIcon name="map" className="size-4 text-[#008f45]" />{leg.distanceKm.toFixed(1)}km · 이동 {leg.travelMinutes}분</div>}{card.mapHref ? <div className="group">{content}</div> : card.href ? <Link href={card.href} className="group block cursor-pointer rounded-2xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#008f45]">{content}</Link> : <div>{content}</div>}</div>;
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
