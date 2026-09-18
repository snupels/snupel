"use client";

import Image from "next/image";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { FormEvent, useEffect, useMemo, useRef, useState } from "react";
import { AppIcon } from "./AppIcon";
import { api } from "@/lib/api/service";
import { missionPresentation } from "@/lib/missionCatalog";
import { missionPhotosError, MAX_MISSION_PHOTOS } from "@/lib/missionPhoto";
import { sportsImage } from "@/lib/sportsImage";
import { ApiError } from "@/lib/api/repository";
import type { CourseItineraryResponse, CourseResponse } from "@/lib/api/dto";

function errorMessage(reason: unknown) {
  if (reason instanceof ApiError) {
    if (reason.status === 401) return "로그인 정보가 만료되었습니다. 다시 로그인해 주세요.";
    if (reason.status === 409) return "이미 획득했거나 검토 중인 미션입니다.";
  }
  return "인증 신청을 처리하지 못했습니다. 잠시 후 다시 시도해 주세요.";
}

export function MissionDetailPage() {
  const courseId = Number(useSearchParams().get("id"));
  return <MissionDetailContent key={courseId} courseId={courseId} />;
}

function MissionDetailContent({ courseId }: { courseId: number }) {
  const validCourseId = Number.isInteger(courseId) && courseId > 0;
  const [course, setCourse] = useState<CourseResponse | null>(null);
  const [itinerary, setItinerary] = useState<CourseItineraryResponse | null>(null);
  const [loading, setLoading] = useState(validCourseId);
  const [message, setMessage] = useState(validCourseId ? "" : "미션 정보를 찾을 수 없습니다.");
  const [photos, setPhotos] = useState<File[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [completed, setCompleted] = useState(false);
  const [shareToFeed, setShareToFeed] = useState(false);
  const [feedCaption, setFeedCaption] = useState("");
  const submissionLock = useRef(false);
  const authVersion = useRef(0);

  useEffect(() => {
    const invalidate = () => { authVersion.current++; };
    const clear = () => {
      invalidate();
      submissionLock.current = false;
      setPhotos([]); setFeedCaption(""); setShareToFeed(false);
      setSubmitting(false); setCompleted(false); setMessage("");
    };
    window.addEventListener("sportspassport-auth-change", clear);
    return () => { invalidate(); window.removeEventListener("sportspassport-auth-change", clear); };
  }, []);

  useEffect(() => {
    if (!validCourseId) return;
    let cancelled = false;
    Promise.all([api.courses.get(courseId), api.courseItinerary(courseId)])
      .then(([courseData, itineraryData]) => {
        if (cancelled) return;
        if (!courseData.isPublished || courseData.category !== "event" || !itineraryData.stops.length) {
          setMessage("현재 참여할 수 없는 미션입니다. 미션 목록에서 다른 도전을 선택해 주세요.");
          return;
        }
        setCourse(courseData);
        setItinerary(itineraryData);
      })
      .catch(() => { if (!cancelled) setMessage("미션 정보를 불러오지 못했습니다."); })
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, [courseId, validCourseId]);

  const previewUrls = useMemo(() => photos.map(photo => URL.createObjectURL(photo)), [photos]);
  useEffect(() => () => {
    previewUrls.forEach(url => URL.revokeObjectURL(url));
  }, [previewUrls]);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (submissionLock.current || completed) return;
    if (!api.hasToken()) {
      setMessage("로그인 후 인증을 신청할 수 있습니다.");
      return;
    }
    const stop = itinerary?.stops[0];
    if (!stop) return;
    const validationError = missionPhotosError(photos);
    if (validationError) {
      setMessage(validationError);
      return;
    }

    submissionLock.current = true;
    const version = authVersion.current;
    setSubmitting(true);
    setMessage("");
    try {
      const keys: string[] = [];
      for (const photo of photos) {
        if (version !== authVersion.current) return;
        const upload = await api.stampSubmissions.createUploadUrl({
        stamp_id: stop.stampId,
        content_type: photo.type,
      });
      if (version !== authVersion.current) return;
      const form = new FormData();
      Object.entries(upload.fields).forEach(([key, value]) => form.append(key, value));
      form.append("file", photo);
      const uploaded = await fetch(upload.uploadUrl, { method: "POST", body: form });
      if (!uploaded.ok) throw new Error("upload_failed");
      keys.push(upload.objectKey);
      }
      if (version !== authVersion.current) return;
      await api.stampSubmissions.create({
        stamp_id: stop.stampId,
        object_key: keys[0],
        extra_object_keys: keys.slice(1),
        share_to_feed: shareToFeed,
        feed_caption: shareToFeed ? feedCaption.trim() || null : null,
      });
      if (version !== authVersion.current) return;
      setCompleted(true);
      setMessage(`인증 신청이 접수되었습니다. 승인 후 스탬프와 조건을 달성한 배지가 지급됩니다.${shareToFeed ? " 사진과 작성한 글도 스포츠 피드에 함께 공개됩니다." : ""}`);
    } catch (reason) {
      if (version !== authVersion.current) return;
      setMessage(errorMessage(reason));
    } finally {
      if (version === authVersion.current) { submissionLock.current = false; setSubmitting(false); }
    }
  }

  if (loading) return <main className="grid min-h-[65vh] place-items-center bg-[#f3f7f4] text-sm font-semibold text-[#617168]">미션을 불러오는 중...</main>;
  if (!course || !itinerary) return <main className="grid min-h-[65vh] place-items-center bg-[#f3f7f4] px-4"><div className="text-center"><p className="font-semibold">{message}</p><Link href="/missions" className="mt-5 inline-flex text-sm font-bold text-[#008f45]">미션 목록으로</Link></div></main>;

  const mission = missionPresentation(course, itinerary.stops[0]);
  const heroImage = course.representativeImageUrl ?? sportsImage({ placeName: course.title ?? null, sportName: course.sportName, representativeImageUrl: null, metadata: null }, [mission.category.replace(/\s/g, "")]);

  return (
    <main className="bg-[#f3f7f4] pb-16 text-[#172033]">
      <section className="relative min-h-[390px] overflow-hidden bg-[#173a2d]">
        <Image src={heroImage} alt={`${course.title ?? "패스포트 미션"} 대표 이미지`} fill priority className="object-cover" sizes="100vw" />
        <div className="absolute inset-0 bg-gradient-to-r from-[#09271d]/95 via-[#09271d]/75 to-[#09271d]/25" />
        <div className="relative mx-auto flex min-h-[390px] max-w-[1180px] flex-col justify-end px-5 pb-12 pt-24 text-white sm:px-8">
          <Link href="/missions" className="mb-auto inline-flex w-fit items-center gap-2 text-sm font-semibold text-white/80 hover:text-white"><AppIcon name="chevronLeft" />미션 목록</Link>
          <span className="w-fit rounded-full bg-[#00a94f] px-4 py-2 text-xs font-bold">사진 인증</span>
          <h1 className="mt-4 max-w-3xl text-3xl font-black tracking-[-0.04em] sm:text-5xl">{course.title}</h1>
          <p className="mt-4 max-w-2xl leading-7 text-white/80">{mission.intro}</p>
        </div>
      </section>

      <div className="mx-auto mt-8 grid max-w-[1180px] gap-7 px-4 sm:px-6 lg:grid-cols-[1fr_420px]">
        <section className="space-y-6">
          <div className="rounded-[24px] border border-[#dfe8e2] bg-white p-6 shadow-sm sm:p-8">
            <h2 className="text-2xl font-bold">미션 안내</h2>
            <p className="mt-4 leading-7 text-[#66736b]">{course.description ?? mission.intro}</p>
            <div className="mt-7 grid gap-4 sm:grid-cols-2">
              {[
                ["activity", "카테고리", mission.category],
                ["mapPin", "지역", mission.region],
                ["mapPin", "인증 장소", itinerary.stops[0]?.address ?? mission.region],
                ["camera", "인증 조건", mission.proof],
                ["medal", "지급 스탬프", mission.reward],
              ].map(([icon, label, value]) => <div key={label} className="rounded-2xl bg-[#f3f7f4] p-5"><span className="flex items-center gap-2 text-xs font-bold text-[#008f45]"><AppIcon name={icon as Parameters<typeof AppIcon>[0]["name"]} />{label}</span><p className="mt-2 text-sm font-semibold leading-6">{value}</p></div>)}
            </div>
            {mission.sportsActivityId && <Link href={`/sports/detail/?id=${mission.sportsActivityId}`} className="mt-6 inline-flex h-11 items-center gap-2 rounded-xl border border-[#9dcdb0] bg-[#f1f8f4] px-5 text-sm font-bold text-[#00783a] transition hover:border-[#008f45] hover:bg-[#e5f3ea]">
              <AppIcon name="map" className="size-4" />{mission.sportsLinkLabel ?? "스포츠 탐색에서 보기"}<AppIcon name="arrowRight" className="size-4" />
            </Link>}
          </div>

          <div className="rounded-[24px] border border-[#dfe8e2] bg-white p-6 shadow-sm sm:p-8">
            <h2 className="text-xl font-bold">인증 순서</h2>
            <ol className="mt-5 grid gap-4 sm:grid-cols-3">
              {mission.steps.map((item, index) => <li key={item} className="rounded-2xl border border-[#e3ebe5] p-5"><span className="flex size-8 items-center justify-center rounded-full bg-[#008f45] text-sm font-black text-white">{index + 1}</span><p className="mt-3 text-sm font-semibold">{item}</p></li>)}
            </ol>
            <p className="mt-5 text-xs leading-5 text-[#7b877f]">사진으로 인증을 심사하며 운영자 확인 후 스탬프가 지급됩니다. 피드 공개에 동의한 경우에만 승인된 사진이 스포츠 피드에 표시됩니다.</p>
          </div>
        </section>

        <form onSubmit={submit} className="h-fit rounded-[24px] border border-[#dbe6de] bg-white p-6 shadow-[0_16px_50px_rgba(36,73,50,0.10)] lg:sticky lg:top-24">
            <h2 className="text-xl font-bold">참여 인증하기</h2>
            <div className="mt-4 rounded-2xl border border-[#a8d8bb] bg-[#edf8f1] p-4 text-sm leading-6 text-[#245b3a]">
              <p className="font-bold">사진은 1~5장, 도전의 순간을 함께 남겨요</p>
              <p className="mt-2">사진을 여러 장 한 번에 선택하거나, 선택 후 추가할 수 있어요.</p>
              <p className="mt-2"><strong>스포츠 피드 공개는 선택이에요.</strong> 아래에서 공개를 선택하면 운영자 승인 후 사진과 작성한 글이 다른 이용자에게 공개됩니다. 공개하지 않아도 미션 인증을 신청할 수 있어요.</p>
            </div>
          {!api.hasToken() ? <div className="mt-5 rounded-2xl bg-[#f3f7f4] p-5 text-center"><p className="text-sm leading-6 text-[#66736b]">로그인하면 참여 사진으로 인증을 신청할 수 있어요.</p><Link href={`/login?next=${encodeURIComponent(`/missions/detail/?id=${courseId}`)}`} className="mt-4 flex h-11 items-center justify-center rounded-xl bg-[#008f45] text-sm font-bold text-white">로그인하고 이 미션 참여하기</Link></div> : <>
              <label className="mt-5 flex items-center justify-between text-sm font-bold" htmlFor="mission-photo"><span>1. 인증 사진 올리기</span><span className="text-[#008f45]">{photos.length} / {MAX_MISSION_PHOTOS}장</span></label>
            <label htmlFor="mission-photo" className="mt-2 flex min-h-36 cursor-pointer flex-col items-center justify-center overflow-hidden rounded-2xl border-2 border-dashed border-[#cbdacf] bg-[#f8faf8] text-center">
                <span className="px-5 text-sm text-[#52645a]"><AppIcon name="camera" className="mx-auto mb-2 size-7 text-[#008f45]" /><strong className="block text-base text-[#008f45]">{photos.length >= MAX_MISSION_PHOTOS ? "사진 5장 선택 완료" : photos.length ? "사진 추가하기" : "사진 선택하기 · 최대 5장"}</strong><span className="mt-2 block">{mission.photoPrompt}</span><small className="mt-2 block">JPG, PNG, WEBP · 장당 최대 10MB</small></span>
            </label>
            <input id="mission-photo" type="file" multiple accept="image/jpeg,image/png,image/webp" className="sr-only" disabled={completed || submitting || photos.length >= MAX_MISSION_PHOTOS} onChange={(event) => {
              const selected = Array.from(event.target.files ?? []);
              event.target.value = "";
              if (!selected.length) return;
              const next = [...photos, ...selected];
              const validationError = missionPhotosError(next);
              setMessage(validationError ?? "");
              if (!validationError) setPhotos(next);
            }} />
            {photos.length > 0 && <><p className="mt-3 text-xs text-[#66736b]">{photos.length}/5장 · 첫 사진이 피드 대표 사진이 됩니다.</p><div className="mt-2 grid grid-cols-3 gap-2">{previewUrls.map((url, index) => <div key={url} className="relative aspect-square overflow-hidden rounded-xl bg-[#edf2ef]"><Image src={url} alt={`인증 사진 ${index + 1}`} fill sizes="120px" className="object-cover" unoptimized /><button type="button" disabled={completed || submitting} aria-label={`사진 ${index + 1} 삭제`} onClick={() => setPhotos(current => current.filter((_, number) => number !== index))} className="absolute right-1 top-1 flex size-7 cursor-pointer items-center justify-center rounded-full bg-black/65 text-white disabled:hidden">×</button></div>)}</div></>}
              <h3 className="mt-6 text-sm font-bold">2. 스포츠 피드 공개 여부 선택</h3>
              <label className={`mt-2 flex cursor-pointer items-start gap-3 rounded-xl border-2 p-4 text-sm ${shareToFeed ? "border-[#008f45] bg-[#edf8f1]" : "border-[#dbe6de] bg-[#f8faf8]"}`}>
              <input type="checkbox" checked={shareToFeed} disabled={completed || submitting} onChange={(event) => setShareToFeed(event.target.checked)} className="mt-0.5 size-4 accent-[#008f45]" />
                <span><strong className="block">승인 후 스포츠 피드에 공개</strong><span className="mt-1 block text-sm leading-6 text-[#52645a]">체크하면 선택한 사진 최대 5장과 글을 함께 공유해요. 다른 이용자가 좋아요와 댓글을 남길 수 있어요.</span><span className="mt-2 block text-xs leading-5 text-[#52645a]">선택하지 않으면 피드에 게시되지 않습니다. 인증 사진은 운영자가 심사하며, 인증 기록은 나에게만 보입니다.</span></span>
            </label>
            {shareToFeed && <label className="mt-4 block text-sm font-bold">피드에 함께 올릴 글<textarea value={feedCaption} onChange={(event) => setFeedCaption(event.target.value)} maxLength={300} disabled={completed || submitting} aria-label="피드에 함께 올릴 글" placeholder="오늘의 도전은 어땠나요? 사진과 함께 이야기를 나눠보세요. (선택)" className="mt-2 min-h-28 w-full resize-y rounded-xl border border-[#cbdacf] p-3 text-sm font-normal outline-none focus:border-[#008f45]" /><span className="block text-right text-xs font-normal text-[#718078]">{feedCaption.length}/300</span></label>}
            <button type="submit" disabled={!photos.length || submitting || completed} className="mt-6 flex h-13 w-full cursor-pointer items-center justify-center rounded-xl bg-[#008f45] text-sm font-black text-white transition hover:bg-[#00783a] disabled:cursor-not-allowed disabled:bg-[#aab7af]">{completed ? "인증 접수 완료" : submitting ? "사진 업로드 및 인증 제출 중..." : "사진으로 인증 신청"}</button>
          </>}
          {message && <p role="status" className={`mt-4 rounded-xl px-4 py-3 text-sm leading-6 ${completed ? "bg-[#e9f7ee] text-[#08743a]" : "bg-[#fff2f0] text-[#a03d32]"}`}>{message}</p>}
          {completed && <Link href="/activity-history" className="mt-4 flex h-11 items-center justify-center rounded-xl border border-[#9dcdb0] text-sm font-bold text-[#00783a]">내 인증 신청 확인하기<AppIcon name="arrowRight" /></Link>}
          {mission.officialUrl && <a href={mission.officialUrl} target="_blank" rel="noopener noreferrer" className="mt-5 flex items-center justify-center gap-1 text-xs font-bold text-[#617168] hover:text-[#008f45]">{mission.officialLabel ?? "공식 안내"} <AppIcon name="arrowRight" /></a>}
        </form>
      </div>
    </main>
  );
}
