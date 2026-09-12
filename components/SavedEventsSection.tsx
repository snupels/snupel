"use client";

import Image from "next/image";
import Link from "next/link";
import { useCallback, useEffect, useRef, useState } from "react";
import type { SavedActivityResponse } from "@/lib/api/dto";
import { api } from "@/lib/api/service";
import { loginHref } from "@/lib/auth-flow";
import { isSavedEvent, savedEventHref, savedEventPeriod } from "@/lib/savedEvents";
import { AppIcon } from "./AppIcon";
import { googleCalendarHref } from "@/lib/eventCalendar";

export function SavedEventsSection({ compact = false }: { compact?: boolean }) {
  const [session, setSession] = useState<{ authenticated: boolean; version: number } | null>(null);
  useEffect(() => {
    const update = () => setSession(previous => ({ authenticated: api.hasToken(), version: (previous?.version ?? 0) + 1 }));
    const timer = window.setTimeout(update, 0);
    window.addEventListener("sportspassport-auth-change", update);
    window.addEventListener("sportspassport-saved-change", update);
    return () => {
      window.clearTimeout(timer);
      window.removeEventListener("sportspassport-auth-change", update);
      window.removeEventListener("sportspassport-saved-change", update);
    };
  }, []);

  return <section aria-label="행사 저장" className={compact ? "rounded-[24px] border border-[#e0e7e2] bg-white p-6" : "mt-8"}>
    {compact && <div className="flex items-center justify-between gap-3"><h2 className="text-xl font-bold">행사 저장</h2><Link href="/saved-events/" className="shrink-0 rounded-lg px-2 py-2 text-sm font-bold text-[#008f45] hover:bg-[#e7f4ec]">전체보기</Link></div>}
    {!session ? <p role="status" className="py-6 text-center text-sm text-[#637069]">저장한 행사를 불러오는 중…</p>
      : !session.authenticated ? <div className="rounded-2xl border border-[#dce5df] bg-white p-6 text-center"><p className="text-sm text-[#637069]">로그인하면 저장한 행사와 축제를 확인할 수 있어요.</p><Link href={loginHref("/saved-events/")} className="mt-4 inline-flex rounded-xl bg-[#008f45] px-5 py-3 text-sm font-bold text-white">로그인하기</Link></div>
        : <SavedEventResults key={`${session.version}:${compact}`} compact={compact} />}
  </section>;
}

function SavedEventResults({ compact }: { compact: boolean }) {
  const [items, setItems] = useState<SavedActivityResponse[]>([]);
  const [page, setPage] = useState(0);
  const [hasMore, setHasMore] = useState(false);
  const [loading, setLoading] = useState(true);
  const [requiresLogin, setRequiresLogin] = useState(false);
  const [error, setError] = useState<{ page: number; message: string } | null>(null);
  const version = useRef(0);
  const lock = useRef(false);
  const size = compact ? 3 : 20;

  const loadPage = useCallback(async (nextPage: number) => {
    if (lock.current) return;
    lock.current = true;
    const requestedVersion = ++version.current;
    setLoading(true); setError(null);
    try {
      const rows = await api.savedEvents.list(nextPage, size);
      if (version.current !== requestedVersion) return;
      const events = rows.filter(isSavedEvent);
      setItems(previous => nextPage === 1 ? events : [...new Map([...previous, ...events].map(item => [item.id, item])).values()]);
      setPage(nextPage); setHasMore(rows.length === size);
    } catch (reason) {
      if (version.current !== requestedVersion) return;
      const status = typeof reason === "object" && reason && "status" in reason ? Number(reason.status) : 0;
      if (status === 401) { setItems([]); setRequiresLogin(true); }
      else setError({ page: nextPage, message: "저장한 행사를 불러오지 못했습니다." });
    } finally {
      if (version.current === requestedVersion) { lock.current = false; setLoading(false); }
    }
  }, [size]);

  useEffect(() => {
    const timer = window.setTimeout(() => { void loadPage(1); }, 0);
    return () => { window.clearTimeout(timer); version.current += 1; lock.current = false; };
  }, [loadPage]);

  if (requiresLogin) return <div className="py-6 text-center"><p className="text-sm text-[#637069]">로그인이 만료되었습니다.</p><Link href={loginHref("/saved-events/")} className="mt-3 inline-block text-sm font-bold text-[#008f45]">다시 로그인하기</Link></div>;
  return <>
    {error && <div role="alert" className="mt-4 rounded-xl bg-[#fff0ed] p-4 text-sm text-[#a03d32]">{error.message}<button type="button" onClick={() => void loadPage(error.page)} className="ml-3 cursor-pointer font-bold underline">다시 불러오기</button></div>}
    <div className={compact ? "mt-4 space-y-3" : "grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"}>
      {items.map(item => <SavedEventCard key={item.id} item={item} compact={compact} />)}
    </div>
    {loading && <p role="status" className="py-6 text-center text-sm text-[#637069]">저장한 행사를 불러오는 중…</p>}
    {!loading && !error && !items.length && <div className="rounded-2xl bg-white p-6 text-center"><p className="text-sm text-[#637069]">아직 저장한 행사가 없습니다.</p><Link href="/events/" className="mt-4 inline-block text-sm font-bold text-[#008f45]">이벤트·축제 둘러보기</Link></div>}
    {!compact && !loading && !error && hasMore && <button type="button" onClick={() => void loadPage(page + 1)} className="mx-auto mt-7 block cursor-pointer rounded-xl border border-[#9dcdb0] bg-white px-7 py-3 text-sm font-bold text-[#008f45]">저장한 행사 더 보기</button>}
  </>;
}

export function SavedEventCard({ item, compact = false }: { item: SavedActivityResponse; compact?: boolean }) {
  const title = item.activity.placeName || "저장한 행사";
  const calendarHref = googleCalendarHref(item.activity);
  return <article className={`overflow-hidden rounded-2xl border border-[#dce5df] ${compact ? "bg-[#f6f8f7]" : "bg-white"}`}><Link href={savedEventHref(item)} className={`group block transition hover:bg-[#f1f7f3] focus-visible:outline-2 focus-visible:outline-[#008f45] ${compact ? "p-4" : ""}`}>
    {!compact && <div className="relative aspect-[4/3] bg-[#edf2ee]">{item.activity.representativeImageUrl ? <Image src={item.activity.representativeImageUrl} alt={`${title} 행사 이미지`} fill sizes="(max-width: 640px) 100vw, (max-width: 1280px) 50vw, 25vw" className="object-contain" unoptimized /> : <span className="flex h-full items-center justify-center text-[#90a097]"><AppIcon name="calendar" className="size-10" /></span>}</div>}
    <div className={compact ? "" : "p-5"}>
      <span className="text-xs font-bold text-[#008f45]">행사 저장</span>
      <h3 className="mt-2 line-clamp-2 text-sm font-bold">{title}</h3>
      <p className="mt-2 text-xs leading-5 text-[#637069]">{savedEventPeriod(item)}</p>
      {item.activity.sigun && <p className="mt-1 text-xs text-[#637069]">{item.activity.sigun}</p>}
      <p className="mt-2 text-xs text-[#8a9490]">저장일 {item.createdAt.slice(0, 10).replaceAll("-", ".")}</p>
      {!compact && <span className="mt-4 inline-flex items-center gap-1 text-xs font-bold text-[#008f45]">행사 자세히 보기<AppIcon name="arrowRight" className="size-4" /></span>}
    </div>
  </Link>{!compact && <div className="px-5 pb-5">{calendarHref ? <a href={calendarHref} target="_blank" rel="noopener noreferrer" className="flex min-h-11 items-center justify-center gap-2 rounded-xl border border-[#008f45] px-2 py-2 text-xs font-bold text-[#008f45] hover:bg-[#e8f5ed] focus-visible:outline-2 focus-visible:outline-[#008f45]"><AppIcon name="calendar" />Google 캘린더에 추가</a> : <p className="text-xs text-[#68756d]">일정 확인 후 캘린더에 추가할 수 있어요.</p>}</div>}</article>;
}
