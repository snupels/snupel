"use client";

import Image, { type StaticImageData } from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { api } from "@/lib/api/service";
import type { AuthUser } from "@/lib/api/dto";
import { BADGE_CATALOG, DEFAULT_COLLECTED_BADGE_IDS } from "@/lib/badgeCatalog";
import { AppIcon, type AppIconName } from "./AppIcon";
import heroImage from "@/imports/LandingPage/a0d5da596bc83d9effc7a18d6702727ac6b06d43.png";
import course1 from "@/imports/LandingPage/205ec17d713405bedcfab3cf69b55f31151a8bf3.png";
import course2 from "@/imports/LandingPage/9509675bc89588078354909012b6022f47332ef9.png";
import course3 from "@/imports/LandingPage/9193ff8f95dcbcb73f018d079496fad4bcfa1dec.png";

const stats: Array<{ label: string; value: string; icon: AppIconName; accent?: boolean }> = [
  { label: "모은 스탬프", value: "7개", icon: "award" },
  { label: "인증한 장소", value: "5곳", icon: "mapPin" },
  { label: "참여한 행사", value: "1개", icon: "calendar", accent: true },
  { label: "받은 리워드", value: "2개", icon: "gift" },
];

const stamps = [
  { title: "설악산 트레일 챌린지", place: "속초 · 고성", date: "2026.05.15", badge: "산악 입문자", complete: true },
  { title: "오대산 선재길 힐링 트레킹", place: "평창", date: "2026.05.08", badge: "트레킹 러버", complete: true },
  { title: "양양 서핑 입문 코스", place: "양양", date: "2026.04.29", badge: "Wave Rider", complete: true },
  { title: "평창 MTB 익스트림", place: "평창", date: "", badge: "Challenge Starter", complete: false },
  { title: "강릉 해변 러닝 코스", place: "강릉", date: "", badge: "러닝 스타터", complete: false },
];

const badgePreviewIds = [2, 10, 5, 4, 1, 7];

const activities: Array<{ date: string; text: string; href: string; icon: AppIconName; yellow?: boolean }> = [
  { date: "2026.05.15", text: "설악산 트레일 챌린지 인증 완료", href: "/activity-feed/detail?title=설악산+트레일+챌린지&place=속초+·+고성&date=2026.05.15&status=인증+완료", icon: "checkCircle" },
  { date: "2026.05.10", text: "오대산 선재길 스탬프 획득", href: "/activity-feed/detail?id=719&title=오대산+선재길+힐링+트레킹&place=평창&date=2026.05.10&status=스탬프+획득", icon: "award", yellow: true },
  { date: "2026.05.02", text: "평창 MTB 익스트림 저장", href: "/activity-feed/detail?title=평창+MTB+익스트림&place=평창&date=2026.05.02&status=저장", icon: "bookmark" },
  { date: "2026.04.29", text: "양양 서핑 입문 코스 인증 완료", href: "/activity-feed/detail?id=3634&title=양양+서핑+입문+코스&place=양양&date=2026.04.29&status=인증+완료", icon: "checkCircle" },
];

const recommendations: Array<{ title: string; place: string; level: string; time: string; image: StaticImageData }> = [
  { title: "오대산 선재길 힐링 트레킹", place: "평창", level: "쉬움", time: "약 2시간", image: course1 },
  { title: "강릉 해변 러닝 코스", place: "강릉", level: "보통", time: "약 1시간", image: course2 },
  { title: "평창 MTB 익스트림 코스", place: "평창", level: "어려움", time: "약 3시간", image: course3 },
];

const STAMP_BOOK_URL = "https://sportspassport.kr/stampbook/";
const ACTIVITY_HISTORY_URL = "https://sportspassport.kr/activity-feed/";

function openStampBook() {
  window.location.assign(STAMP_BOOK_URL);
}

function openActivityHistory() {
  window.location.assign(ACTIVITY_HISTORY_URL);
}

export function MyPassportPage() {
  const router = useRouter();
  const [liveStats, setLiveStats] = useState(stats);
  const [collectedBadgeIds, setCollectedBadgeIds] = useState(DEFAULT_COLLECTED_BADGE_IDS);
  const [user, setUser] = useState<AuthUser | null>(null);
  const [authChecked, setAuthChecked] = useState(() => !api.hasToken());
  const [stampCount, setStampCount] = useState(0);

  useEffect(() => {
    if (!api.hasToken()) return;
    api.me().then((profile) => {
      if (profile.onboardingRequired) { router.replace("/onboarding"); return; }
      setUser(profile);
      return Promise.allSettled([
      api.passports.list(),
      api.collectedStamps.list(),
      api.collectedBadges.list(),
      api.activities.list(),
      ]).then((results) => {
      const collectedStamps = results[1].status === "fulfilled" ? results[1].value : [];
      const collectedBadges = results[2].status === "fulfilled" ? results[2].value : [];
      const allActivities = results[3].status === "fulfilled" ? results[3].value : [];
      setStampCount(collectedStamps.length);
      setLiveStats([
        { label: "모은 스탬프", value: `${collectedStamps.length}개`, icon: "award" },
        { label: "인증한 장소", value: `${allActivities.filter((item) => item.placeName).length}곳`, icon: "mapPin" },
        { label: "참여한 행사", value: `${allActivities.filter((item) => item.category !== "sports").length}개`, icon: "calendar", accent: true },
        { label: "받은 리워드", value: `${collectedBadges.length}개`, icon: "gift" },
      ]);
      setCollectedBadgeIds(collectedBadges.map((badge) => badge.badgeId));
      });
    }).catch(() => setUser(null)).finally(() => setAuthChecked(true));
  }, [router]);

  if (!authChecked) return <div className="grid min-h-[60vh] place-items-center bg-[#f3f7f4] text-sm text-[#6f7a87]">나의 패스포트를 불러오는 중…</div>;
  if (!user) return <div className="grid min-h-[65vh] place-items-center bg-[#f3f7f4] px-4"><div className="max-w-md rounded-[24px] border border-[#dfe7e1] bg-white p-8 text-center shadow-sm"><span className="mx-auto flex size-14 items-center justify-center rounded-full bg-[#e7f4ec] text-[#008f45]"><AppIcon name="lock" className="size-6" /></span><h1 className="mt-5 text-2xl font-bold">로그인이 필요합니다</h1><p className="mt-2 text-sm leading-6 text-[#6f7a87]">로그인하면 닉네임, 프로필과 수집한 스탬프를 확인할 수 있어요.</p><Link href="/login" className="mt-6 flex h-12 items-center justify-center rounded-xl bg-[#008f45] text-sm font-bold text-white">로그인하기</Link></div></div>;

  const displayName = user.nickname || user.email.split("@")[0];
  const level = stampCount >= 20 ? "Level 6 Legend" : stampCount >= 15 ? "Level 5 Champion" : stampCount >= 7 ? "Level 4 Adventure Pro" : stampCount >= 5 ? "Level 3 Challenger" : stampCount >= 1 ? "Level 2 Explorer" : "Level 1 Beginner";

  const badgePreview = badgePreviewIds
    .map((id) => BADGE_CATALOG.find((badge) => badge.id === id))
    .filter((badge) => badge !== undefined);
  const collectedBadgeCount = BADGE_CATALOG.filter((badge) => collectedBadgeIds.includes(badge.id)).length;

  return (
    <div className="bg-[#f3f7f4] text-[#172033]">
      <section className="relative overflow-hidden px-4 pb-24 pt-12 sm:px-6 lg:px-8">
        <Image src={heroImage} alt="강원 산악 전경" fill priority sizes="100vw" className="object-cover" />
        <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(11,35,28,0.9),rgba(11,35,28,0.6))]" />
        <div className="relative mx-auto grid min-h-[460px] max-w-[1180px] items-center gap-10 py-10 lg:grid-cols-[1fr_440px]">
          <div className="max-w-2xl text-white">
            <span className="inline-flex rounded-full bg-white/15 px-3 py-1 text-xs font-semibold backdrop-blur">MY PASSPORT</span>
            <div className="mt-5 flex items-center gap-4"><span className="flex size-16 shrink-0 items-center justify-center overflow-hidden rounded-full border-2 border-white/60 bg-white/15 text-2xl font-bold" style={user.profileImageUrl ? { backgroundImage: `url(${user.profileImageUrl})`, backgroundPosition: "center", backgroundSize: "cover" } : undefined}>{!user.profileImageUrl && displayName.slice(0, 1).toUpperCase()}</span><h1 className="text-4xl font-bold tracking-[-0.04em] sm:text-5xl">{displayName}님의<br />강원 스포츠 패스포트</h1></div>
            <p className="mt-5 max-w-xl leading-7 text-white/80">강원도에서 방문 인증한 스포츠 코스와 모은 스탬프를 한눈에 확인하세요.</p>
            <p className="mt-3 text-sm text-white/75">배지를 달성하면 디지털 배지가 즉시 지급되며, 배지 6개부터 획득한 실물 배지 세트를 받을 수 있어요.</p>
            <div className="mt-7 flex flex-wrap gap-3"><button type="button" onClick={openStampBook} className="inline-flex h-12 cursor-pointer items-center rounded-xl border border-white/60 px-6 text-sm font-bold text-white transition-colors hover:border-white hover:bg-white/10 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white">내 스탬프북 보기</button><Link href="/account" className="inline-flex h-12 items-center rounded-xl border border-white/60 px-6 text-sm font-bold text-white transition-colors hover:bg-white/10">개인정보 수정</Link></div>
          </div>
          <aside className="rounded-[28px] border border-white/10 bg-[#172c40]/95 p-7 text-white shadow-2xl backdrop-blur sm:p-9">
            <div className="flex items-start justify-between"><div><p className="text-xs font-bold text-[#ffc438]">GANGWON SPORTS PASSPORT</p><h2 className="mt-2 text-2xl font-bold">강원 스포츠 패스포트</h2></div><AppIcon name="award" className="size-7 text-[#ffc438]" /></div>
            <span className="mt-7 inline-flex rounded-xl bg-[#ffc438]/10 px-4 py-2 font-bold text-[#ffc438]">{level}</span>
            <dl className="mt-7 space-y-4 text-sm"><div className="flex justify-between"><dt className="text-white/60">획득 배지</dt><dd className="text-xl font-bold text-[#ffc438]">{collectedBadgeIds.length}개</dd></div><div className="flex justify-between"><dt className="text-white/60">실물 배지 6종까지</dt><dd className="text-xl font-bold">{Math.max(0, 6 - collectedBadgeIds.length)}개</dd></div></dl>
            <div className="mt-6 border-t border-white/10 pt-5"><p className="text-xs text-white/50">최근 인증</p><p className="mt-1 text-sm font-bold">설악산 트레일 챌린지</p></div>
          </aside>
        </div>
      </section>

      <section className="relative z-10 mx-auto -mt-16 grid max-w-[1180px] gap-4 px-4 sm:grid-cols-2 sm:px-6 lg:grid-cols-4">
        {liveStats.map((stat) => <div key={stat.label} className="rounded-2xl border border-[#e0e7e2] bg-white p-6 shadow-lg"><span className={`flex size-11 items-center justify-center rounded-xl ${stat.accent ? "bg-[#fff6dc] text-[#e4a900]" : "bg-[#e7f4ec] text-[#008f45]"}`}><AppIcon name={stat.icon} className="size-5" /></span><p className="mt-5 text-sm text-[#6f7a87]">{stat.label}</p><strong className="mt-1 block text-3xl">{stat.value}</strong></div>)}
      </section>

      <section className="mx-auto grid max-w-[1180px] gap-6 px-4 py-14 sm:px-6 lg:grid-cols-[minmax(0,1.65fr)_minmax(300px,0.85fr)]">
        <div className="space-y-6">
          <section id="stamp-book" className="rounded-[24px] border border-[#e0e7e2] bg-white p-6 sm:p-8">
            <div className="flex items-end justify-between gap-4"><div><h2 className="text-2xl font-bold">나의 강원 스탬프북</h2><p className="mt-2 text-sm text-[#6f7a87]">방문 인증을 완료한 강원 스포츠 코스의 스탬프를 확인할 수 있어요.</p></div><button type="button" onClick={openStampBook} className="inline-flex cursor-pointer shrink-0 items-center gap-1 rounded-lg px-2 py-1 text-sm font-bold text-[#008f45] transition-colors hover:bg-[#e7f4ec] hover:text-[#006d35] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#008f45]">전체보기<AppIcon name="arrowRight" className="size-4" /></button></div>
            <div className="mt-7 space-y-3">{stamps.map((stamp) => <article key={stamp.title} className={`flex flex-col gap-4 rounded-2xl border p-5 sm:flex-row sm:items-center ${stamp.complete ? "border-[#33a568] bg-[#eef9f2]" : "border-[#dde4df] bg-white"}`}><span className={`flex size-12 shrink-0 items-center justify-center rounded-full ${stamp.complete ? "bg-[#008f45] text-white" : "border border-dashed border-[#bac4cd] bg-[#f7f9f8] text-[#9aa6b2]"}`}><AppIcon name={stamp.complete ? "checkCircle" : "mapPin"} className="size-6" /></span><div className="min-w-0 flex-1"><h3 className="font-bold">{stamp.title}</h3><p className="mt-1 text-sm text-[#6f7a87]"><AppIcon name="mapPin" /> {stamp.place}{stamp.date && ` · ${stamp.date}`}</p><p className="mt-2 text-xs text-[#7c8781]">획득 배지: <span className="font-semibold text-[#d99f00]">{stamp.badge}</span></p></div><span className={`w-fit rounded-full px-3 py-1 text-xs font-semibold ${stamp.complete ? "bg-[#008f45] text-white" : "border border-[#dfe5e1] text-[#59665f]"}`}>{stamp.complete ? "인증 완료" : "방문 인증 가능"}</span></article>)}</div>
          </section>

          <section className="rounded-[24px] border border-[#e0e7e2] bg-white p-6 sm:p-8">
            <h2 className="text-2xl font-bold">지금 인증하러 가기 좋은 코스</h2><p className="mt-2 text-sm text-[#6f7a87]">새로운 스탬프를 모을 수 있는 추천 코스를 확인해보세요.</p>
            <div className="mt-7 grid gap-5 sm:grid-cols-3">{recommendations.map((course) => <article key={course.title} className="overflow-hidden rounded-2xl border border-[#e0e7e2]"><div className="relative aspect-[4/3]"><Image src={course.image} alt="" fill sizes="(max-width: 640px) 100vw, 33vw" className="object-cover" /><span className="absolute right-3 top-3 rounded-full bg-[#ffc438] px-3 py-1 text-xs font-bold">스탬프 획득 가능</span></div><div className="p-4"><h3 className="min-h-12 font-bold leading-6">{course.title}</h3><p className="mt-3 text-sm text-[#6f7a87]"><AppIcon name="mapPin" /> {course.place}</p><div className="mt-3 flex gap-2 text-xs"><span className="rounded-full bg-[#e9f6ee] px-2.5 py-1 text-[#008f45]">{course.level}</span><span className="rounded-full bg-[#f2f4f3] px-2.5 py-1 text-[#6f7a87]">{course.time}</span></div><Link href="/courses" className="mt-4 inline-flex h-10 w-full items-center justify-center gap-2 rounded-xl bg-[#008f45] text-sm font-bold text-white">코스 보기<AppIcon name="arrowRight" /></Link></div></article>)}</div>
          </section>
        </div>

        <aside className="space-y-6">
          <section className="rounded-[24px] border border-[#e0e7e2] bg-white p-6"><h2 className="text-xl font-bold">나의 배지</h2><div className="mt-6 grid grid-cols-3 gap-5">{badgePreview.map((badge) => { const unlocked = collectedBadgeIds.includes(badge.id); return <div key={badge.name} className={`text-center ${unlocked ? "" : "opacity-30"}`}><span className={`mx-auto flex size-14 items-center justify-center rounded-full ${unlocked ? "bg-[#008f45] text-white shadow-md" : "bg-[#eef1ef] text-[#9aa39e]"}`}><AppIcon name={badge.icon} className="size-6" /></span><p className="mt-2 text-xs font-semibold leading-5">{badge.name}</p></div>; })}</div><p className="mt-6 border-t border-[#edf0ee] pt-5 text-center text-sm text-[#6f7a87]">획득한 배지 <strong className="text-[#008f45]">{collectedBadgeCount}개</strong> · 전체 배지 {BADGE_CATALOG.length}개</p><Link href="/badges" className="mt-4 flex h-10 w-full items-center justify-center rounded-xl border border-[#aad2b8] text-sm font-bold text-[#008f45] transition-colors hover:bg-[#f0f8f3]">전체 배지 보기 ({BADGE_CATALOG.length}개)</Link></section>
          <section className="rounded-[24px] border border-[#e0e7e2] bg-white p-6"><h2 className="text-xl font-bold">최근 방문 인증</h2><div className="mt-4 space-y-1">{activities.map((activity) => <a key={activity.date + activity.text} href={activity.href} className="group flex cursor-pointer gap-3 rounded-xl px-2 py-3 transition hover:bg-[#f0f8f3] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#008f45]"><span className={`flex size-9 shrink-0 items-center justify-center rounded-full ${activity.yellow ? "bg-[#fff5d9] text-[#d99f00]" : "bg-[#e7f4ec] text-[#008f45]"}`}><AppIcon name={activity.icon} className="size-4" /></span><div className="min-w-0 flex-1"><p className="text-xs text-[#8a9490]">{activity.date}</p><p className="mt-1 text-sm font-semibold leading-5 transition group-hover:text-[#008f45]">{activity.text}</p></div><AppIcon name="arrowRight" className="mt-3 size-4 shrink-0 text-[#9aa49e] transition group-hover:translate-x-0.5 group-hover:text-[#008f45]" /></a>)}</div><button type="button" onClick={openActivityHistory} className="mt-6 h-10 w-full cursor-pointer border-t border-[#edf0ee] pt-4 text-sm font-bold text-[#008f45] transition-colors hover:text-[#006d35] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#008f45]">전체 활동 보기</button></section>
        </aside>
      </section>
    </div>
  );
}
