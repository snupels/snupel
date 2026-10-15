"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { api } from "@/lib/api/service";
import { ApiError } from "@/lib/api/repository";
import type { TeeClaimResponse, TeeClaimStatus } from "@/lib/api/dto";
import { TEE_STATUS_LABELS } from "./TeeRewardClaim";

export function TeeRewardManagement() {
  const [rows, setRows] = useState<TeeClaimResponse[]>([]);
  const [selected, setSelected] = useState<TeeClaimResponse | null>(null);
  const [page, setPage] = useState(1);
  const [reload, setReload] = useState(0);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");
  const generation = useRef(0);
  const lock = useRef(false);
  useEffect(()=>{
    const version = ++generation.current;
    let active = true;
    const invalidate = ()=>{active=false;generation.current++;setRows([]);setSelected(null);setMessage("");setBusy(false);lock.current=false;setReload(v=>v+1);};
    window.addEventListener("sportspassport-auth-change",invalidate);
    Promise.resolve().then(async()=>{
      if(!active)return;
      setLoading(true);setRows([]);setSelected(null);setMessage("");
      try { const result=await api.teeClaims(page);if(active && version===generation.current)setRows(result); }
      catch(error){if(active && version===generation.current)setMessage(error instanceof ApiError && [401,403].includes(error.status)?"배송 정보를 열람할 수 있는 관리자 계정으로 로그인해 주세요.":"신청 목록을 불러오지 못했습니다.");}
      finally{if(active && version===generation.current)setLoading(false);}
    });
    const requestGeneration = generation;
    return()=>{active=false;requestGeneration.current++;window.removeEventListener("sportspassport-auth-change",invalidate);};
  },[page,reload]);
  async function update(status:TeeClaimStatus){
    if(!selected || lock.current)return;
    const version=generation.current;lock.current=true;setBusy(true);setMessage("");
    try{const row=await api.updateTeeClaim(selected.id,status);if(version!==generation.current)return;setSelected(row);setRows(items=>items.map(item=>item.id===row.id?row:item));setMessage("배송 상태를 변경했습니다.");}
    catch{if(version===generation.current)setMessage("변경하지 못했습니다. 최신 상태를 다시 불러와 확인해 주세요.");}
    finally{if(version===generation.current){lock.current=false;setBusy(false);}}
  }
  return <main className="min-h-screen bg-[#f4f7f5] px-5 py-10 text-[#172033]"><div className="mx-auto max-w-4xl">
    <Link href="/stampbook/#rewards" className="text-sm text-[#52675b]">← 패스포트 리워드</Link><h1 className="mt-5 text-3xl font-bold">티셔츠 신청·배송 관리</h1><p className="mt-3 text-sm leading-6 text-[#66736c]">기존 관리자 전용 화면입니다. 배송 정보는 업무에 필요한 범위에서만 확인해 주세요. 미션 심사 권한만으로는 열람할 수 없습니다.</p>
    {message && <p role="status" className="my-5 rounded-xl bg-white p-4">{message}</p>}
    <button type="button" disabled={loading||busy} onClick={()=>setReload(v=>v+1)} className="my-5 min-h-11 rounded-xl border px-5">새로고침</button>
    {loading?<p role="status">신청 목록 확인 중…</p>:<div className="grid gap-3 sm:grid-cols-2">{rows.map(row=><button key={row.id} disabled={busy} onClick={()=>setSelected(row)} className="rounded-xl border bg-white p-5 text-left"><strong>접수 {row.allocationNo}번 · 사이즈 {row.size}</strong><span className="mt-2 block text-sm text-[#008343]">{TEE_STATUS_LABELS[row.status]} · 배송 정보 확인 →</span></button>)}</div>}
    {selected && <section aria-label="선택한 티셔츠 신청 배송 정보" className="mt-6 rounded-2xl border bg-white p-6"><h2 className="text-xl font-bold">접수 {selected.allocationNo}번 · {selected.size}</h2><p className="mt-3">{selected.recipientName} · {selected.phoneNumber}</p><p className="mt-2">({selected.postalCode}) {selected.address} {selected.addressDetail}</p><p className="mt-2 text-sm">신청일: {new Date(selected.requestedAt).toLocaleString("ko-KR",{timeZone:"Asia/Seoul"})}</p><p className="mt-4 font-bold text-[#008343]">{TEE_STATUS_LABELS[selected.status]}</p><div className="mt-4 flex flex-wrap gap-2">{(Object.keys(TEE_STATUS_LABELS) as TeeClaimStatus[]).map((status,index)=><button key={status} type="button" disabled={busy || index <= Object.keys(TEE_STATUS_LABELS).indexOf(selected.status)} onClick={()=>void update(status)} className="min-h-11 rounded-xl border px-4 text-sm font-bold disabled:opacity-30">{TEE_STATUS_LABELS[status]}로 변경</button>)}</div><button type="button" onClick={()=>setSelected(null)} className="mt-4 text-sm underline">배송 정보 닫기</button></section>}
    <div className="mt-8 flex items-center justify-center gap-6"><button disabled={page===1||loading||busy} onClick={()=>setPage(p=>p-1)} className="min-h-11 disabled:opacity-30">이전</button><span>{page}페이지</span><button disabled={rows.length<20||loading||busy} onClick={()=>setPage(p=>p+1)} className="min-h-11 disabled:opacity-30">다음</button></div>
  </div></main>;
}
