"use client";

import Link from "next/link";
import { FormEvent, useEffect, useRef, useState } from "react";
import type { MeBadgeResponse, RewardClaimResponse, RewardMilestone } from "@/lib/api/dto";
import { api } from "@/lib/api/service";
import { ApiError } from "@/lib/api/repository";
import { loginHref } from "@/lib/auth-flow";
import { BADGE_REWARD_MILESTONES } from "@/lib/badgeRewards";
import { BADGE_CATALOG, earnedBadgeCatalogIds } from "@/lib/badgeCatalog";
import { AppIcon } from "./AppIcon";

const REWARD_STATUS = { eligible: "배송 신청 가능", requested: "신청 접수", preparing: "배송 준비 중", shipped: "배송 중", completed: "지급 완료" };

export function BadgesPage() {
  const [authChecked, setAuthChecked] = useState(false);
  const [authenticated, setAuthenticated] = useState(false);
  const [badges, setBadges] = useState<MeBadgeResponse[]>([]);
  const [rewards, setRewards] = useState<RewardClaimResponse[]>([]);
  const [claimTarget, setClaimTarget] = useState<RewardMilestone | null>(null);
  const [message, setMessage] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const claimLock = useRef(false);
  const authVersion = useRef(0);
  const [reload, setReload] = useState(0);

  useEffect(() => {
    let active = true;
    const clearOnAuthChange = () => {
      active = false;
      authVersion.current++;
      claimLock.current = false;
      setSubmitting(false);
      setAuthenticated(false);
      setAuthChecked(false);
      setBadges([]);
      setRewards([]);
      setClaimTarget(null);
      setMessage("");
      setReload((value) => value + 1);
    };
    window.addEventListener("sportspassport-auth-change", clearOnAuthChange);
    Promise.resolve().then(async () => {
      if (!active || !api.hasToken()) return;
      setAuthenticated(true);
      const [badgeData, rewardData] = await Promise.all([api.myBadges(), api.myRewards()]);
      if (!active) return;
      setBadges(badgeData);
      setRewards(rewardData);
    }).catch((error) => {
      if (!active) return;
      if (error instanceof ApiError && error.status === 401) setAuthenticated(false);
      setMessage("배지와 실물 배지 배송 정보를 불러오지 못했습니다.");
    })
      .finally(() => { if (active) setAuthChecked(true); });
    return () => { active = false; window.removeEventListener("sportspassport-auth-change", clearOnAuthChange); };
  }, [reload]);

  async function claim(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!claimTarget || claimLock.current) return;
    claimLock.current = true;
    const requestAuthVersion = authVersion.current;
    setSubmitting(true);
    setMessage("");
    const form = new FormData(event.currentTarget);
    try {
      const reward = await api.claimReward(claimTarget, {
        recipient_name: String(form.get("recipientName")),
        phone_number: String(form.get("phoneNumber")),
        address: String(form.get("address")),
      });
      if (requestAuthVersion !== authVersion.current) return;
      setRewards((items) => [...items.filter((item) => item.milestone !== reward.milestone), reward]);
      setClaimTarget(null);
      setMessage("실물 배지 배송 신청이 접수되었습니다. 아래에서 진행 상태를 확인해 주세요.");
    } catch (error) {
      if (requestAuthVersion !== authVersion.current) return;
      setMessage(error instanceof ApiError && error.status === 409 ? "이미 배송을 신청했거나 신청 조건을 충족하지 않습니다. 새로고침하여 최신 상태를 확인해 주세요." : "배송 신청을 처리하지 못했습니다. 입력 내용을 확인하고 다시 시도해 주세요.");
    } finally {
      if (requestAuthVersion === authVersion.current) { claimLock.current = false; setSubmitting(false); }
    }
  }

  if (!authChecked) return <main className="grid min-h-[60vh] place-items-center bg-[#f4f7f5] text-sm text-[#737f78]">배지 정보를 확인하는 중…</main>;
  if (!authenticated) return <main className="grid min-h-[65vh] place-items-center bg-[#f4f7f5] px-4"><div className="max-w-md rounded-[24px] border border-[#dce5df] bg-white p-8 text-center"><AppIcon name="lock" className="mx-auto size-10 text-[#008343]" /><h1 className="mt-5 text-2xl font-bold">로그인이 필요합니다</h1><p className="mt-2 text-sm leading-6 text-[#737f78]">로그인하면 내 배지 화면을 확인할 수 있어요.</p><Link href={loginHref("/badges/")} className="mt-6 flex h-12 items-center justify-center rounded-xl bg-[#008343] font-bold text-white">로그인하기</Link></div></main>;

  const earnedIds = earnedBadgeCatalogIds(badges);
  const rewardByThreshold = new Map(rewards.map((reward) => [reward.milestone === "badge_6" ? 6 : 12, reward]));

  return (
    <div className="min-h-screen bg-[#f4f7f5] text-[#172033]">
      <main className="mx-auto max-w-[1180px] px-5 pb-20 pt-12 sm:px-8 sm:pt-16">
        <Link href="/mypage" className="inline-flex items-center gap-2 text-sm font-medium text-[#66726b] hover:text-[#007a3d]"><AppIcon name="chevronLeft" className="size-5" />뒤로가기</Link>
        <header className="mt-10"><h1 className="text-4xl font-bold tracking-[-0.04em]">나의 배지</h1><p className="mt-3 text-[#737f78]">획득한 배지 {earnedIds.size}개 / 전체 {BADGE_CATALOG.length}개 · 스포츠 도전의 기록을 모아 보세요.</p></header>
        {message && <p role="status" className="mt-5 rounded-xl bg-white p-4 text-sm text-[#4f5f56]">{message}</p>}

        <section className="mt-10 rounded-[24px] border border-[#dce5df] bg-white p-6 shadow-sm sm:p-8">
          <p className="text-xs font-bold tracking-[0.16em] text-[#008343]">MY BADGE COLLECTION</p><h2 className="mt-2 text-2xl font-bold">디지털 배지 · 실물 배지 세트</h2><p className="mt-3 text-sm leading-6 text-[#737f78]">미션의 사진 인증이 승인되고 배지 조건을 달성하면 디지털 배지가 기록됩니다. 실물 배지는 조건 충족 후 배송을 신청할 수 있으며, 운영자가 준비·배송 상태를 안내합니다.</p>
          <div className="mt-7 grid gap-4 md:grid-cols-3">{BADGE_REWARD_MILESTONES.map((reward) => {
            const claim = rewardByThreshold.get(reward.threshold);
            return <article key={reward.threshold} className="rounded-2xl border border-[#e1e7e3] bg-[#f8faf9] p-5"><AppIcon name={reward.threshold === 1 ? "award" : "gift"} className="size-8 text-[#008343]" /><p className="mt-5 text-xs font-bold text-[#008343]">배지 {reward.threshold}개 달성 · {reward.fulfillment}</p><h3 className="mt-2 font-bold">{reward.title}</h3><p className="mt-2 text-sm leading-6 text-[#7d8782]">{reward.description}</p><p className="mt-4 text-xs font-bold text-[#536159]">{reward.threshold === 1 ? `${earnedIds.size}개 획득` : claim ? REWARD_STATUS[claim.status] : "미달성"}</p>{claim?.status === "eligible" && <button type="button" disabled={submitting} onClick={() => setClaimTarget(claim.milestone)} className="mt-4 h-11 w-full cursor-pointer rounded-xl bg-[#008343] text-sm font-bold text-white hover:bg-[#006c37] disabled:cursor-wait disabled:opacity-50">실물 배지 배송 신청</button>}</article>;
          })}</div>
          {claimTarget && <form onSubmit={claim} aria-busy={submitting} className="mt-6 grid gap-3 rounded-2xl border border-[#cfe0d5] p-5 sm:grid-cols-2"><h3 className="font-bold sm:col-span-2">실물 배지 {claimTarget === "badge_6" ? "6종" : "12종"} 세트 배송 정보</h3><label className="text-sm font-semibold">받는 분<input name="recipientName" autoComplete="shipping name" required maxLength={100} disabled={submitting} className="mt-2 h-11 w-full rounded-xl border px-3" /></label><label className="text-sm font-semibold">연락처<input name="phoneNumber" type="tel" autoComplete="shipping tel" required minLength={7} maxLength={30} disabled={submitting} className="mt-2 h-11 w-full rounded-xl border px-3" /></label><label className="text-sm font-semibold sm:col-span-2">배송 주소<textarea name="address" autoComplete="shipping street-address" required maxLength={1000} disabled={submitting} placeholder="상세 주소까지 입력해 주세요" className="mt-2 min-h-24 w-full rounded-xl border p-3" /></label><p className="text-xs leading-5 text-[#737f78] sm:col-span-2">입력한 정보는 실물 배지 배송을 처리하기 위해 사용됩니다. 신청 내용을 확인한 후 제출해 주세요.</p><div className="flex gap-2 sm:col-span-2"><button type="submit" disabled={submitting} className="h-11 flex-1 cursor-pointer rounded-xl bg-[#008343] font-bold text-white hover:bg-[#006c37] disabled:cursor-wait disabled:opacity-50">{submitting ? "신청 중…" : "배송 신청하기"}</button><button type="button" disabled={submitting} onClick={() => setClaimTarget(null)} className="h-11 cursor-pointer rounded-xl border px-5 font-bold disabled:cursor-wait">취소</button></div></form>}
        </section>

        <section className="mt-12"><h2 className="text-2xl font-bold">전체 배지 조건</h2><div className="mt-7 grid grid-cols-2 gap-4 md:grid-cols-4 md:gap-6">{BADGE_CATALOG.map((badge) => { const earned = earnedIds.has(badge.id); return <article key={badge.id} className={`flex min-h-[210px] flex-col items-center justify-center rounded-[20px] border px-4 py-6 text-center ${earned ? "border-[#57aa78] bg-[#eef9f2]" : "border-[#d6e1da] bg-white"}`}><span className={`flex size-20 items-center justify-center rounded-full ${earned ? "bg-[#008343] text-white" : "bg-[#e8f3ec] text-[#008343]"}`}><AppIcon name={earned ? "checkCircle" : badge.icon} className="size-9" /></span><h3 className="mt-5 font-bold">{badge.name}</h3><p className="mt-2 text-sm leading-5 text-[#929b96]">{earned ? "획득 완료" : badge.description}</p>{!earned && badge.missionAvailable === false && <span className="mt-3 rounded-full bg-[#f3efe3] px-3 py-1 text-xs font-semibold text-[#78653b]">연계 미션 준비 중</span>}</article>; })}</div></section>
      </main>
    </div>
  );
}
