"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { PASSPORT_REWARD_NOTICE, PASSPORT_REWARD_PLANS, type PassportRewardPlan } from "@/lib/passportRewards";
import { AppIcon } from "./AppIcon";
import { RewardDesignModal } from "./RewardDesignModal";
import { TeeRewardClaim } from "./TeeRewardClaim";

export function PassportRewards({ stampCount }: { stampCount: number | null }) {
  const [previewReward, setPreviewReward] = useState<PassportRewardPlan | null>(null);
  return (
    <section aria-labelledby="passport-rewards-title">
      <div className="flex flex-col justify-between gap-6 sm:flex-row sm:items-end">
        <div>
          <p className="text-xs font-bold tracking-[0.2em] text-[#d5ae66]">PASSPORT REWARDS</p>
          <h2 id="passport-rewards-title" className="mt-2 text-3xl font-bold">도전의 다음, 나만의 리워드</h2>
          <p className="mt-3 max-w-2xl text-sm leading-6 text-white/65">스탬프로 쌓은 강원 여정을 특별한 기념으로. 스탬프 5개를 모았다면 선착순 티셔츠 리워드를 신청해 보세요. 숙박 제휴 혜택은 준비 중입니다.</p>
        </div>
        <div className="shrink-0 rounded-2xl border border-[#d5ae66]/25 bg-[#d5ae66]/10 px-6 py-4">
          <p className="text-xs text-white/65">내가 모은 스탬프</p>
          <p className="mt-1 text-3xl font-bold text-[#e6c88c]">{stampCount ?? "—"}<span className="ml-1 text-sm font-normal text-white/65">개</span></p>
        </div>
      </div>

      <div className="mt-8 grid items-start gap-5 md:grid-cols-2">
        {PASSPORT_REWARD_PLANS.map((reward, index) => (
          <article key={reward.id} className="rounded-[24px] border border-white/15 bg-[linear-gradient(145deg,#263327,#192231)] p-6 sm:p-8">
            <div className="flex items-start justify-between gap-4">
              <span className="flex size-14 items-center justify-center rounded-2xl bg-[#d5ae66]/15 text-[#e6c88c]"><AppIcon name={index === 0 ? "mapPin" : "gift"} className="size-7" /></span>
              <span className="rounded-full border border-[#d5ae66]/30 px-3 py-1 text-xs font-bold text-[#e6c88c]">{reward.status === "open" ? "선착순 신청" : "제휴 준비 중"}</span>
            </div>
            <p className="mt-7 text-xs font-bold text-[#d5ae66]">{reward.phase}</p>
            <h3 className="mt-2 text-2xl font-bold">{reward.title}</h3>
            {reward.previewImage && <>
              <div className="mt-4 flex flex-wrap gap-2 text-xs font-bold"><span className="rounded-full bg-[#d5ae66] px-3 py-1.5 text-[#171d2b]">스탬프 {reward.requiredStamps}개 달성</span><span className="rounded-full border border-[#d5ae66]/40 px-3 py-1.5 text-[#e6c88c]">선착순 {reward.quantity}명</span></div>
              <button type="button" aria-haspopup="dialog" aria-label="GSP 자체 제작 티셔츠 디자인 크게 보기" onClick={() => setPreviewReward(reward)} className="group relative mt-5 block aspect-[3/2] w-full cursor-zoom-in overflow-hidden rounded-2xl bg-[#d8dce0] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#d5ae66]">
                <Image src={reward.previewImage} alt="GSP 블랙 티셔츠 앞면·뒷면 디자인" fill sizes="(max-width: 768px) 100vw, 50vw" className="object-contain transition duration-300 motion-safe:group-hover:scale-[1.02]" />
                <span className="absolute bottom-3 right-3 rounded-full bg-[#171d2b]/90 px-4 py-2 text-xs font-bold text-white shadow-lg">디자인 크게 보기 +</span>
              </button>
            </>}
            <p className="mt-3 text-sm leading-7 text-white/70">{reward.description}</p>
            {reward.status === "open" && <TeeRewardClaim />}
            <details className="mt-6 border-t border-white/10 pt-4">
              <summary className="cursor-pointer text-sm font-bold text-[#e6c88c] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#d5ae66]">{reward.status === "open" ? "리워드 안내 자세히 보기" : "준비 중인 혜택 자세히 보기"}</summary>
              <ul className="mt-4 list-disc space-y-2 pl-5 text-sm leading-6 text-white/65">{reward.details.map((detail) => <li key={detail}>{detail}</li>)}</ul>
            </details>
          </article>
        ))}
      </div>

      <div className="mt-6 rounded-2xl border border-white/15 bg-white/[0.04] p-6">
        <h3 className="font-bold text-[#e6c88c]">시작 전에 꼭 확인해 주세요</h3>
        <p className="mt-2 text-sm leading-7 text-white/70">{PASSPORT_REWARD_NOTICE}</p>
        <p className="mt-2 text-sm leading-7 text-white/60">배지 6개·12개 달성에 따른 실물 배지 배송은 ‘나의 배지’에서 별도로 확인할 수 있어요.</p>
        <div className="mt-5 flex flex-wrap gap-3">
          <Link href="/missions" className="inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-[#d5ae66] px-5 text-sm font-bold text-[#171d2b] hover:bg-[#e6c88c] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#d5ae66]">스탬프 모을 미션 찾기<AppIcon name="arrowRight" className="size-4" /></Link>
          <Link href="/badges" className="inline-flex h-11 items-center justify-center rounded-xl border border-white/30 px-5 text-sm font-bold text-white hover:bg-white/10">배지와 실물 배지 배송 보기</Link>
        </div>
      </div>
      {previewReward && <RewardDesignModal reward={previewReward} onClose={() => setPreviewReward(null)} />}
    </section>
  );
}
