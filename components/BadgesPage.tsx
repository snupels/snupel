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

  const collectedCount = BADGE_CATALOG.filter((badge) => collectedBadgeIds.includes(badge.id)).length;
  const progress = Math.round((collectedCount / BADGE_CATALOG.length) * 100);

  return (
    <div className="min-h-screen bg-[#f3f7f4] text-[#172033]">
      <section className="bg-[linear-gradient(135deg,#063f2c_0%,#007a3d_55%,#13a35b_100%)] px-4 py-14 text-white sm:px-6 sm:py-20">
        <div className="mx-auto max-w-[1180px]">
          <Link href="/mypage" className="inline-flex items-center gap-2 text-sm font-semibold text-white/75 transition-colors hover:text-white">
            <AppIcon name="chevronLeft" className="size-4" />
            마이페이지로 돌아가기
          </Link>
          <div className="mt-8 grid gap-8 lg:grid-cols-[1fr_320px] lg:items-end">
            <div>
              <span className="inline-flex rounded-full bg-white/15 px-3 py-1 text-xs font-bold tracking-[0.12em]">BADGE COLLECTION</span>
              <h1 className="mt-5 text-4xl font-bold tracking-[-0.04em] sm:text-5xl">강원 스포츠 배지</h1>
              <p className="mt-4 max-w-2xl leading-7 text-white/75">스포츠 코스와 미션을 완료하며 획득할 수 있는 12개의 배지를 확인해보세요.</p>
            </div>
            <div className="rounded-2xl border border-white/15 bg-white/10 p-5 backdrop-blur">
              <div className="flex items-end justify-between">
                <p className="text-sm text-white/70">나의 수집 현황</p>
                <p className="text-2xl font-bold"><span className="text-[#ffd044]">{collectedCount}</span> / {BADGE_CATALOG.length}</p>
              </div>
              <div className="mt-4 h-2 overflow-hidden rounded-full bg-white/15">
                <div className="h-full rounded-full bg-[#ffd044] transition-[width]" style={{ width: `${progress}%` }} />
              </div>
              <p className="mt-3 text-right text-xs text-white/60">{progress}% 완료</p>
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-[1180px] px-4 py-12 sm:px-6 sm:py-16">
        <div>
          <h2 className="text-2xl font-bold">전체 배지</h2>
          <p className="mt-2 text-sm text-[#6f7a87]">각 배지의 획득 조건을 확인하고 새로운 도전을 시작해보세요.</p>
        </div>

        <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {BADGE_CATALOG.map((badge) => {
            const collected = collectedBadgeIds.includes(badge.id);
            return (
              <article
                key={badge.id}
                className={`relative overflow-hidden rounded-[22px] border p-6 transition-transform hover:-translate-y-0.5 ${
                  collected
                    ? "border-[#a7d9b9] bg-white shadow-[0_8px_24px_rgba(0,122,61,0.08)]"
                    : "border-[#dfe5e1] bg-white/70"
                }`}
              >
                <span className="absolute right-5 top-5 text-xs font-bold text-[#a0aaa4]">{String(badge.id).padStart(2, "0")}</span>
                <div className={`flex size-16 items-center justify-center rounded-full ${
                  collected ? "bg-[#008f45] text-white shadow-[0_6px_16px_rgba(0,143,69,0.24)]" : "bg-[#edf1ee] text-[#8e9992]"
                }`}>
                  <AppIcon name={badge.icon} className="size-7" />
                </div>
                <div className="mt-5">
                  <div className="flex flex-wrap items-center gap-2">
                    <h3 className="text-lg font-bold">{badge.name}</h3>
                    <span className={`rounded-full px-2.5 py-1 text-[11px] font-bold ${
                      collected ? "bg-[#e7f5ec] text-[#007a3d]" : "bg-[#f0f2f1] text-[#7b8580]"
                    }`}>
                      {collected ? "획득 완료" : "미획득"}
                    </span>
                  </div>
                  <p className="mt-3 text-sm leading-6 text-[#66726b]">{badge.description}</p>
                </div>
              </article>
            );
          })}
        </div>
      </section>
    </div>
  );
}
