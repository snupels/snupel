"use client";

import Link from "next/link";
import { FormEvent, useEffect, useState } from "react";
import type { MeBadgeResponse, RewardClaimResponse, RewardMilestone } from "@/lib/api/dto";
import { api } from "@/lib/api/service";
import { BADGE_REWARD_MILESTONES } from "@/lib/badgeRewards";
import { BADGE_CATALOG } from "@/lib/badgeCatalog";
import { AppIcon } from "./AppIcon";

const REWARD_STATUS = { eligible: "배송 신청 가능", requested: "신청 접수", preparing: "배송 준비 중", shipped: "배송 중", completed: "지급 완료" };

export function BadgesPage() {
  const [authChecked, setAuthChecked] = useState(false);
  const [authenticated, setAuthenticated] = useState(false);
  const [badges, setBadges] = useState<MeBadgeResponse[]>([]);
  const [rewards, setRewards] = useState<RewardClaimResponse[]>([]);
  const [claimTarget, setClaimTarget] = useState<RewardMilestone | null>(null);
  const [message, setMessage] = useState("");

  useEffect(() => {
    Promise.resolve().then(async () => {
      if (!api.hasToken()) return;
      setAuthenticated(true);
      const [badgeData, rewardData] = await Promise.all([api.myBadges(), api.myRewards()]);
      setBadges(badgeData);
      setRewards(rewardData);
    }).catch(() => setMessage("배지와 리워드 정보를 불러오지 못했습니다."))
      .finally(() => setAuthChecked(true));
  }, []);

  async function claim(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!claimTarget) return;
    const form = new FormData(event.currentTarget);
    try {
      const reward = await api.claimReward(claimTarget, {
        recipient_name: String(form.get("recipientName")),
        phone_number: String(form.get("phoneNumber")),
        address: String(form.get("address")),
      });
      setRewards((items) => items.map((item) => item.milestone === reward.milestone ? reward : item));
      setClaimTarget(null);
      setMessage("배송 신청이 접수되었습니다.");
    } catch {
      setMessage("배송 신청을 처리하지 못했습니다. 입력 내용을 확인해 주세요.");
    }
  }

  if (!authChecked) return <main className="grid min-h-[60vh] place-items-center bg-[#f4f7f5] text-sm text-[#737f78]">배지 정보를 확인하는 중…</main>;
  if (!authenticated) return <main className="grid min-h-[65vh] place-items-center bg-[#f4f7f5] px-4"><div className="max-w-md rounded-[24px] border border-[#dce5df] bg-white p-8 text-center"><AppIcon name="lock" className="mx-auto size-10 text-[#008343]" /><h1 className="mt-5 text-2xl font-bold">로그인이 필요합니다</h1><p className="mt-2 text-sm leading-6 text-[#737f78]">로그인하면 내 배지 화면을 확인할 수 있어요.</p><Link href="/login" className="mt-6 flex h-12 items-center justify-center rounded-xl bg-[#008343] font-bold text-white">로그인하기</Link></div></main>;

  const earnedIds = new Set(badges.map((badge) => badge.badgeId));
  const rewardByThreshold = new Map(rewards.map((reward) => [reward.milestone === "badge_6" ? 6 : 12, reward]));

  return (
    <div className="min-h-screen bg-[#f4f7f5] text-[#172033]">
      <main className="mx-auto max-w-[1180px] px-5 pb-20 pt-12 sm:px-8 sm:pt-16">
        <Link href="/mypage" className="inline-flex items-center gap-2 text-sm font-medium text-[#66726b] hover:text-[#007a3d]"><AppIcon name="chevronLeft" className="size-5" />뒤로가기</Link>
        <header className="mt-10"><h1 className="text-4xl font-bold tracking-[-0.04em]">나의 배지</h1><p className="mt-3 text-[#737f78]">획득한 배지 {badges.length}개와 배송 리워드 상태를 확인하세요.</p></header>
        {message && <p role="status" className="mt-5 rounded-xl bg-white p-4 text-sm text-[#4f5f56]">{message}</p>}

        <section className="mt-10 rounded-[24px] border border-[#dce5df] bg-white p-6 shadow-sm sm:p-8">
          <p className="text-xs font-bold tracking-[0.16em] text-[#008343]">BADGE REWARDS</p><h2 className="mt-2 text-2xl font-bold">배지 달성 리워드</h2>
          <div className="mt-7 grid gap-4 md:grid-cols-3">{BADGE_REWARD_MILESTONES.map((reward) => {
            const claim = rewardByThreshold.get(reward.threshold);
            return <article key={reward.threshold} className="rounded-2xl border border-[#e1e7e3] bg-[#f8faf9] p-5"><AppIcon name={reward.threshold === 1 ? "award" : "gift"} className="size-8 text-[#008343]" /><p className="mt-5 text-xs font-bold text-[#008343]">배지 {reward.threshold}개 달성 · {reward.fulfillment}</p><h3 className="mt-2 font-bold">{reward.title}</h3><p className="mt-2 text-sm leading-6 text-[#7d8782]">{reward.description}</p><p className="mt-4 text-xs font-bold text-[#536159]">{reward.threshold === 1 ? `${badges.length}개 획득` : claim ? REWARD_STATUS[claim.status] : "미달성"}</p>{claim?.status === "eligible" && <button type="button" onClick={() => setClaimTarget(claim.milestone)} className="mt-4 h-10 w-full rounded-xl bg-[#008343] text-sm font-bold text-white">배송 신청</button>}</article>;
          })}</div>
          {claimTarget && <form onSubmit={claim} className="mt-6 grid gap-3 rounded-2xl border border-[#cfe0d5] p-5 sm:grid-cols-2"><h3 className="font-bold sm:col-span-2">리워드 배송 정보</h3><input name="recipientName" required maxLength={100} placeholder="받는 분" aria-label="받는 분" className="h-11 rounded-xl border px-3" /><input name="phoneNumber" required minLength={7} maxLength={30} placeholder="연락처" aria-label="연락처" className="h-11 rounded-xl border px-3" /><textarea name="address" required maxLength={1000} placeholder="배송 주소" aria-label="배송 주소" className="min-h-24 rounded-xl border p-3 sm:col-span-2" /><div className="flex gap-2 sm:col-span-2"><button type="submit" className="h-11 flex-1 rounded-xl bg-[#008343] font-bold text-white">신청하기</button><button type="button" onClick={() => setClaimTarget(null)} className="h-11 rounded-xl border px-5 font-bold">취소</button></div></form>}
        </section>

        <section className="mt-12"><h2 className="text-2xl font-bold">전체 배지 조건</h2><div className="mt-7 grid grid-cols-2 gap-4 md:grid-cols-4 md:gap-6">{BADGE_CATALOG.map((badge) => { const earned = earnedIds.has(badge.id); return <article key={badge.id} className={`flex min-h-[210px] flex-col items-center justify-center rounded-[20px] border px-4 py-6 text-center ${earned ? "border-[#57aa78] bg-[#eef9f2]" : "border-[#d6e1da] bg-white"}`}><span className={`flex size-20 items-center justify-center rounded-full ${earned ? "bg-[#008343] text-white" : "bg-[#e8f3ec] text-[#008343]"}`}><AppIcon name={earned ? "checkCircle" : badge.icon} className="size-9" /></span><h3 className="mt-5 font-bold">{badge.name}</h3><p className="mt-2 text-sm leading-5 text-[#929b96]">{earned ? "획득 완료" : badge.description}</p></article>; })}</div></section>
      </main>
    </div>
  );
}
