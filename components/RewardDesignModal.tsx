"use client";

import Image from "next/image";
import { useEffect, useRef } from "react";
import type { PassportRewardPlan } from "@/lib/passportRewards";

export function RewardDesignModal({ reward, onClose }: { reward: PassportRewardPlan; onClose: () => void }) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;
    const previousFocus = document.activeElement as HTMLElement | null;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    dialog.showModal();
    return () => {
      dialog.close();
      document.body.style.overflow = previousOverflow;
      if (previousFocus?.isConnected) previousFocus.focus();
    };
  }, []);

  return (
    <dialog ref={dialogRef} aria-labelledby="reward-design-title" aria-describedby="reward-design-description" onCancel={(event) => { event.preventDefault(); onClose(); }} onClick={(event) => { if (event.target === event.currentTarget) onClose(); }} className="fixed inset-0 m-auto max-h-[92dvh] w-[calc(100%_-_2rem)] max-w-5xl overflow-y-auto overscroll-contain rounded-3xl border border-white/15 bg-[#171d2b] p-0 text-white shadow-2xl backdrop:bg-black/75 backdrop:backdrop-blur-sm motion-safe:animate-[reward-reveal_180ms_ease-out]">
      <header className="flex items-center justify-between gap-4 border-b border-white/10 px-5 py-4 sm:px-7">
        <div><p className="text-[10px] font-bold tracking-[0.2em] text-[#d5ae66]">GSP ORIGINAL</p><h2 id="reward-design-title" className="mt-1 text-lg font-bold sm:text-xl">{reward.title}</h2></div>
        <button type="button" autoFocus onClick={onClose} aria-label="티셔츠 디자인 닫기" className="flex size-11 shrink-0 items-center justify-center rounded-full bg-white/10 text-2xl transition hover:bg-white/20 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#e6c88c]">×</button>
      </header>
      <div className="bg-[#d8dce0]">
        <Image src={reward.previewImage!} alt="GSP 자체 제작 블랙 티셔츠 앞면·뒷면과 로고·등고선 그래픽 상세 디자인" width={1536} height={1024} sizes="(max-width: 1024px) 100vw, 1024px" className="max-h-[62dvh] w-full object-contain" />
      </div>
      <footer className="px-5 py-5 sm:px-7">
        <div className="flex flex-wrap gap-2 text-xs font-bold"><span className="rounded-full bg-[#d5ae66] px-3 py-1.5 text-[#171d2b]">스탬프 {reward.requiredStamps}개 달성</span><span className="rounded-full border border-[#d5ae66]/40 px-3 py-1.5 text-[#e6c88c]">선착순 {reward.quantity}명</span><span className="rounded-full bg-white/10 px-3 py-1.5 text-white/70">리워드 카드에서 신청 현황 확인</span></div>
        <p id="reward-design-description" className="mt-3 text-xs leading-6 text-white/60">앞면·뒷면과 디테일을 한눈에 확인해 보세요. 디자인 시안으로 실제 제작 시 색상·세부 사양이 달라질 수 있습니다. 이 창을 닫고 리워드 카드에서 사이즈·배송 정보를 입력해 신청할 수 있습니다.</p>
      </footer>
    </dialog>
  );
}
