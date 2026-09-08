"use client";

import Image from "next/image";
import Link from "next/link";
import { Suspense, useEffect, useRef, useState } from "react";
import { useSearchParams } from "next/navigation";
import { api } from "@/lib/api/service";
import type { ActivityResponse } from "@/lib/api/dto";
import { AppIcon } from "./AppIcon";
import { SaveActivityButton } from "./SaveActivityButton";
import { eventParticipation } from "@/lib/eventParticipation";

function formatDate(value: string | null | undefined) {
  return value ? value.slice(0, 10).replaceAll("-", ".") : "일정 확인 중";
}

function detailImage(event: ActivityResponse) {
  return event.representativeImageUrl || "/place-image-unavailable.svg";
}

function calendarFile(event: ActivityResponse, title: string, location: string) {
  if (!event.startsAt) return null;
  const date = (value: string) => value.slice(0, 10).replaceAll("-", "");
  const nextDay = (value: string) => {
    const day = new Date(`${value.slice(0, 10)}T00:00:00Z`);
    day.setUTCDate(day.getUTCDate() + 1);
    return day.toISOString().slice(0, 10).replaceAll("-", "");
  };
  const escape = (value: string) => value.replaceAll("\\", "\\\\").replaceAll("\n", "\\n").replaceAll(",", "\\,").replaceAll(";", "\\;");
  const description = [event.summary, event.sourceUrl].filter(Boolean).join("\n");
  const startsAt = date(event.startsAt);
  const endsAt = event.endsAt ? nextDay(event.endsAt) : nextDay(event.startsAt);
  const contents = [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//Snupel//Events//KO",
    "BEGIN:VEVENT",
    `UID:snupel-event-${event.id}@snupel`,
    `DTSTART;VALUE=DATE:${startsAt}`,
    `DTEND;VALUE=DATE:${endsAt}`,
    `SUMMARY:${escape(title)}`,
    `LOCATION:${escape(location)}`,
    ...(description ? [`DESCRIPTION:${escape(description)}`] : []),
    "END:VEVENT",
    "END:VCALENDAR",
    "",
  ].join("\r\n");
  return new Blob([contents], { type: "text/calendar;charset=utf-8" });
}

export function EventDetailPage() {
  return <Suspense fallback={<DetailLoading />}><EventDetailRoute /></Suspense>;
}

function DetailLoading() {
  return <div className="mx-auto min-h-[60vh] max-w-[1100px] px-4 py-16 text-sm text-[#68756d] sm:px-6">행사 정보를 불러오는 중입니다.</div>;
}

function EventDetailRoute() {
  const searchParams = useSearchParams();
  const eventId = Number(searchParams.get("id"));
  return <EventDetailContent key={eventId} eventId={eventId} />;
}

function EventDetailContent({ eventId }: { eventId: number }) {
  const invalidEventId = !Number.isInteger(eventId) || eventId <= 0;
  const [event, setEvent] = useState<ActivityResponse | null>(null);
  const [error, setError] = useState("");
  const [posterOpen, setPosterOpen] = useState(false);
  const posterDialogRef = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    if (invalidEventId) return;

    let cancelled = false;
    api.activities.get(eventId)
      .then((item) => {
        if (cancelled) return;
        if (item.category !== "event" && item.category !== "festival") {
          setError("행사 정보가 아닙니다. 행사 목록에서 확인해 주세요.");
          return;
        }
        setEvent(item);
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
    const previousFocus = document.activeElement;
    posterDialogRef.current?.showModal();
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = previousOverflow;
      if (previousFocus instanceof HTMLElement) previousFocus.focus();
    };
  }, [posterOpen]);

  if (invalidEventId || error) {
    return <div className="mx-auto min-h-[60vh] max-w-[1100px] px-4 py-16 sm:px-6"><Link href="/events" className="inline-flex items-center gap-1 text-sm font-semibold text-[#008f45]"><AppIcon name="chevronLeft" />행사 목록으로</Link><p className="mt-10 rounded-2xl bg-white p-8 text-[#68756d] shadow-sm">{invalidEventId ? "올바른 행사 정보가 아닙니다." : error}</p></div>;
  }
  if (!event) return <DetailLoading />;

  const title = event.placeName ?? `강원 행사 #${event.id}`;
  const location = event.address ?? event.sigun ?? event.region ?? "강원특별자치도";
  const posterImage = detailImage(event);
  const participation = eventParticipation(event);
  const organizer = typeof event.metadata?.officialSource === "string" ? event.metadata.officialSource : null;
  const imageCaption = typeof event.metadata?.imageCaption === "string" ? event.metadata.imageCaption : null;
  const imageLabel = event.metadata?.imageType === "photo" ? "행사 사진" : "포스터";
  const closePoster = () => setPosterOpen(false);
  const exportCalendar = () => {
    const file = calendarFile(event, title, location);
    if (!file) return;
    const link = document.createElement("a");
    link.href = URL.createObjectURL(file);
    link.download = `${title.replaceAll(/[\\/:*?"<>|]/g, "-")}.ics`;
    link.click();
    URL.revokeObjectURL(link.href);
  };

  return (
    <>
    <main className="bg-[#f3f7f4] px-4 pb-20 pt-10 text-[#172033] sm:px-6">
      <div className="mx-auto max-w-[1100px]">
        <Link href="/events" className="inline-flex items-center gap-1 text-sm font-semibold text-[#5f6c64] transition hover:text-[#008f45]"><AppIcon name="chevronLeft" />행사 목록으로</Link>
        <article className="mt-6 overflow-hidden rounded-[28px] border border-[#dce6df] bg-white shadow-[0_18px_55px_rgba(23,58,45,0.12)]">
          <div className="relative aspect-[16/8] min-h-[320px] overflow-hidden bg-[#102019]">
            <Image src={posterImage} alt="" fill sizes="(max-width: 1100px) 100vw, 1100px" className="scale-110 object-cover opacity-30 blur-xl" />
            <Image src={posterImage} alt={event.representativeImageUrl ? `${title} 행사 이미지` : "등록된 행사 사진이 없습니다"} fill preload sizes="(max-width: 1100px) 100vw, 1100px" className="object-contain" />
            {event.representativeImageUrl && <button type="button" onClick={() => setPosterOpen(true)} aria-label={`${title} ${imageLabel} 크게 보기`} className="absolute left-5 top-5 z-30 cursor-zoom-in rounded-full border border-white/30 bg-[#102c22]/80 px-4 py-2 text-sm font-bold text-white shadow-lg backdrop-blur transition hover:bg-[#102c22] focus-visible:outline focus-visible:outline-4 focus-visible:outline-white">
              {imageLabel} 크게 보기
            </button>}
            <div className="pointer-events-none absolute inset-0 z-20 bg-gradient-to-t from-[#102c22]/90 via-transparent to-transparent" />
            <div className="pointer-events-none absolute inset-x-0 bottom-0 z-20 p-7 text-white sm:p-10">
              <span className="inline-flex rounded-full bg-[#00a94f] px-3 py-1 text-xs font-bold">{event.sportName ? "스포츠 행사" : "이벤트"}</span>
              <h1 className="mt-4 text-3xl font-bold tracking-[-0.04em] sm:text-4xl">{title}</h1>
            </div>
          </div>
          {imageCaption && <p className="px-7 pt-4 text-xs leading-6 text-[#68756d] sm:px-10">{imageCaption}</p>}
          <div className="grid gap-10 p-7 sm:p-10 lg:grid-cols-[minmax(0,1fr)_320px]">
            <section>
              <p className="text-sm font-bold text-[#008f45]">행사 소개</p>
              <p className="mt-4 whitespace-pre-line text-lg leading-8 text-[#4f5d55]">{event.summary ?? "강원에서 열리는 스포츠 행사입니다."}</p>
              <div className="mt-10 border-t border-[#e4ebe6] pt-8">
                <h2 className="text-xl font-bold">행사 안내</h2>
                {participation && <section aria-label="참가 안내" className="mt-5 rounded-2xl border border-[#dce6df] bg-[#f7faf8] p-5">
                  <p className="inline-flex rounded-full bg-[#e1eee6] px-3 py-1 text-xs font-bold text-[#17673d]">{participation.label}</p>
                  <dl className="mt-5 space-y-4 text-sm leading-6">
                    {([
                      ["참여 종목", participation.guide.programs],
                      ["참가 대상", participation.guide.eligibility],
                      ["참가비", participation.guide.fee],
                      ["신청 방법", participation.guide.registrationGuide],
                    ] as const).map(([label, value]) => value && <div key={label}><dt className="font-bold text-[#374d40]">{label}</dt><dd className="mt-1 whitespace-pre-line text-[#526058]">{value}</dd></div>)}
                  </dl>
                  {participation.guide.note && <p className="mt-4 whitespace-pre-line text-xs leading-6 text-[#68756d]">{participation.guide.note}</p>}
                  <p className="mt-5 border-t border-[#dce6df] pt-4 text-xs leading-6 text-[#68756d]">공식 안내 확인일: {participation.guide.verifiedAt.replaceAll("-", ".")}<br />접수·잔여 인원은 실시간 연동이 아닙니다. 신청 전 공식 홈페이지의 최신 공지를 확인해 주세요.</p>
                </section>}
                <p className="mt-3 text-sm leading-7 text-[#6b776f]">행사 일정과 장소를 확인한 뒤 방문해 주세요. 세부 운영 내용은 현장 상황에 따라 변경될 수 있습니다.</p>
                {organizer && <p className="mt-3 text-xs leading-6 text-[#6b776f]">행사 안내 출처: {organizer}</p>}
              </div>
            </section>
            <aside className="h-fit rounded-2xl bg-[#f1f7f3] p-6">
              <h2 className="font-bold">행사 정보</h2>
              <dl className="mt-5 space-y-5 text-sm">
                <div className="flex gap-3"><AppIcon name="calendar" className="mt-0.5 size-5 shrink-0 text-[#008f45]" /><div><dt className="font-semibold text-[#526058]">일정</dt><dd className="mt-1 text-[#172033]">{formatDate(event.startsAt)} ~ {formatDate(event.endsAt)}</dd></div></div>
                <div className="flex gap-3"><AppIcon name="mapPin" className="mt-0.5 size-5 shrink-0 text-[#008f45]" /><div><dt className="font-semibold text-[#526058]">장소</dt><dd className="mt-1 leading-6 text-[#172033]">{location}</dd></div></div>
              </dl>
              <SaveActivityButton activityId={event.id} />
              {event.startsAt && <button type="button" onClick={exportCalendar} className="mt-6 inline-flex h-11 w-full items-center justify-center gap-2 rounded-xl border border-[#008f45] bg-white text-sm font-bold text-[#008f45] transition hover:bg-[#e8f5ed]">캘린더에 저장<AppIcon name="calendar" /></button>}
              {event.sourceUrl && <a href={event.sourceUrl} target="_blank" rel="noopener noreferrer" className="mt-6 inline-flex h-11 w-full items-center justify-center gap-2 rounded-xl bg-[#008f45] text-sm font-bold text-white transition hover:bg-[#00783a]">공식 안내 보기<AppIcon name="arrowRight" /></a>}
            </aside>
          </div>
        </article>
      </div>
    </main>
    {posterOpen && (
      <dialog ref={posterDialogRef} aria-label={`${title} ${imageLabel} 원본 보기`} onCancel={closePoster} onClick={(mouseEvent) => { if (mouseEvent.target === mouseEvent.currentTarget) closePoster(); }} className="fixed inset-0 z-[100] m-0 h-dvh w-screen max-h-none max-w-none cursor-zoom-out bg-black/90 p-3 backdrop:bg-black/60 sm:p-6">
        <div className="relative mx-auto h-full w-full max-w-[1500px] cursor-default" onClick={(mouseEvent) => mouseEvent.stopPropagation()}>
          <Image src={posterImage} alt={`${title} ${imageLabel}`} fill sizes="100vw" className="object-contain" />
          <button type="button" onClick={closePoster} className="absolute right-2 top-2 z-20 cursor-pointer rounded-full border border-white/30 bg-black/75 px-4 py-2 text-sm font-bold text-white shadow-lg backdrop-blur focus-visible:outline focus-visible:outline-2 focus-visible:outline-white sm:right-4 sm:top-4">닫기 ×</button>
          {typeof posterImage === "string" && (
            <a href={posterImage} target="_blank" rel="noopener noreferrer" className="absolute bottom-2 left-1/2 z-20 -translate-x-1/2 rounded-full border border-white/30 bg-black/75 px-5 py-2 text-sm font-bold text-white shadow-lg backdrop-blur sm:bottom-4">원본 이미지 열기</a>
          )}
        </div>
      </dialog>
    )}
    </>
  );
}
