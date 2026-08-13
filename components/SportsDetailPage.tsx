"use client";

import Image, { type StaticImageData } from "next/image";
import Link from "next/link";
import { Suspense, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import type { ActivityResponse } from "@/lib/api/dto";
import { api } from "@/lib/api/service";
import { AppIcon, type AppIconName } from "./AppIcon";
import fallbackImage from "@/imports/LandingPage/205ec17d713405bedcfab3cf69b55f31151a8bf3.png";

type DetailItem = {
  label: string;
  value: string;
  icon: AppIconName;
};

function detailImage(activity: ActivityResponse): StaticImageData | string {
  return activity.representativeImageUrl?.startsWith("https://tong.visitkorea.or.kr/")
    ? activity.representativeImageUrl
    : fallbackImage;
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
  return <Suspense fallback={<DetailLoading />}><SportsDetailContent /></Suspense>;
}

function SportsDetailContent() {
  const searchParams = useSearchParams();
  const activityId = Number(searchParams.get("id"));
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

  if (!activity) {
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
  const location = activity.address ?? activity.sigun ?? activity.region ?? "강원특별자치도";
  const phone = metadataText(activity.metadata, ["phone", "tel", "전화", "연락처"]);
  const hours = metadataText(activity.metadata, ["opentime", "usetime", "운영시간", "이용시간"]);
  const fee = metadataText(activity.metadata, ["fee", "price", "요금", "입장료", "이용료"]);
  const parking = metadataText(activity.metadata, ["parking", "주차"]);
  const details: DetailItem[] = [
    { label: "지역", value: [activity.region, activity.sigun].filter(Boolean).join(" · ") || "강원특별자치도", icon: "mapPin" },
    ...(activity.sportName ? [{ label: "스포츠 종목", value: activity.sportName, icon: "medal" as AppIconName }] : []),
    ...(phone ? [{ label: "문의", value: phone, icon: "phone" as AppIconName }] : []),
    ...(hours ? [{ label: "운영시간", value: hours, icon: "timer" as AppIconName }] : []),
    ...(fee ? [{ label: "이용요금", value: fee, icon: "gift" as AppIconName }] : []),
    ...(parking ? [{ label: "주차", value: parking, icon: "map" as AppIconName }] : []),
  ];
  const mapHref = `https://map.kakao.com/link/search/${encodeURIComponent(location || title)}`;

  return (
    <main className="min-h-screen bg-[#f3f7f4] px-5 pb-20 pt-10 text-[#172033] sm:px-8 sm:pt-14">
      <div className="mx-auto max-w-[1080px]">
        <Link href="/sports" className="inline-flex items-center gap-2 text-sm font-semibold text-[#637069] transition hover:text-[#008f45]"><AppIcon name="chevronLeft" className="size-5" />스포츠 탐색으로 돌아가기</Link>

        <article className="mt-7 overflow-hidden rounded-[28px] border border-[#dce6df] bg-white shadow-[0_18px_55px_rgba(23,58,45,0.12)]">
          <div className="relative aspect-[16/7] min-h-[280px] overflow-hidden bg-[#173a2d]">
            <Image src={detailImage(activity)} alt={`${title} 대표 이미지`} fill preload sizes="(max-width: 1080px) 100vw, 1080px" className="object-cover" />
            <div className="absolute inset-0 bg-gradient-to-t from-[#102c22]/95 via-[#102c22]/25 to-transparent" />
            <div className="absolute inset-x-0 bottom-0 p-7 text-white sm:p-10">
              <span className="inline-flex rounded-full bg-[#00a94f] px-3 py-1 text-xs font-bold">{activity.sportName ?? "강원 스포츠"}</span>
              <h1 className="mt-4 text-3xl font-bold tracking-[-0.04em] sm:text-4xl">{title}</h1>
              <p className="mt-3 flex items-center gap-2 text-sm text-white/80"><AppIcon name="mapPin" />{location}</p>
            </div>
          </div>

          <div className="grid gap-10 p-7 sm:p-10 lg:grid-cols-[minmax(0,1fr)_340px]">
            <section>
              <p className="text-sm font-bold text-[#008f45]">스포츠 장소 소개</p>
              <h2 className="mt-3 text-2xl font-bold">{title}에서 즐기는 스포츠</h2>
              <p className="mt-5 whitespace-pre-line leading-8 text-[#526058]">
                {activity.summary ?? `${title}의 스포츠 활동 정보입니다. 자세한 운영 정보는 공식 정보 페이지에서 확인해 주세요.`}
              </p>
              <div className="mt-8 rounded-2xl border border-[#dce6df] bg-[#f7faf8] p-5">
                <h3 className="font-bold">주소</h3>
                <p className="mt-2 flex items-start gap-2 text-sm leading-6 text-[#59675f]"><AppIcon name="mapPin" className="mt-0.5 shrink-0 text-[#008f45]" />{location}</p>
                {activity.latitude !== null && activity.longitude !== null && <p className="mt-2 text-xs text-[#7a867f]">좌표 {activity.latitude.toFixed(5)}, {activity.longitude.toFixed(5)}</p>}
              </div>
            </section>

            <aside className="h-fit rounded-2xl bg-[#eef6f1] p-6">
              <h2 className="text-lg font-bold">이용 정보</h2>
              <dl className="mt-5 space-y-5">
                {details.map((item) => <div key={item.label} className="flex gap-3"><AppIcon name={item.icon} className="mt-0.5 size-5 shrink-0 text-[#008f45]" /><div><dt className="text-xs font-semibold text-[#718078]">{item.label}</dt><dd className="mt-1 break-words text-sm leading-6 text-[#172033]">{item.value}</dd></div></div>)}
              </dl>
              <div className="mt-6 grid gap-2">
                <a href={mapHref} target="_blank" rel="noopener noreferrer" className="inline-flex h-11 items-center justify-center gap-2 rounded-xl border border-[#9bc6aa] bg-white text-sm font-bold text-[#008f45] transition hover:bg-[#f7fbf8]">지도에서 보기<AppIcon name="map" /></a>
                {activity.sourceUrl && <a href={activity.sourceUrl} target="_blank" rel="noopener noreferrer" className="inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-[#008f45] text-sm font-bold text-white transition hover:bg-[#00783a]">공식 정보 보기<AppIcon name="arrowRight" /></a>}
              </div>
              {activity.source && <p className="mt-4 text-center text-[11px] text-[#7a867f]">정보 출처: {activity.source}</p>}
            </aside>
          </div>
        </article>
      </div>
    </main>
  );
}
