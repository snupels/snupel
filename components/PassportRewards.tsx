import Link from "next/link";
import { PASSPORT_REWARD_NOTICE, PASSPORT_REWARD_PLANS } from "@/lib/passportRewards";
import { AppIcon } from "./AppIcon";

export function PassportRewards({ stampCount }: { stampCount: number | null }) {
  return (
    <section aria-labelledby="passport-rewards-title">
      <div className="flex flex-col justify-between gap-6 sm:flex-row sm:items-end">
        <div>
          <p className="text-xs font-bold tracking-[0.2em] text-[#d5ae66]">PASSPORT REWARDS</p>
          <h2 id="passport-rewards-title" className="mt-2 text-3xl font-bold">강원에서 머물고, 여정을 기념하세요</h2>
          <p className="mt-3 max-w-2xl text-sm leading-6 text-white/65">배지는 스포츠 도전의 기록, 패스포트 리워드는 강원에서 즐길 여행 혜택입니다.</p>
        </div>
        <div className="shrink-0 rounded-2xl border border-[#d5ae66]/25 bg-[#d5ae66]/10 px-6 py-4">
          <p className="text-xs text-white/65">내가 모은 스탬프</p>
          <p className="mt-1 text-3xl font-bold text-[#e6c88c]">{stampCount ?? "—"}<span className="ml-1 text-sm font-normal text-white/65">개</span></p>
        </div>
      </div>

      <div className="mt-8 grid gap-5 md:grid-cols-2">
        {PASSPORT_REWARD_PLANS.map((reward, index) => (
          <article key={reward.id} className="rounded-[24px] border border-white/15 bg-[linear-gradient(145deg,#263327,#192231)] p-6 sm:p-8">
            <div className="flex items-start justify-between gap-4">
              <span className="flex size-14 items-center justify-center rounded-2xl bg-[#d5ae66]/15 text-[#e6c88c]"><AppIcon name={index === 0 ? "mapPin" : "gift"} className="size-7" /></span>
              <span className="rounded-full border border-[#d5ae66]/30 px-3 py-1 text-xs font-bold text-[#e6c88c]">준비 중</span>
            </div>
            <p className="mt-7 text-xs font-bold text-[#d5ae66]">{reward.phase}</p>
            <h3 className="mt-2 text-2xl font-bold">{reward.title}</h3>
            <p className="mt-3 text-sm leading-7 text-white/70">{reward.description}</p>
            <details className="mt-6 border-t border-white/10 pt-4">
              <summary className="cursor-pointer text-sm font-bold text-[#e6c88c] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#d5ae66]">준비 중인 혜택 자세히 보기</summary>
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
    </section>
  );
}
