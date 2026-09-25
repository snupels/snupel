"use client";

import Link from "next/link";
import { useCallback, useEffect, useRef, useState } from "react";
import type { StampSubmissionResponse, SubmissionStatus } from "@/lib/api/dto";
import { api } from "@/lib/api/service";
import { ApiError } from "@/lib/api/repository";
import { ProofGallery } from "./ProofGallery";

const labels = { pending: "심사 대기", approved: "승인 완료", rejected: "반려" };

export function MissionReviewPage() {
  const [status, setStatus] = useState<SubmissionStatus>("pending");
  const [rows, setRows] = useState<StampSubmissionResponse[]>([]);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [selected, setSelected] = useState<StampSubmissionResponse | null>(null);
  const [reason, setReason] = useState("");
  const [busy, setBusy] = useState(false);
  const lock = useRef(false);
  const generation = useRef(0);
  const load = useCallback(async () => {
    const current = ++generation.current;
    setLoading(true); setError(""); setRows([]); setSelected(null); setReason("");
    try {
      const result = await api.adminStampSubmissions.list(status, page, 12);
      if (generation.current === current) setRows(result);
    } catch (failure) {
      if (generation.current === current) setError(failure instanceof ApiError && [401, 403].includes(failure.status)
        ? "미션 심사 권한이 있는 운영계정으로 로그인해 주세요."
        : "인증 목록을 불러오지 못했습니다. 다시 시도해 주세요.");
    } finally { if (generation.current === current) setLoading(false); }
  }, [status, page]);
  useEffect(() => {
    const timer = window.setTimeout(() => void load(), 0);
    window.addEventListener("sportspassport-auth-change", load);
    const requestGeneration = generation;
    return () => { window.clearTimeout(timer); requestGeneration.current++; window.removeEventListener("sportspassport-auth-change", load); };
  }, [load]);
  async function review(approve: boolean) {
    if (!selected || lock.current || (!approve && !reason.trim())) return;
    if (approve && !window.confirm("사진이 미션 인증 조건을 충족하나요? 승인하면 스탬프와 달성한 배지가 지급됩니다.")) return;
    lock.current = true; setBusy(true); setMessage("");
    try {
      if (approve) await api.adminStampSubmissions.approve(selected.id);
      else await api.adminStampSubmissions.reject(selected.id, reason.trim());
      setMessage(approve ? "승인했습니다. 스탬프와 배지 조건이 반영되었습니다." : "반려했습니다. 참여자에게 반려 사유가 표시됩니다.");
      await load();
    } catch (failure) {
      setMessage(failure instanceof ApiError && failure.status === 409
        ? "이미 처리된 인증입니다. 목록을 새로고침해 주세요."
        : "처리에 실패했습니다. 상태를 새로고침한 뒤 다시 확인해 주세요.");
    } finally { lock.current = false; setBusy(false); }
  }
  return <main className="min-h-screen bg-[#f4f7f5] px-4 py-10 text-[#172033]">
    <div className="mx-auto max-w-5xl">
      <Link href="/mypage/" className="text-sm text-[#66736c]">← 나의 패스포트</Link>
      <h1 className="mt-5 text-3xl font-bold">미션 인증 관리</h1>
      <p className="mt-3 text-sm leading-6 text-[#66736c]">제출 사진과 미션 조건을 확인해 주세요. 승인과 피드 공개 여부는 별개이며, 공개를 선택한 인증만 승인 후 공개됩니다.</p>
      <nav className="my-6 flex gap-2" aria-label="인증 상태">
        {(Object.keys(labels) as SubmissionStatus[]).map(value => <button disabled={busy} key={value} aria-pressed={status === value} onClick={() => { setStatus(value); setPage(1); }} className={`cursor-pointer rounded-full px-4 py-2 text-sm font-bold ${status === value ? "bg-[#008f45] text-white" : "bg-white"}`}>{labels[value]}</button>)}
      </nav>
      {message && <p role="status" className="mb-4 rounded-xl bg-[#e8f4ec] p-4">{message}</p>}
      {error && <div role="alert" className="rounded-xl bg-white p-6"><p>{error}</p><Link href="/login/?next=%2Fmission-review%2F" className="mr-4 underline">로그인</Link><button onClick={() => void load()} className="cursor-pointer underline">다시 불러오기</button></div>}
      {loading ? <p role="status">인증 목록을 불러오는 중…</p> : !error && <>
        {!rows.length && <p className="rounded-xl bg-white p-8">이 상태의 인증이 없습니다.</p>}
        <div className="grid gap-3 sm:grid-cols-2">{rows.map(row => <button disabled={busy} key={row.id} onClick={() => { setSelected(row); setReason(""); }} className="cursor-pointer rounded-2xl border border-[#dce5df] bg-white p-5 text-left hover:border-[#008f45]">
          <span className="text-xs text-[#008f45]">{labels[row.status]} · 인증 #{row.id}</span><h2 className="mt-2 font-bold">{row.courseTitle ?? row.activity?.placeName ?? "미션 인증"}</h2>
          <p className="mt-2 text-sm">{row.authorName} · 사진 {row.proofUrls?.length ?? 1}장 · {row.shareToFeed ? "피드 공개" : "비공개"}</p>
          <time className="mt-2 block text-xs text-[#66736c]">{new Date(row.createdAt).toLocaleString("ko-KR")}</time><span className="mt-3 block text-sm font-bold text-[#008f45]">사진·인증 조건 확인 →</span>
        </button>)}</div>
        <div className="my-6 flex items-center justify-center gap-5"><button disabled={page === 1 || busy} onClick={() => setPage(page - 1)} className="cursor-pointer disabled:opacity-30">이전</button><span>{page}페이지</span><button disabled={rows.length < 12 || busy} onClick={() => setPage(page + 1)} className="cursor-pointer disabled:opacity-30">다음</button></div>
      </>}
      {selected && <section aria-label="선택한 인증 심사" className="mt-6 overflow-hidden rounded-2xl bg-white">
        <div className="p-6"><h2 className="text-xl font-bold">{selected.courseTitle ?? selected.activity?.placeName} · {selected.authorName}</h2>
        <p className="mt-4 whitespace-pre-line rounded-xl bg-[#f4f7f5] p-4 text-sm leading-6">{selected.proofInstructions ?? "미션에 안내된 현장 방문 사진인지 확인해 주세요."}</p>
        <p className="mt-4 whitespace-pre-line">{selected.feedCaption || "작성한 글 없음"}</p></div>
        <ProofGallery key={selected.id} urls={selected.proofUrls?.length ? selected.proofUrls : selected.proofUrl ? [selected.proofUrl] : []} label="제출된 인증 사진" />
        {selected.status === "pending" ? <div className="p-6">
          <label className="block text-sm font-bold">반려 사유 (반려 시 필수)<textarea value={reason} onChange={event => setReason(event.target.value)} disabled={busy} maxLength={1000} className="mt-2 block min-h-24 w-full rounded-xl border p-3 font-normal" placeholder="다시 인증할 때 보완할 내용을 알려주세요." /></label>
          <div className="mt-4 flex gap-3"><button disabled={busy} onClick={() => void review(true)} className="cursor-pointer rounded-xl bg-[#008f45] px-6 py-3 font-bold text-white disabled:opacity-40">인증 승인</button><button disabled={busy || !reason.trim()} onClick={() => void review(false)} className="cursor-pointer rounded-xl border border-red-200 px-6 py-3 font-bold text-red-700 disabled:opacity-40">반려</button></div>
        </div> : <p className="p-6">{labels[selected.status]}{selected.rejectionReason ? ` · ${selected.rejectionReason}` : ""}</p>}
      </section>}
    </div>
  </main>;
}
