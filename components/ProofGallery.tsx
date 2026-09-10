"use client";

import Image from "next/image";
import { useState } from "react";
import { AppIcon } from "./AppIcon";

export function ProofGallery({ urls, label }: { urls: string[]; label: string }) {
  const [index, setIndex] = useState(0);
  const current = Math.min(index, Math.max(0, urls.length - 1));
  return <div>
    <div className="relative h-[min(75vh,760px)] min-h-72 overflow-hidden bg-[#e7ece8]" aria-roledescription="사진 갤러리">
      {urls[current] ? <Image src={urls[current]} alt={`${label} ${current + 1}`} fill sizes="(max-width: 1120px) 100vw, 1120px" className="object-contain" /> : <div className="flex h-full items-center justify-center text-sm text-[#66736c]">사진을 불러올 수 없습니다</div>}
      {urls.length > 1 && <>
        <span aria-live="polite" className="absolute right-4 top-4 rounded-full bg-black/65 px-3 py-1 text-xs font-bold text-white">{current + 1} / {urls.length}</span>
        <button type="button" aria-label="이전 사진" disabled={current === 0} onClick={() => setIndex(current - 1)} className="absolute left-3 top-1/2 flex size-11 -translate-y-1/2 cursor-pointer items-center justify-center rounded-full bg-white/90 shadow disabled:invisible"><AppIcon name="chevronLeft" /></button>
        <button type="button" aria-label="다음 사진" disabled={current === urls.length - 1} onClick={() => setIndex(current + 1)} className="absolute right-3 top-1/2 flex size-11 -translate-y-1/2 cursor-pointer items-center justify-center rounded-full bg-white/90 shadow disabled:invisible"><AppIcon name="chevronRight" /></button>
      </>}
    </div>
    {urls.length > 1 && <div className="flex justify-center gap-2 bg-[#f6f8f6] p-3">{urls.map((url, number) => <button key={number} type="button" aria-label={`사진 ${number + 1} 보기`} aria-pressed={current === number} onClick={() => setIndex(number)} className={`relative size-14 cursor-pointer overflow-hidden rounded-lg border-2 ${current === number ? "border-[#008f45]" : "border-transparent opacity-60"}`}><Image src={url} alt="" fill sizes="56px" className="object-cover" /></button>)}</div>}
  </div>;
}
