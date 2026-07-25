"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { api } from "@/lib/api/service";
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
