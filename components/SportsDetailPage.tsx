"use client";

import Image, { type StaticImageData } from "next/image";
import Link from "next/link";
import { Suspense, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import type { ActivityResponse } from "@/lib/api/dto";
import { api } from "@/lib/api/service";
import { verifiedSportWebsite } from "@/lib/sportsWebsites";
import { isGeneralSportsFacility, sportsFacilityType } from "@/lib/sportsFacility";
import { isExcludedSportActivity, sportsImage, sportsPhotoSource } from "@/lib/sportsImage";
import { AppIcon, type AppIconName } from "./AppIcon";
import { SportsLocationMap } from "./SportsLocationMap";
import { sportsDescription } from "@/lib/sportsDescription";

type DetailItem = {
  label: string;
  value: string;
  icon: AppIconName;
};

function detailImage(activity: ActivityResponse): StaticImageData | string {
  return sportsImage(activity);
}

function metadataText(
  metadata: Record<string, unknown> | null | undefined,
  keywords: string[],
) {
  if (!metadata) return null;
  const entry = Object.entries(metadata).find(([key, value]) => {
    const normalizedKey = key.toLocaleLowerCase("ko-KR");
    return keywords.some((keyword) => normalizedKey.includes(keyword))
      && (typeof value === "string" || typeof value === "number");
  });
  if (!entry) return null;
  const value = String(entry[1]).trim();
  return value && value !== "0" && value.toLowerCase() !== "null" ? value : null;
}

function isReferenceSource(url: string) {
  try {
    const parsed = new URL(url);
    if (parsed.protocol !== "https:" && parsed.protocol !== "http:") return false;
    const hostname = parsed.hostname.toLowerCase();
    // Dataset catalog pages are not visitor information; retain actual course resources.
    if (hostname === "data.go.kr" || hostname.endsWith(".data.go.kr")) return false;
    return hostname === "durunubi.kr"
      || hostname === "www.durunubi.kr"
      || /\.(?:gpx|zip)$/i.test(parsed.pathname);
  } catch {
    return false;
  }
}

function referenceSourceLabel(url: string) {
  const hostname = new URL(url).hostname.toLowerCase();
  if (hostname === "durunubi.kr" || hostname === "www.durunubi.kr") return "두루누비 코스 정보";
  return "코스 원본 자료";
}

function isOfficialFacilityWebsite(url: string) {
  if (isReferenceSource(url)) return false;
  try {
    const parsed = new URL(url);
    if (parsed.protocol !== "https:" && parsed.protocol !== "http:") return false;
    const hostname = parsed.hostname.toLowerCase();
    return hostname !== "go.kr"
      && !hostname.endsWith(".go.kr")
      && hostname !== "map.kakao.com"
      && hostname !== "place.map.kakao.com"
      && hostname !== "kko.to"
      && hostname !== "durunubi.kr"
      && hostname !== "www.durunubi.kr";
  } catch {
    return false;
  }
}

function DetailLoading() {
  return (
    <main className="min-h-[70vh] bg-[#f3f7f4] px-5 py-16 text-[#172033]">
      <div className="mx-auto max-w-[1080px] animate-pulse">
        <div className="h-5 w-40 rounded bg-[#dce6df]" />
        <div className="mt-7 aspect-[16/7] rounded-[28px] bg-[#dce6df]" />
      </div>
    </main>
  );
}

export function SportsDetailPage() {
  return <Suspense fallback={<DetailLoading />}><SportsDetailRoute /></Suspense>;
}

function SportsDetailRoute() {
  const searchParams = useSearchParams();
  const activityId = Number(searchParams.get("id"));
  return <SportsDetailContent key={activityId} activityId={activityId} />;
}

function SportsDetailContent({ activityId }: { activityId: number }) {
  const validId = Number.isInteger(activityId) && activityId > 0;
  const [activity, setActivity] = useState<ActivityResponse | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!validId) return;
    let cancelled = false;
    api.activities.get(activityId)
      .then((item) => {
        if (!cancelled) setActivity(item);
      })
      .catch(() => {
        if (!cancelled) setError("상세 정보를 불러오지 못했습니다. 잠시 후 다시 시도해 주세요.");
      });
    return () => {
      cancelled = true;
    };
  }, [activityId, validId]);

  if (validId && !activity && !error) return <DetailLoading />;

  if (!activity || isExcludedSportActivity(activity)) {
    return (
      <main className="min-h-[70vh] bg-[#f3f7f4] px-5 py-16 text-[#172033]">
        <div className="mx-auto max-w-[720px] rounded-[28px] border border-[#dce6df] bg-white p-10 text-center shadow-sm">
          <span className="mx-auto flex size-14 items-center justify-center rounded-2xl bg-[#e8f3ec] text-[#008f45]"><AppIcon name="activity" className="size-7" /></span>
          <h1 className="mt-5 text-2xl font-bold">상세 정보를 표시할 수 없어요</h1>
          <p className="mt-3 text-sm leading-6 text-[#68756d]">{error || "스포츠 정보를 찾을 수 없습니다."}</p>
          <Link href="/sports" className="mt-7 inline-flex h-11 items-center gap-2 rounded-xl bg-[#008f45] px-5 text-sm font-bold text-white">스포츠 탐색으로 돌아가기<AppIcon name="arrowRight" /></Link>
        </div>
      </main>
    );
  }

  const title = activity.placeName ?? activity.sportName ?? `스포츠 활동 #${activity.id}`;
  const isSportsPlace = activity.category === "sports";
  const location = activity.address ?? activity.sigun ?? activity.region ?? "강원특별자치도";
  const phone = metadataText(activity.metadata, ["phone", "tel", "전화", "연락처"]);
  const hours = metadataText(activity.metadata, ["opentime", "usetime", "운영시간", "이용시간"]);
  const fee = metadataText(activity.metadata, ["fee", "price", "요금", "입장료", "이용료"]);
  const parking = metadataText(activity.metadata, ["parking", "주차"]);
  const type = sportsFacilityType(activity);
  const sportLabel = isGeneralSportsFacility(activity.placeName)
    ? "스포츠"
    : activity.sportName;
  const referenceSourceUrl = activity.sourceUrl && isReferenceSource(activity.sourceUrl)
    ? activity.sourceUrl
    : null;
  const officialWebsiteUrl = verifiedSportWebsite(activity) ?? (activity.sourceUrl && isOfficialFacilityWebsite(activity.sourceUrl)
    ? activity.sourceUrl
    : null);
  const photoSource = sportsPhotoSource(activity);
  const description = sportsDescription(activity);
  const details: DetailItem[] = [
    { label: "지역", value: [activity.region, activity.sigun].filter(Boolean).join(" · ") || "강원특별자치도", icon: "mapPin" },
    ...(sportLabel ? [{ label: "스포츠 종목", value: sportLabel, icon: "medal" as AppIconName }] : []),
    ...(type ? [{ label: "시설 유형", value: type, icon: "clipboard" as AppIconName }] : []),
    ...(phone ? [{ label: "문의", value: phone, icon: "phone" as AppIconName }] : []),
    ...(hours ? [{ label: "운영시간", value: hours, icon: "timer" as AppIconName }] : []),
    ...(fee ? [{ label: "이용요금", value: fee, icon: "gift" as AppIconName }] : []),
    ...(parking ? [{ label: "주차", value: parking, icon: "map" as AppIconName }] : []),
  ];
  return (
    <main className="min-h-screen bg-[#f3f7f4] px-5 pb-20 pt-10 text-[#172033] sm:px-8 sm:pt-14">
      <div className="mx-auto max-w-[1080px]">
        <Link href="/sports" className="inline-flex items-center gap-2 text-sm font-semibold text-[#637069] transition hover:text-[#008f45]"><AppIcon name="chevronLeft" className="size-5" />스포츠 탐색으로 돌아가기</Link>

        <article className="mt-7 overflow-hidden rounded-[28px] border border-[#dce6df] bg-white shadow-[0_18px_55px_rgba(23,58,45,0.12)]">
          <div className="relative aspect-[16/7] min-h-[280px] overflow-hidden bg-[#173a2d]">
            <Image src={detailImage(activity)} alt={`${title} 대표 이미지`} fill preload sizes="(max-width: 1080px) 100vw, 1080px" className="object-cover" />
            <div className="absolute inset-0 bg-gradient-to-t from-[#102c22]/95 via-[#102c22]/25 to-transparent" />
            <div className="absolute inset-x-0 bottom-0 p-7 text-white sm:p-10">
              <div className="flex flex-wrap gap-2">
                <span className="inline-flex rounded-full bg-[#00a94f] px-3 py-1 text-xs font-bold">{sportLabel ?? "강원 스포츠"}</span>
                {type && <span className="inline-flex rounded-full bg-white/20 px-3 py-1 text-xs font-bold backdrop-blur">{type}</span>}
              </div>
              <h1 className="mt-4 text-3xl font-bold tracking-[-0.04em] sm:text-4xl">{title}</h1>
              <p className="mt-3 flex items-center gap-2 text-sm text-white/80"><AppIcon name="mapPin" />{location}</p>
            </div>
          </div>

          {photoSource && <p className="px-7 pt-3 text-right text-xs text-[#637069] sm:px-10">사진 출처: <a href={photoSource.url} target="_blank" rel="noopener noreferrer" className="underline underline-offset-2">{photoSource.label}</a></p>}
          <div className="grid gap-10 p-7 sm:p-10 lg:grid-cols-[minmax(0,1fr)_340px]">
            <section>
              <p className="text-sm font-bold text-[#008f45]">{isSportsPlace ? "스포츠 장소 소개" : "여행 장소 소개"}</p>
              <h2 className="mt-3 text-2xl font-bold">{title} 이용 안내</h2>
              {(description.introduction || !description.trails.length) && <p className="mt-5 whitespace-pre-line break-words leading-8 text-[#526058]">
                {description.introduction || `${title}의 장소 정보입니다. 운영 시간과 이용 조건은 방문 전 안내처에 확인해 주세요.`}
              </p>}
              {description.trails.map((section, sectionIndex) => <section key={sectionIndex} aria-labelledby={`trail-heading-${sectionIndex}`} className="mt-7">
                <h3 id={`trail-heading-${sectionIndex}`} className="flex items-center gap-2 text-lg font-bold"><AppIcon name="map" className="text-[#008f45]" />{section.title} 안내</h3>
                <div className="mt-4 space-y-3">
                  {section.routes.map((route, routeIndex) => <div key={routeIndex} className="rounded-2xl border border-[#dce6df] bg-[#f7faf8] p-5">
                    {route.title && <h4 className="font-bold leading-6 text-[#007c3c]">{route.title}</h4>}
                    {route.description && <p className={`${route.title ? "mt-2 " : ""}whitespace-pre-line break-words text-sm leading-7 text-[#526058]`}>{route.description}</p>}
                  </div>)}
                </div>
              </section>)}
              {description.trails.length > 0 && <p className="mt-4 text-xs leading-6 text-[#68756d]">{activity.source === "tourapi" ? "한국관광공사 API에서 제공한 등산로 안내입니다. " : "제공된 원문 코스 안내입니다. "}거리·소요 시간은 원문 기준이며, 방문 전 개방 여부와 현장 안내를 확인해 주세요.</p>}
              <div className="mt-8 rounded-2xl border border-[#dce6df] bg-[#f7faf8] p-5">
                <h3 className="font-bold">주소</h3>
                <p className="mt-2 flex items-start gap-2 text-sm leading-6 text-[#59675f]"><AppIcon name="mapPin" className="mt-0.5 shrink-0 text-[#008f45]" />{location}</p>
              </div>
            </section>

            <aside className="h-fit rounded-2xl bg-[#eef6f1] p-6">
              <h2 className="text-lg font-bold">이용 정보</h2>
              <dl className="mt-5 space-y-5">
                {details.map((item) => <div key={item.label} className="flex gap-3"><AppIcon name={item.icon} className="mt-0.5 size-5 shrink-0 text-[#008f45]" /><div><dt className="text-xs font-semibold text-[#718078]">{item.label}</dt><dd className="mt-1 break-words text-sm leading-6 text-[#172033]">{item.value}</dd></div></div>)}
                {officialWebsiteUrl && <div className="flex gap-3">
                  <AppIcon name="map" className="mt-0.5 size-5 shrink-0 text-[#008f45]" />
                  <div>
                    <dt className="text-xs font-semibold text-[#718078]">관련 사이트</dt>
                    <dd className="mt-1 text-sm leading-6">
                      <a href={officialWebsiteUrl} target="_blank" rel="noopener noreferrer" className="font-semibold text-[#007c3c] underline decoration-[#9bc7ad] underline-offset-4 transition hover:text-[#005f2e]">
                        공식 홈페이지
                      </a>
                    </dd>
                  </div>
                </div>}
              </dl>
              {referenceSourceUrl && <a href={referenceSourceUrl} target="_blank" rel="noopener noreferrer" className="mt-3 flex items-center justify-center gap-1 text-xs font-semibold text-[#65736b] underline underline-offset-4 transition hover:text-[#008f45]">{referenceSourceLabel(referenceSourceUrl)}<AppIcon name="arrowRight" className="size-3.5" /></a>}
              {activity.source && <p className="mt-4 text-center text-[11px] text-[#7a867f]">정보 출처: {activity.source}</p>}
            </aside>
          </div>
        </article>
        <SportsLocationMap activity={activity} />
      </div>
    </main>
  );
}
