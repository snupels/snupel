"use client";

import Image, { type StaticImageData } from "next/image";
import Link from "next/link";
import { Suspense, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { api } from "@/lib/api/service";
import type { ActivityResponse } from "@/lib/api/dto";
import { AppIcon } from "./AppIcon";
import eventImage1 from "@/imports/LandingPage/205ec17d713405bedcfab3cf69b55f31151a8bf3.png";
import eventImage2 from "@/imports/LandingPage/9193ff8f95dcbcb73f018d079496fad4bcfa1dec.png";
import eventImage3 from "@/imports/LandingPage/a92d1f052a5f15d9f49f62dad2a919d5f418da27.png";
import eventImage4 from "@/imports/LandingPage/9509675bc89588078354909012b6022f47332ef9.png";

const fallbackImages: StaticImageData[] = [eventImage1, eventImage2, eventImage3, eventImage4];

function formatDate(value: string | null | undefined) {
  return value ? value.slice(0, 10).replaceAll("-", ".") : "일정 확인 중";
}

function detailImage(event: ActivityResponse) {
  return event.representativeImageUrl || fallbackImages[(event.id - 1) % fallbackImages.length];
}

export function EventDetailPage() {
  return <Suspense fallback={<DetailLoading />}><EventDetailContent /></Suspense>;
}

function DetailLoading() {
  return <div className="mx-auto min-h-[60vh] max-w-[1100px] px-4 py-16 text-sm text-[#68756d] sm:px-6">행사 정보를 불러오는 중입니다.</div>;
}

function EventDetailContent() {
  const searchParams = useSearchParams();
  const eventId = Number(searchParams.get("id"));
  const invalidEventId = !Number.isInteger(eventId) || eventId <= 0;
  const [event, setEvent] = useState<ActivityResponse | null>(null);
  const [error, setError] = useState("");
  const [posterOpen, setPosterOpen] = useState(false);

  useEffect(() => {
    if (invalidEventId) return;

    let cancelled = false;
    api.activities.get(eventId)
      .then((item) => {
        if (!cancelled) setEvent(item);
      })
      .catch(() => {
        if (!cancelled) setError("행사 정보를 불러오지 못했습니다.");
      });
    return () => {
      cancelled = true;
    };
  }, [eventId, invalidEventId]);

  useEffect(() => {
    if (!posterOpen) return;

    const previousOverflow = document.body.style.overflow;
    const closeOnEscape = (keyboardEvent: KeyboardEvent) => {
      if (keyboardEvent.key === "Escape") setPosterOpen(false);
    };
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", closeOnEscape);
    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", closeOnEscape);
    };
  }, [posterOpen]);

  if (invalidEventId || error) {
    return <div className="mx-auto min-h-[60vh] max-w-[1100px] px-4 py-16 sm:px-6"><Link href="/events" className="inline-flex items-center gap-1 text-sm font-semibold text-[#008f45]"><AppIcon name="chevronLeft" />행사 목록으로</Link><p className="mt-10 rounded-2xl bg-white p-8 text-[#68756d] shadow-sm">{invalidEventId ? "올바른 행사 정보가 아닙니다." : error}</p></div>;
  }
  if (!event) return <DetailLoading />;

  const title = event.placeName ?? `강원 행사 #${event.id}`;
  const location = event.address ?? event.sigun ?? event.region ?? "강원특별자치도";
  const posterImage = detailImage(event);
  const closePoster = () => setPosterOpen(false);
  const closePosterOnPointerDown = (pointerEvent: React.PointerEvent<HTMLButtonElement>) => {
    pointerEvent.preventDefault();
    pointerEvent.stopPropagation();
    closePoster();
  };

  return (
    <>
    <main className="bg-[#f3f7f4] px-4 pb-20 pt-10 text-[#172033] sm:px-6">
      <div className="mx-auto max-w-[1100px]">
        <Link href="/events" className="inline-flex items-center gap-1 text-sm font-semibold text-[#5f6c64] transition hover:text-[#008f45]"><AppIcon name="chevronLeft" />행사 목록으로</Link>
        <article className="mt-6 overflow-hidden rounded-[28px] border border-[#dce6df] bg-white shadow-[0_18px_55px_rgba(23,58,45,0.12)]">
          <div className="relative aspect-[16/8] min-h-[320px] overflow-hidden bg-[#102019]">
            <Image src={posterImage} alt="" fill sizes="(max-width: 1100px) 100vw, 1100px" className="scale-110 object-cover opacity-30 blur-xl" />
            <Image src={posterImage} alt={`${title} 포스터`} fill preload sizes="(max-width: 1100px) 100vw, 1100px" className="object-contain" />
            <button type="button" onClick={() => setPosterOpen(true)} aria-label={`${title} 포스터 크게 보기`} className="absolute inset-0 z-10 cursor-zoom-in rounded-t-[28px] focus-visible:outline focus-visible:outline-4 focus-visible:outline-offset-[-6px] focus-visible:outline-white">
              <span className="absolute right-5 top-5 rounded-full border border-white/30 bg-[#102c22]/80 px-4 py-2 text-sm font-bold text-white shadow-lg backdrop-blur">포스터 크게 보기</span>
            </button>
            <div className="pointer-events-none absolute inset-0 z-20 bg-gradient-to-t from-[#102c22]/90 via-transparent to-transparent" />
            <div className="pointer-events-none absolute inset-x-0 bottom-0 z-20 p-7 text-white sm:p-10">
              <span className="inline-flex rounded-full bg-[#00a94f] px-3 py-1 text-xs font-bold">{event.sportName ? "스포츠 행사" : "이벤트"}</span>
              <h1 className="mt-4 text-3xl font-bold tracking-[-0.04em] sm:text-4xl">{title}</h1>
            </div>
          </div>
          <div className="grid gap-10 p-7 sm:p-10 lg:grid-cols-[minmax(0,1fr)_320px]">
            <section>
              <p className="text-sm font-bold text-[#008f45]">행사 소개</p>
              <p className="mt-4 text-lg leading-8 text-[#4f5d55]">{event.summary ?? "강원에서 열리는 스포츠 행사입니다."}</p>
              <div className="mt-10 border-t border-[#e4ebe6] pt-8">
                <h2 className="text-xl font-bold">행사 안내</h2>
                <p className="mt-3 text-sm leading-7 text-[#6b776f]">행사 일정과 장소를 확인한 뒤 방문해 주세요. 세부 운영 내용은 현장 상황에 따라 변경될 수 있습니다.</p>
              </div>
            </section>
            <aside className="h-fit rounded-2xl bg-[#f1f7f3] p-6">
              <h2 className="font-bold">행사 정보</h2>
              <dl className="mt-5 space-y-5 text-sm">
                <div className="flex gap-3"><AppIcon name="calendar" className="mt-0.5 size-5 shrink-0 text-[#008f45]" /><div><dt className="font-semibold text-[#526058]">일정</dt><dd className="mt-1 text-[#172033]">{formatDate(event.startsAt)} ~ {formatDate(event.endsAt)}</dd></div></div>
                <div className="flex gap-3"><AppIcon name="mapPin" className="mt-0.5 size-5 shrink-0 text-[#008f45]" /><div><dt className="font-semibold text-[#526058]">장소</dt><dd className="mt-1 leading-6 text-[#172033]">{location}</dd></div></div>
              </dl>
              {event.sourceUrl && <a href={event.sourceUrl} target="_blank" rel="noopener noreferrer" className="mt-6 inline-flex h-11 w-full items-center justify-center gap-2 rounded-xl bg-[#008f45] text-sm font-bold text-white transition hover:bg-[#00783a]">공식 안내 보기<AppIcon name="arrowRight" /></a>}
            </aside>
          </div>
        </article>
      </div>
    </main>
    {posterOpen && (
      <div role="dialog" aria-modal="true" aria-label={`${title} 고화질 포스터`} className="fixed inset-0 z-[100] flex items-center justify-center bg-black/90 p-3 sm:p-6">
        <button type="button" aria-label="포스터 닫기" onPointerDown={closePosterOnPointerDown} onClick={closePoster} className="absolute inset-0 cursor-zoom-out" />
        <div className="relative z-10 h-full w-full max-w-[1500px]">
          <Image src={posterImage} alt={`${title} 고화질 포스터`} fill sizes="100vw" className="object-contain" />
          <button type="button" onPointerDown={closePosterOnPointerDown} onClick={closePoster} className="absolute right-2 top-2 rounded-full border border-white/30 bg-black/75 px-4 py-2 text-sm font-bold text-white shadow-lg backdrop-blur sm:right-4 sm:top-4">닫기 ×</button>
          {typeof posterImage === "string" && (
            <a href={posterImage} target="_blank" rel="noopener noreferrer" className="absolute bottom-2 left-1/2 -translate-x-1/2 rounded-full border border-white/30 bg-black/75 px-5 py-2 text-sm font-bold text-white shadow-lg backdrop-blur sm:bottom-4">원본 이미지 열기</a>
          )}
        </div>
      </div>
    )}
    </>
  );
}
