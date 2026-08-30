"use client";

import Image from "next/image";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { FormEvent, useEffect, useMemo, useState } from "react";
import { AppIcon } from "./AppIcon";
import { api } from "@/lib/api/service";
import { ApiError } from "@/lib/api/repository";
import type { CourseItineraryResponse, CourseResponse } from "@/lib/api/dto";

type LocationProof = {
  latitude: number;
  longitude: number;
  accuracy: number;
  capturedAt: string;
};

const eventLatitude = 37.70939;
const eventLongitude = 127.9063;
const allowedDistanceM = 1500;

function distanceM(location: LocationProof) {
  const radians = (value: number) => value * Math.PI / 180;
  const latitudeDelta = radians(eventLatitude - location.latitude);
  const longitudeDelta = radians(eventLongitude - location.longitude);
  const startLatitude = radians(location.latitude);
  const endLatitude = radians(eventLatitude);
  const haversine = Math.sin(latitudeDelta / 2) ** 2
    + Math.cos(startLatitude) * Math.cos(endLatitude) * Math.sin(longitudeDelta / 2) ** 2;
  return 6_371_000 * 2 * Math.asin(Math.sqrt(haversine));
}

function errorMessage(reason: unknown) {
  if (reason instanceof ApiError) {
    const body = reason.body as { code?: string } | undefined;
    if (body?.code === "outside_mission_area") return "행사장 반경 1.5km 안에서만 인증할 수 있습니다.";
    if (reason.status === 401) return "로그인 정보가 만료되었습니다. 다시 로그인해 주세요.";
    if (reason.status === 409) return "이미 획득했거나 검토 중인 미션입니다.";
  }
  return "인증 신청을 처리하지 못했습니다. 잠시 후 다시 시도해 주세요.";
}

export function MissionDetailPage() {
  const courseId = Number(useSearchParams().get("id"));
  const validCourseId = Number.isInteger(courseId) && courseId > 0;
  const [course, setCourse] = useState<CourseResponse | null>(null);
  const [itinerary, setItinerary] = useState<CourseItineraryResponse | null>(null);
  const [loading, setLoading] = useState(validCourseId);
  const [message, setMessage] = useState(validCourseId ? "" : "미션 정보를 찾을 수 없습니다.");
  const [location, setLocation] = useState<LocationProof | null>(null);
  const [locating, setLocating] = useState(false);
  const [photo, setPhoto] = useState<File | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [completed, setCompleted] = useState(false);

  useEffect(() => {
    if (!validCourseId) return;
    Promise.all([api.courses.get(courseId), api.courseItinerary(courseId)])
      .then(([courseData, itineraryData]) => {
        setCourse(courseData);
        setItinerary(itineraryData);
      })
      .catch(() => setMessage("미션 정보를 불러오지 못했습니다."))
      .finally(() => setLoading(false));
  }, [courseId, validCourseId]);

  const previewUrl = useMemo(() => photo ? URL.createObjectURL(photo) : "", [photo]);
  useEffect(() => () => {
    if (previewUrl) URL.revokeObjectURL(previewUrl);
  }, [previewUrl]);

  const measuredDistance = location ? distanceM(location) : null;
  const inMissionArea = measuredDistance !== null && measuredDistance <= allowedDistanceM;

  function locate() {
    setMessage("");
    if (!navigator.geolocation) {
      setMessage("이 브라우저에서는 위치 확인을 지원하지 않습니다.");
      return;
    }
    setLocating(true);
    navigator.geolocation.getCurrentPosition(
      (position) => {
        setLocation({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
          accuracy: Math.max(position.coords.accuracy, 1),
          capturedAt: new Date(position.timestamp).toISOString(),
        });
        setLocating(false);
      },
      () => {
        setMessage("현재 위치를 확인하지 못했습니다. 브라우저의 위치 권한을 허용해 주세요.");
        setLocating(false);
      },
      { enableHighAccuracy: true, timeout: 15000, maximumAge: 0 },
    );
  }

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!api.hasToken()) {
      setMessage("로그인 후 인증을 신청할 수 있습니다.");
      return;
    }
    const stop = itinerary?.stops[0];
    if (!stop || !location || !photo || !inMissionArea) return;
    if (photo.size > 10 * 1024 * 1024) {
      setMessage("사진은 10MB 이하로 올려 주세요.");
      return;
    }

    setSubmitting(true);
    setMessage("");
    try {
      const [user, passports] = await Promise.all([api.me(), api.passports.list()]);
      const passport = passports.find((item) => item.userId === user.id);
      if (!passport) throw new Error("passport_missing");
      const upload = await api.stampSubmissions.createUploadUrl({
        passport_id: passport.id,
        stamp_id: stop.stampId,
        content_type: photo.type,
      });
      const form = new FormData();
      Object.entries(upload.fields).forEach(([key, value]) => form.append(key, value));
      form.append("file", photo);
      const uploaded = await fetch(upload.uploadUrl, { method: "POST", body: form });
      if (!uploaded.ok) throw new Error("upload_failed");
      await api.stampSubmissions.create({
        passport_id: passport.id,
        stamp_id: stop.stampId,
        object_key: upload.objectKey,
        latitude: location.latitude,
        longitude: location.longitude,
        gps_accuracy_m: location.accuracy,
        captured_at: location.capturedAt,
      });
      setCompleted(true);
      setMessage("인증 신청이 접수되었습니다. 운영자 검토 후 스탬프가 지급됩니다.");
    } catch (reason) {
      setMessage(errorMessage(reason));
    } finally {
      setSubmitting(false);
    }
  }

  if (loading) return <main className="grid min-h-[65vh] place-items-center bg-[#f3f7f4] text-sm font-semibold text-[#617168]">미션을 불러오는 중...</main>;
  if (!course || !itinerary) return <main className="grid min-h-[65vh] place-items-center bg-[#f3f7f4] px-4"><div className="text-center"><p className="font-semibold">{message}</p><Link href="/missions" className="mt-5 inline-flex text-sm font-bold text-[#008f45]">미션 목록으로</Link></div></main>;

  return (
    <main className="bg-[#f3f7f4] pb-16 text-[#172033]">
      <section className="relative min-h-[390px] overflow-hidden bg-[#173a2d]">
        {course.representativeImageUrl && <Image src={course.representativeImageUrl} alt="2026 홍천사랑마라톤대회" fill priority className="object-cover" sizes="100vw" />}
        <div className="absolute inset-0 bg-gradient-to-r from-[#09271d]/95 via-[#09271d]/75 to-[#09271d]/25" />
        <div className="relative mx-auto flex min-h-[390px] max-w-[1180px] flex-col justify-end px-5 pb-12 pt-24 text-white sm:px-8">
          <Link href="/missions" className="mb-auto inline-flex w-fit items-center gap-2 text-sm font-semibold text-white/80 hover:text-white"><AppIcon name="chevronLeft" />미션 목록</Link>
          <span className="w-fit rounded-full bg-[#00a94f] px-4 py-2 text-xs font-bold">GPS + 사진 인증</span>
          <h1 className="mt-4 max-w-3xl text-3xl font-black tracking-[-0.04em] sm:text-5xl">{course.title}</h1>
          <p className="mt-4 max-w-2xl leading-7 text-white/80">홍천의 가을 코스를 달리고 현장에서 참여 기록을 남겨 보세요.</p>
        </div>
      </section>

      <div className="mx-auto mt-8 grid max-w-[1180px] gap-7 px-4 sm:px-6 lg:grid-cols-[1fr_420px]">
        <section className="space-y-6">
          <div className="rounded-[24px] border border-[#dfe8e2] bg-white p-6 shadow-sm sm:p-8">
            <h2 className="text-2xl font-bold">미션 안내</h2>
            <p className="mt-4 leading-7 text-[#66736b]">{course.description}</p>
            <div className="mt-7 grid gap-4 sm:grid-cols-2">
              {[
                ["calendar", "행사 일시", "2026.10.04 09:00"],
                ["mapPin", "인증 장소", itinerary.stops[0]?.address ?? "홍천종합운동장"],
                ["medal", "완료 리워드", "홍천 마라톤 참가 스탬프"],
                ["camera", "인증 방식", "행사장 GPS + 참여 사진 1장"],
              ].map(([icon, label, value]) => <div key={label} className="rounded-2xl bg-[#f3f7f4] p-5"><span className="flex items-center gap-2 text-xs font-bold text-[#008f45]"><AppIcon name={icon as Parameters<typeof AppIcon>[0]["name"]} />{label}</span><p className="mt-2 text-sm font-semibold leading-6">{value}</p></div>)}
            </div>
          </div>

          <div className="rounded-[24px] border border-[#dfe8e2] bg-white p-6 shadow-sm sm:p-8">
            <h2 className="text-xl font-bold">인증 순서</h2>
            <ol className="mt-5 grid gap-4 sm:grid-cols-3">
              {["홍천종합운동장 도착", "현재 위치 확인", "참여 사진 등록 후 제출"].map((item, index) => <li key={item} className="rounded-2xl border border-[#e3ebe5] p-5"><span className="flex size-8 items-center justify-center rounded-full bg-[#008f45] text-sm font-black text-white">{index + 1}</span><p className="mt-3 text-sm font-semibold">{item}</p></li>)}
            </ol>
            <p className="mt-5 text-xs leading-5 text-[#7b877f]">사진과 위치는 미션 인증 심사에만 사용됩니다. 행사장 중심 반경 1.5km 이내에서 위치를 확인해 주세요.</p>
          </div>
        </section>

        <form onSubmit={submit} className="h-fit rounded-[24px] border border-[#dbe6de] bg-white p-6 shadow-[0_16px_50px_rgba(36,73,50,0.10)] lg:sticky lg:top-24">
          <h2 className="text-xl font-bold">참여 인증하기</h2>
          {!api.hasToken() ? <div className="mt-5 rounded-2xl bg-[#f3f7f4] p-5 text-center"><p className="text-sm leading-6 text-[#66736b]">로그인하면 GPS와 사진으로 인증을 신청할 수 있어요.</p><Link href="/login" className="mt-4 flex h-11 items-center justify-center rounded-xl bg-[#008f45] text-sm font-bold text-white">로그인하기</Link></div> : <>
            <button type="button" onClick={locate} disabled={locating || completed} className="mt-5 flex h-12 w-full cursor-pointer items-center justify-center gap-2 rounded-xl border border-[#9bc8aa] bg-[#eef8f1] text-sm font-bold text-[#007f3c] disabled:cursor-not-allowed disabled:opacity-60"><AppIcon name="mapPin" />{locating ? "현재 위치 확인 중..." : location ? "현재 위치 다시 확인" : "현재 위치 확인"}</button>
            {location && <p className={`mt-3 rounded-xl px-4 py-3 text-xs font-semibold ${inMissionArea ? "bg-[#e9f7ee] text-[#08743a]" : "bg-[#fff3e6] text-[#a15300]"}`}>{inMissionArea ? `인증 가능 구역입니다. 행사장까지 약 ${Math.round(measuredDistance ?? 0)}m` : `행사장까지 약 ${Math.round((measuredDistance ?? 0) / 100) / 10}km입니다. 행사장 근처에서 다시 확인해 주세요.`}</p>}
            <label className="mt-5 block text-sm font-bold" htmlFor="mission-photo">참여 사진</label>
            <label htmlFor="mission-photo" className="mt-2 flex min-h-36 cursor-pointer flex-col items-center justify-center overflow-hidden rounded-2xl border-2 border-dashed border-[#cbdacf] bg-[#f8faf8] text-center">
              {previewUrl ? <span className="relative block min-h-52 w-full"><Image src={previewUrl} alt="선택한 인증 사진" fill className="object-cover" unoptimized /></span> : <span className="px-5 text-sm text-[#718078]"><AppIcon name="camera" className="mx-auto mb-2 size-7 text-[#008f45]" />현장에서 촬영한 사진을 선택해 주세요<br /><small>JPG, PNG, WEBP · 최대 10MB</small></span>}
            </label>
            <input id="mission-photo" type="file" accept="image/jpeg,image/png,image/webp" className="sr-only" disabled={completed} onChange={(event) => setPhoto(event.target.files?.[0] ?? null)} />
            <button type="submit" disabled={!photo || !inMissionArea || submitting || completed} className="mt-6 flex h-13 w-full cursor-pointer items-center justify-center rounded-xl bg-[#008f45] text-sm font-black text-white transition hover:bg-[#00783a] disabled:cursor-not-allowed disabled:bg-[#aab7af]">{completed ? "인증 접수 완료" : submitting ? "인증 제출 중..." : "GPS와 사진으로 인증 신청"}</button>
          </>}
          {message && <p role="status" className={`mt-4 rounded-xl px-4 py-3 text-sm leading-6 ${completed ? "bg-[#e9f7ee] text-[#08743a]" : "bg-[#fff2f0] text-[#a03d32]"}`}>{message}</p>}
          <a href="https://hongcheonrun.net/" target="_blank" rel="noopener noreferrer" className="mt-5 flex items-center justify-center gap-1 text-xs font-bold text-[#617168] hover:text-[#008f45]">대회 공식 홈페이지 <AppIcon name="arrowRight" /></a>
        </form>
      </div>
    </main>
  );
}
