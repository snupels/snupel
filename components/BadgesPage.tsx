"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { api } from "@/lib/api/service";
import { BADGE_REWARD_MILESTONES } from "@/lib/badgeRewards";
import { BADGE_CATALOG, DEFAULT_COLLECTED_BADGE_IDS } from "@/lib/badgeCatalog";
import { AppIcon } from "./AppIcon";

export function BadgesPage() {
  const [collectedBadgeIds, setCollectedBadgeIds] = useState(DEFAULT_COLLECTED_BADGE_IDS);

  useEffect(() => {
    if (!api.hasToken()) return;
    api.collectedBadges
      .list()
      .then((badges) => setCollectedBadgeIds(badges.map((badge) => badge.badgeId)))
      .catch(() => undefined);
  }, []);

  const collectedBadges = collectedBadgeIds
    .map((id) => BADGE_CATALOG.find((badge) => badge.id === id))
    .filter((badge) => badge !== undefined);
  const uncollectedBadges = BADGE_CATALOG.filter((badge) => !collectedBadgeIds.includes(badge.id));

  return (
    <div className="min-h-screen bg-[#f4f7f5] text-[#172033]">
      <main className="mx-auto max-w-[1180px] px-5 pb-20 pt-12 sm:px-8 sm:pt-16">
        <Link href="/mypage" className="inline-flex items-center gap-2 text-sm font-medium text-[#66726b] transition-colors hover:text-[#007a3d]">
          <AppIcon name="chevronLeft" className="size-5" />
          뒤로가기
        </Link>

        <header className="mt-10">
          <h1 className="text-4xl font-bold tracking-[-0.04em]">나의 배지</h1>
          <p className="mt-3 text-[#737f78]">
            획득한 배지 <strong className="text-[#007a3d]">{collectedBadges.length}개</strong>
            <span className="mx-2 text-[#b4bcb7]">·</span>
            전체 배지 <strong className="text-[#172033]">{BADGE_CATALOG.length}개</strong>
          </p>
        </header>

        <section className="mt-10 rounded-[24px] border border-[#dce5df] bg-white p-6 shadow-[0_8px_24px_rgba(23,32,51,0.06)] sm:p-8">
          <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-end">
            <div>
              <p className="text-xs font-bold tracking-[0.16em] text-[#008343]">BADGE REWARDS</p>
              <h2 className="mt-2 text-2xl font-bold">배지 달성 리워드</h2>
            </div>
            <p className="text-sm text-[#737f78]">현재 {collectedBadges.length} / {BADGE_CATALOG.length}개 달성</p>
          </div>
          <div className="mt-7 grid gap-4 md:grid-cols-3">
            {BADGE_REWARD_MILESTONES.map((reward) => {
              const achieved = collectedBadges.length >= reward.threshold;
              const remaining = Math.max(0, reward.threshold - collectedBadges.length);

              return (
                <article key={reward.threshold} className={`rounded-2xl border p-5 ${achieved ? "border-[#8fcaa7] bg-[#edf8f1]" : "border-[#e1e7e3] bg-[#f8faf9]"}`}>
                  <div className="flex items-center justify-between gap-3">
                    <span className={`flex size-10 items-center justify-center rounded-full ${achieved ? "bg-[#008343] text-white" : "bg-[#e7ece9] text-[#8e9993]"}`}>
                      <AppIcon name={reward.threshold === 1 ? "award" : "gift"} className="size-5" />
                    </span>
                    <span className={`text-xs font-bold ${achieved ? "text-[#008343]" : "text-[#8b9590]"}`}>
                      {achieved ? "달성 완료" : `${remaining}개 남음`}
                    </span>
                  </div>
                  <p className="mt-5 text-xs font-bold text-[#008343]">배지 {reward.threshold}개 달성 · {reward.fulfillment}</p>
                  <h3 className="mt-2 font-bold">{reward.title}</h3>
                  <p className="mt-2 text-sm leading-6 text-[#7d8782]">{reward.description}</p>
                </article>
              );
            })}
          </div>
        </section>

        <section className="mt-12">
          <h2 className="flex items-center gap-3 text-2xl font-bold">
            <span className="h-7 w-2 rounded-full bg-[#00934a]" />
            획득한 배지
          </h2>
          <div className="mt-7 grid grid-cols-2 gap-4 md:grid-cols-4 md:gap-6">
            {collectedBadges.map((badge) => (
              <article key={badge.id} className="flex min-h-[210px] flex-col items-center justify-center rounded-[20px] border border-[#d6e1da] bg-white px-4 py-6 text-center shadow-[0_3px_10px_rgba(23,32,51,0.08)]">
                <span className="flex size-20 items-center justify-center rounded-full bg-[#008343] text-white shadow-[0_5px_12px_rgba(0,131,67,0.2)]">
                  <AppIcon name={badge.icon} className="size-9" />
                </span>
                <h3 className="mt-5 font-bold">{badge.name}</h3>
                <p className="mt-2 text-sm leading-5 text-[#929b96]">{badge.description}</p>
              </article>
            ))}
          </div>
        </section>

        <section className="mt-14">
          <h2 className="flex items-center gap-3 text-2xl font-bold">
            <span className="h-7 w-2 rounded-full bg-[#d5dce0]" />
            미획득 배지
          </h2>
          <div className="mt-7 grid grid-cols-2 gap-4 md:grid-cols-4 md:gap-6">
            {uncollectedBadges.map((badge) => (
              <article key={badge.id} className="flex min-h-[210px] flex-col items-center justify-center rounded-[20px] border border-white/80 bg-white/45 px-4 py-6 text-center opacity-55">
                <span className="flex size-20 items-center justify-center rounded-full bg-[#e8ecea] text-[#b7c0bb]">
                  <AppIcon name={badge.icon} className="size-9" />
                </span>
                <h3 className="mt-5 font-bold text-[#69736e]">{badge.name}</h3>
                <p className="mt-2 text-sm leading-5 text-[#a0a9a4]">{badge.description}</p>
              </article>
            ))}
          </div>
        </section>
      </main>
    </div>
  );
}
