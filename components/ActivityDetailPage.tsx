"use client";

import Image, { type StaticImageData } from "next/image";
import Link from "next/link";
import { Suspense, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import type { ActivityResponse } from "@/lib/api/dto";
import { api } from "@/lib/api/service";
import { AppIcon } from "./AppIcon";
import fallbackImage from "@/imports/LandingPage/205ec17d713405bedcfab3cf69b55f31151a8bf3.png";

const categoryLabels: Record<string, string> = {
  sports: "스포츠",
  event: "이벤트",
  festival: "축제",
  tourism: "관광",
};

function activityImage(activity: ActivityResponse | null): StaticImageData | string {
  const imageUrl = activity?.representativeImageUrl;
  return imageUrl?.startsWith("https://tong.visitkorea.or.kr/") ? imageUrl : fallbackImage;
}

function coordinate(activity: ActivityResponse) {
  if (activity.latitude === null || activity.longitude === null) return null;
  return `${activity.latitude.toFixed(5)}, ${activity.longitude.toFixed(5)}`;
}

function DetailLoading() {
  return <div className="mx-auto min-h-[60vh] max-w-[1080px] px-5 py-16 text-sm text-[#68756d]">활동 정보를 불러오는 중입니다.</div>;
}

export function ActivityDetailPage() {
  return <Suspense fallback={<DetailLoading />}><ActivityDetailContent /></Suspense>;
}

function ActivityDetailContent() {
  const searchParams = useSearchParams();
  const activityId = Number(searchParams.get("id"));
  const hasActivityId = Number.isInteger(activityId) && activityId > 0;
  const feedTitle = searchParams.get("title") || "강원 스포츠 인증 활동";
  const feedPlace = searchParams.get("place") || "강원특별자치도";
  const feedDate = searchParams.get("date") || "날짜 정보 없음";
  const feedStatus = searchParams.get("status") || "활동 기록";
  const [activity, setActivity] = useState<ActivityResponse | null>(null);
  const [apiError, setApiError] = useState(false);

  useEffect(() => {
    if (!hasActivityId) return;
    let cancelled = false;
    api.activities.get(activityId)
      .then((item) => {
        if (!cancelled) setActivity(item);
      })
      .catch(() => {
        if (!cancelled) setApiError(true);
      });
    return () => {
      cancelled = true;
    };
  }, [activityId, hasActivityId]);

  if (hasActivityId && !activity && !apiError) return <DetailLoading />;

  const title = activity?.placeName ?? feedTitle;
  const location = activity?.address ?? activity?.sigun ?? activity?.region ?? feedPlace;
  const coordinates = activity ? coordinate(activity) : null;

  return (
    <main className="min-h-screen bg-[#f3f7f4] px-5 pb-20 pt-10 text-[#172033] sm:px-8 sm:pt-14">
      <div className="mx-auto max-w-[1080px]">
        <Link href="/activity-feed" className="inline-flex items-center gap-2 text-sm font-semibold text-[#637069] transition hover:text-[#008f45]"><AppIcon name="chevronLeft" className="size-5" />인증 활동으로 돌아가기</Link>

        <article className="mt-7 overflow-hidden rounded-[28px] border border-[#dce6df] bg-white shadow-[0_18px_55px_rgba(23,58,45,0.12)]">
          <div className="relative aspect-[16/7] min-h-[280px] overflow-hidden bg-[#173a2d]">
            <Image src={activityImage(activity)} alt={`${title} 장소 이미지`} fill preload sizes="(max-width: 1080px) 100vw, 1080px" className="object-cover" />
            <div className="absolute inset-0 bg-gradient-to-t from-[#102c22]/90 via-[#102c22]/20 to-transparent" />
            <div className="absolute inset-x-0 bottom-0 p-7 text-white sm:p-10">
              <span className="inline-flex rounded-full bg-[#00a94f] px-3 py-1 text-xs font-bold">{feedStatus}</span>
              <h1 className="mt-4 text-3xl font-bold tracking-[-0.04em] sm:text-4xl">{title}</h1>
              <p className="mt-3 flex items-center gap-2 text-sm text-white/75"><AppIcon name="mapPin" />{location}</p>
            </div>
          </div>

          <div className="grid gap-8 p-7 sm:p-10 lg:grid-cols-[minmax(0,1fr)_330px]">
            <section>
              <p className="text-sm font-bold text-[#008f45]">활동 및 장소 정보</p>
              <h2 className="mt-3 text-2xl font-bold">{feedTitle}</h2>
              <p className="mt-4 leading-8 text-[#526058]">
                {activity?.summary ?? (activity ? `API에 등록된 ${title} 장소 정보입니다.` : "이 인증 기록과 연결된 장소 API 상세 정보는 아직 없습니다.")}
              </p>
              {!activity && (
                <div className="mt-7 rounded-2xl border border-[#dce6df] bg-[#f5f8f6] p-5 text-sm leading-6 text-[#69756e]">
                  인증 기록은 확인할 수 있지만 동일한 장소명이 API에 등록되면 주소, 종목, 대표 이미지와 공식 정보가 이 화면에 자동으로 표시됩니다.
                </div>
              )}
            </section>

            <aside className="h-fit rounded-2xl bg-[#f1f7f3] p-6">
              <h2 className="font-bold">상세 정보</h2>
              <dl className="mt-5 space-y-5 text-sm">
                <div className="flex gap-3"><AppIcon name="calendar" className="mt-0.5 size-5 shrink-0 text-[#008f45]" /><div><dt className="font-semibold text-[#526058]">활동일</dt><dd className="mt-1 text-[#172033]">{feedDate}</dd></div></div>
                <div className="flex gap-3"><AppIcon name="mapPin" className="mt-0.5 size-5 shrink-0 text-[#008f45]" /><div><dt className="font-semibold text-[#526058]">장소</dt><dd className="mt-1 leading-6 text-[#172033]">{location}</dd></div></div>
                {activity?.sportName && <div className="flex gap-3"><AppIcon name="medal" className="mt-0.5 size-5 shrink-0 text-[#008f45]" /><div><dt className="font-semibold text-[#526058]">종목</dt><dd className="mt-1 text-[#172033]">{activity.sportName}</dd></div></div>}
                {activity && <div className="flex gap-3"><AppIcon name="clipboard" className="mt-0.5 size-5 shrink-0 text-[#008f45]" /><div><dt className="font-semibold text-[#526058]">분류</dt><dd className="mt-1 text-[#172033]">{categoryLabels[activity.category] ?? activity.category}</dd></div></div>}
                {coordinates && <div className="flex gap-3"><AppIcon name="map" className="mt-0.5 size-5 shrink-0 text-[#008f45]" /><div><dt className="font-semibold text-[#526058]">좌표</dt><dd className="mt-1 text-[#172033]">{coordinates}</dd></div></div>}
              </dl>
              {activity?.sourceUrl && <a href={activity.sourceUrl} target="_blank" rel="noopener noreferrer" className="mt-6 inline-flex h-11 w-full items-center justify-center gap-2 rounded-xl bg-[#008f45] text-sm font-bold text-white transition hover:bg-[#00783a]">공식 정보 보기<AppIcon name="arrowRight" /></a>}
            </aside>
          </div>
        </article>
      </div>
    </main>
  );
}
