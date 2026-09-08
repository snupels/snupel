"use client";

import Image from "next/image";
import Link from "next/link";
import { Suspense, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import type { ActivityHistoryResponse } from "@/lib/api/dto";
import { api } from "@/lib/api/service";
import { activityHistoryDetailHref, ACTIVITY_HISTORY_STATUS, ACTIVITY_HISTORY_TYPE } from "@/lib/activityHistory";
import { AppIcon } from "./AppIcon";

function DetailLoading() {
  return <main className="grid min-h-[60vh] place-items-center bg-[#f3f7f4] px-5 text-sm text-[#68756d]">내 활동 기록을 불러오는 중입니다.</main>;
}

export function ActivityDetailPage() {
  return <Suspense fallback={<DetailLoading />}><ActivityDetailRoute /></Suspense>;
}

function ActivityDetailRoute() {
  const searchParams = useSearchParams();
  const historyId = Number(searchParams.get("historyId"));
  if (Number.isSafeInteger(historyId) && historyId > 0) return <ActivityDetailContent key={historyId} historyId={historyId} />;
  const legacyActivityId = Number(searchParams.get("id"));
  const hasLegacyId = !searchParams.has("historyId") && Number.isSafeInteger(legacyActivityId) && legacyActivityId > 0;
  return (
    <main className="grid min-h-[65vh] place-items-center bg-[#f3f7f4] px-5">
      <div className="max-w-lg rounded-[24px] border border-[#dce5df] bg-white p-8 text-center">
        <AppIcon name="clipboard" className="mx-auto size-10 text-[#008f45]" />
        <h1 className="mt-5 text-2xl font-bold">{hasLegacyId ? "내 활동 기록에서 다시 선택해 주세요" : "활동 기록을 찾을 수 없습니다"}</h1>
        <p className="mt-3 text-sm leading-6 text-[#637069]">{hasLegacyId ? "이전 링크에는 장소 정보만 있어 개인 인증 결과를 확인할 수 없습니다. 내 활동 이력에서 해당 기록을 열어 주세요." : "올바른 활동 기록 링크인지 확인해 주세요."}</p>
        <Link href="/activity-history" className="mt-6 flex h-12 items-center justify-center rounded-xl bg-[#008f45] font-bold text-white">내 활동 이력 보기</Link>
        {hasLegacyId && <Link href={"/sports/detail/?id=" + legacyActivityId} className="mt-4 inline-flex text-sm font-bold text-[#008f45]">관련 장소 정보 보기<AppIcon name="arrowRight" /></Link>}
      </div>
    </main>
  );
}

function ActivityDetailContent({ historyId }: { historyId: number }) {
  const [record, setRecord] = useState<ActivityHistoryResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [requiresLogin, setRequiresLogin] = useState(false);
  const [error, setError] = useState("");
  const [retry, setRetry] = useState(0);

  useEffect(() => {
    const reset = () => {
      setRecord(null);
      setError("");
      setRequiresLogin(false);
      setLoading(true);
      setRetry((value) => value + 1);
    };
    window.addEventListener("sportspassport-auth-change", reset);
    return () => window.removeEventListener("sportspassport-auth-change", reset);
  }, []);

  useEffect(() => {
    let cancelled = false;
    Promise.resolve().then(async () => {
      if (cancelled) return;
      if (!api.hasToken()) {
        setRequiresLogin(true);
        return;
      }
      const item = await api.activityHistory.get(historyId);
      if (!cancelled) setRecord(item);
    }).catch((reason: unknown) => {
      if (cancelled) return;
      const status = typeof reason === "object" && reason && "status" in reason ? Number(reason.status) : 0;
      if (status === 401) setRequiresLogin(true);
      else setError(status === 404 || status === 403
        ? "이 활동 기록을 찾을 수 없거나 내 계정의 기록이 아닙니다."
        : "활동 기록을 불러오지 못했습니다. 다시 시도해 주세요.");
    }).finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, [historyId, retry]);

  if (loading) return <DetailLoading />;
  if (requiresLogin) return (
    <main className="grid min-h-[65vh] place-items-center bg-[#f3f7f4] px-5">
      <div className="max-w-md rounded-[24px] border border-[#dce5df] bg-white p-8 text-center">
        <AppIcon name="lock" className="mx-auto size-10 text-[#008f45]" />
        <h1 className="mt-5 text-2xl font-bold">내 활동 기록은 로그인 후 확인하세요</h1>
        <p className="mt-3 text-sm leading-6 text-[#637069]">인증 사진과 심사 결과는 해당 기록을 남긴 계정에서만 볼 수 있습니다.</p>
        <Link href={"/login?next=" + encodeURIComponent(activityHistoryDetailHref(historyId))} className="mt-6 flex h-12 items-center justify-center rounded-xl bg-[#008f45] font-bold text-white">로그인하고 기록 확인하기</Link>
      </div>
    </main>
  );
  if (!record || error) return (
    <main className="grid min-h-[65vh] place-items-center bg-[#f3f7f4] px-5">
      <div className="max-w-md rounded-[24px] border border-[#dce5df] bg-white p-8 text-center">
        <h1 className="text-xl font-bold">활동 기록을 표시할 수 없어요</h1>
        <p role="alert" className="mt-3 text-sm leading-6 text-[#637069]">{error || "활동 기록이 없습니다."}</p>
        <button type="button" onClick={() => { setError(""); setLoading(true); setRetry((value) => value + 1); }} className="mt-6 cursor-pointer rounded-xl border border-[#9dcdb0] px-5 py-3 text-sm font-bold text-[#008f45]">다시 불러오기</button>
        <Link href="/activity-history" className="mt-5 block text-sm font-bold text-[#008f45]">내 활동 이력으로 돌아가기</Link>
      </div>
    </main>
  );

  const status = ACTIVITY_HISTORY_STATUS[record.status];
  const title = record.title ?? record.placeName ?? "나의 활동";
  return (
    <main className="min-h-screen bg-[#f3f7f4] px-5 pb-20 pt-10 text-[#172033] sm:px-8 sm:pt-14">
      <div className="mx-auto max-w-[1080px]">
        <Link href="/activity-history" className="inline-flex items-center gap-2 text-sm font-semibold text-[#637069] transition hover:text-[#008f45]"><AppIcon name="chevronLeft" className="size-5" />내 활동 이력으로 돌아가기</Link>
        <header className="mt-7">
          <p className="text-sm font-bold text-[#008f45]">{ACTIVITY_HISTORY_TYPE[record.type]}</p>
          <h1 className="mt-2 text-3xl font-bold tracking-[-0.04em] sm:text-4xl">{title}</h1>
          <p className="mt-3 text-sm text-[#637069]">내 계정에 연결된 실제 활동 기록과 심사 결과입니다.</p>
        </header>
        <article className="mt-7 overflow-hidden rounded-[28px] border border-[#dce6df] bg-white shadow-[0_18px_55px_rgba(23,58,45,0.12)]">
          <div className="relative aspect-[4/3] min-h-[260px] max-h-[650px] bg-[#e8efeb]">
            {record.imageUrl ? <Image src={record.imageUrl} alt={record.type === "submission" ? "내가 제출한 인증 사진" : title + " 활동 사진"} fill sizes="(max-width: 1080px) 100vw, 1080px" className="object-contain" unoptimized /> : <div className="flex h-full min-h-[260px] flex-col items-center justify-center gap-4 text-[#74897b]"><AppIcon name="camera" className="size-12" /><p className="text-sm">이 기록에 등록된 사진이 없습니다.</p></div>}
          </div>
          <div className="grid gap-8 p-7 sm:p-10 lg:grid-cols-[minmax(0,1fr)_330px]">
            <section>
              <span className={"inline-flex rounded-full px-4 py-2 text-sm font-bold " + status.className}>{record.type === "saved" ? "저장됨" : status.label}</span>
              <h2 className="mt-5 text-xl font-bold">{record.type === "submission" ? "인증 심사 안내" : "활동 기록 안내"}</h2>
              <p className="mt-3 text-sm leading-7 text-[#526058]">{record.type === "saved" ? "관심 있는 활동으로 저장한 기록입니다. 참여 인증이나 스탬프 획득 기록은 아닙니다." : status.description}</p>
              {record.status === "rejected" && <div className="mt-6 rounded-2xl border border-[#efcdc7] bg-[#fff0ed] p-5"><h3 className="font-bold text-[#9e4236]">반려 사유</h3><p className="mt-2 whitespace-pre-line text-sm leading-6 text-[#9e4236]">{record.rejectionReason || "별도 반려 사유가 등록되지 않았습니다. 미션의 인증 조건을 다시 확인해 주세요."}</p></div>}
              {record.courseId && <Link href={"/missions/detail/?id=" + record.courseId} className="mt-6 inline-flex items-center gap-2 rounded-xl bg-[#008f45] px-5 py-3 text-sm font-bold text-white hover:bg-[#00783a]">{record.status === "rejected" ? "미션 안내에서 다시 인증하기" : "관련 미션 안내 보기"}<AppIcon name="arrowRight" /></Link>}
            </section>
            <aside className="h-fit rounded-2xl bg-[#f1f7f3] p-6">
              <h2 className="font-bold">내 활동 상세</h2>
              <dl className="mt-5 space-y-5 text-sm">
                <div><dt className="font-semibold text-[#526058]">기록 일시</dt><dd className="mt-1"><time dateTime={record.occurredAt}>{new Date(record.occurredAt).toLocaleString("ko-KR", { timeZone: "Asia/Seoul", dateStyle: "medium", timeStyle: "short" })}</time></dd></div>
                <div><dt className="font-semibold text-[#526058]">장소</dt><dd className="mt-1 leading-6">{record.placeName ?? "장소 정보 없음"}</dd></div>
                {record.sigun && <div><dt className="font-semibold text-[#526058]">지역</dt><dd className="mt-1">{record.sigun}</dd></div>}
                <div><dt className="font-semibold text-[#526058]">활동 유형</dt><dd className="mt-1">{ACTIVITY_HISTORY_TYPE[record.type]}</dd></div>
              </dl>
              <Link href={"/sports/detail/?id=" + record.activityId} className="mt-6 flex h-11 items-center justify-center gap-2 rounded-xl border border-[#9dcdb0] text-sm font-bold text-[#008f45]">관련 장소 정보 보기<AppIcon name="arrowRight" /></Link>
              {(record.status === "approved" || (record.status === "collected" && record.type === "stamp")) && <Link href="/mypage" className="mt-3 flex h-11 items-center justify-center rounded-xl bg-[#008f45] text-sm font-bold text-white">나의 패스포트 보기</Link>}
              <Link href="/community/" className="mt-3 flex h-11 items-center justify-center gap-2 rounded-xl border border-[#9dcdb0] text-sm font-bold text-[#008f45] transition hover:bg-[#e2f1e7]"><AppIcon name="users" className="size-4" />스포츠 피드 보기</Link>
            </aside>
          </div>
        </article>
      </div>
    </main>
  );
}
