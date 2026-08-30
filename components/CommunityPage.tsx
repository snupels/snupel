"use client";

import Image from "next/image";
import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { type CommunityFeedResponse } from "@/lib/api/dto";
import { api } from "@/lib/api/service";
import { AppIcon } from "./AppIcon";

type FeedTab = "all" | "mine";

function initials(name: string) {
  return name.trim().slice(0, 2).toUpperCase() || "강원";
}

function displayDate(value: string) {
  return new Intl.DateTimeFormat("ko-KR", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(new Date(value));
}

function tags(post: CommunityFeedResponse) {
  return [post.sportName, post.sigun].filter((tag): tag is string => Boolean(tag));
}

export function CommunityPage() {
  const [tab, setTab] = useState<FeedTab>("all");
  const [posts, setPosts] = useState<CommunityFeedResponse[]>([]);
  const [likedPostIds, setLikedPostIds] = useState<number[]>([]);
  const [savedPostIds, setSavedPostIds] = useState<number[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [user] = useState<{ id: number; email: string } | null>(
    () => api.currentUser() ?? null,
  );

  const loadFeed = useCallback(async (nextTab: FeedTab) => {
    setLoading(true);
    setError("");
    try {
      const result = nextTab === "mine"
        ? await api.communityFeed.mine(1, 100)
        : await api.communityFeed.list(1, 100);
      setPosts(result);
    } catch {
      setPosts([]);
      setError("피드를 불러오지 못했습니다. 잠시 후 다시 시도해 주세요.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const timer = window.setTimeout(() => void loadFeed("all"), 0);
    return () => window.clearTimeout(timer);
  }, [loadFeed]);

  function selectTab(nextTab: FeedTab) {
    setTab(nextTab);
    if (nextTab === "mine" && !user) {
      setPosts([]);
      setLoading(false);
      setError("");
      return;
    }
    void loadFeed(nextTab);
  }

  function toggleId(id: number, values: number[], setter: (value: number[]) => void) {
    setter(values.includes(id) ? values.filter((value) => value !== id) : [...values, id]);
  }

  async function hideFromFeed(id: number) {
    try {
      await api.stampSubmissions.updateFeedVisibility(id, {
        share_to_feed: false,
        feed_caption: null,
      });
      setPosts((current) => current.filter((post) => post.id !== id));
    } catch {
      setError("피드 공개 설정을 변경하지 못했습니다.");
    }
  }

  return (
    <main className="min-h-screen bg-[#f4f7f5] pb-20 text-[#172033]">
      <section className="border-b border-[#dfe8e2] bg-white px-4 py-10 sm:px-6">
        <div className="mx-auto flex max-w-[1120px] flex-col gap-7 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-sm font-bold text-[#008f45]">GANGWON SPORTS COMMUNITY</p>
            <h1 className="mt-2 text-3xl font-bold tracking-[-0.04em] sm:text-4xl">강원 스포츠 피드</h1>
            <p className="mt-3 max-w-xl text-sm leading-6 text-[#66736c]">
              미션 인증을 완료하고 승인을 받은 스포츠 순간을 다른 이용자와 나눠보세요.
            </p>
          </div>
          <Link href="/missions" className="inline-flex h-12 cursor-pointer items-center justify-center gap-2 rounded-xl bg-[#008f45] px-6 text-sm font-bold text-white shadow-sm transition hover:bg-[#00753a] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#008f45]">
            <AppIcon name="checkCircle" className="size-5" />미션 인증하러 가기
          </Link>
        </div>
      </section>

      <div className="mx-auto max-w-[1120px] px-4 pt-8 sm:px-6">
        <section className="flex items-center justify-between gap-4 border-b border-[#dce5df]">
          <div className="flex">
            <button type="button" onClick={() => selectTab("all")} className={`h-12 cursor-pointer border-b-2 px-5 text-sm font-bold transition ${tab === "all" ? "border-[#008f45] text-[#008f45]" : "border-transparent text-[#7a867f] hover:text-[#34423a]"}`}>전체 피드</button>
            <button type="button" onClick={() => selectTab("mine")} className={`h-12 cursor-pointer border-b-2 px-5 text-sm font-bold transition ${tab === "mine" ? "border-[#008f45] text-[#008f45]" : "border-transparent text-[#7a867f] hover:text-[#34423a]"}`}>내 피드</button>
          </div>
          <p className="hidden text-xs text-[#89948e] sm:block">관리자 승인 완료 인증만 공개됩니다</p>
        </section>

        {tab === "mine" && !user ? (
          <section className="mt-8 rounded-[24px] border border-[#dce5df] bg-white px-6 py-16 text-center">
            <span className="mx-auto flex size-14 items-center justify-center rounded-full bg-[#e9f5ed] text-[#008f45]"><AppIcon name="person" className="size-7" /></span>
            <h2 className="mt-5 text-xl font-bold">로그인하고 내 인증 피드를 확인하세요</h2>
            <p className="mt-2 text-sm text-[#748078]">공개에 동의한 승인 완료 인증만 내 피드에 표시됩니다.</p>
            <Link href="/login" className="mt-6 inline-flex h-11 items-center justify-center rounded-xl bg-[#008f45] px-6 text-sm font-bold text-white">로그인하기</Link>
          </section>
        ) : loading ? (
          <section className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3" aria-label="피드 불러오는 중">
            {[0, 1, 2].map((item) => <div key={item} className="aspect-[4/5] animate-pulse rounded-[22px] bg-[#e5ece7]" />)}
          </section>
        ) : error ? (
          <section className="mt-8 rounded-[24px] border border-[#efd4d0] bg-white px-6 py-16 text-center">
            <h2 className="text-lg font-bold">{error}</h2>
            <button type="button" onClick={() => void loadFeed(tab)} className="mt-5 h-11 cursor-pointer rounded-xl bg-[#172033] px-6 text-sm font-bold text-white">다시 불러오기</button>
          </section>
        ) : posts.length === 0 ? (
          <section className="mt-8 rounded-[24px] border border-dashed border-[#cbd9d0] bg-white/70 px-6 py-16 text-center">
            <span className="mx-auto flex size-14 items-center justify-center rounded-full bg-[#e9f5ed] text-[#008f45]"><AppIcon name="instagram" className="size-7" /></span>
            <h2 className="mt-5 text-xl font-bold">아직 공개된 인증 사진이 없어요</h2>
            <p className="mt-2 text-sm text-[#748078]">미션 인증 시 피드 공개를 선택하면 승인 후 이곳에 표시됩니다.</p>
            <Link href="/missions" className="mt-6 inline-flex h-11 items-center justify-center rounded-xl bg-[#008f45] px-6 text-sm font-bold text-white">미션 보러 가기</Link>
          </section>
        ) : (
          <section className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {posts.map((post, index) => {
              const liked = likedPostIds.includes(post.id);
              const saved = savedPostIds.includes(post.id);
              const postTags = tags(post);
              return (
                <article key={post.id} className="overflow-hidden rounded-[22px] border border-[#dde6e0] bg-white shadow-[0_4px_16px_rgba(23,58,45,0.07)]">
                  <header className="flex items-center gap-3 px-4 py-3.5">
                    <span className="flex size-9 items-center justify-center rounded-full bg-[#173a2d] text-xs font-bold text-white">{initials(post.authorName)}</span>
                    <div className="min-w-0 flex-1">
                      <h2 className="truncate text-sm font-bold">{post.authorName}</h2>
                      <p className="mt-0.5 truncate text-[11px] text-[#7a867f]"><AppIcon name="mapPin" /> {post.placeName ?? post.sigun ?? "강원특별자치도"}</p>
                    </div>
                    <time className="text-[11px] text-[#9aa39e]">{displayDate(post.approvedAt)}</time>
                  </header>
                  <div className="relative aspect-square overflow-hidden bg-[#e7ece8]">
                    {post.proofUrl ? <Image src={post.proofUrl} alt={`${post.placeName ?? "강원 스포츠"} 인증 사진`} fill preload={index === 0} sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw" className="object-cover" /> : <div className="flex h-full items-center justify-center text-[#819087]"><AppIcon name="instagram" className="size-10" /></div>}
                  </div>
                  <div className="p-4">
                    <div className="flex items-center gap-2">
                      <button type="button" aria-label={liked ? "좋아요 취소" : "좋아요"} aria-pressed={liked} onClick={() => toggleId(post.id, likedPostIds, setLikedPostIds)} className={`inline-flex size-9 cursor-pointer items-center justify-center rounded-full transition ${liked ? "bg-[#fff0f0] text-[#e04444]" : "bg-[#f3f6f4] text-[#4f5d55] hover:text-[#e04444]"}`}><AppIcon name="heart" className={`size-5 ${liked ? "fill-current" : ""}`} /></button>
                      <button type="button" aria-label={saved ? "저장 취소" : "저장"} aria-pressed={saved} onClick={() => toggleId(post.id, savedPostIds, setSavedPostIds)} className={`ml-auto inline-flex size-9 cursor-pointer items-center justify-center rounded-full transition ${saved ? "bg-[#e8f4ec] text-[#008f45]" : "bg-[#f3f6f4] text-[#4f5d55] hover:text-[#008f45]"}`}><AppIcon name="bookmark" className={`size-5 ${saved ? "fill-current" : ""}`} /></button>
                    </div>
                    <p className="mt-3 text-sm leading-6"><strong className="mr-2">{post.placeName ?? "강원 스포츠 인증"}</strong>{post.caption ?? "미션 인증을 완료했습니다."}</p>
                    {postTags.length > 0 && <p className="mt-2 text-xs font-semibold text-[#008f45]">{postTags.map((tag) => `#${tag}`).join(" ")}</p>}
                    {tab === "mine" && <button type="button" onClick={() => void hideFromFeed(post.id)} className="mt-4 cursor-pointer text-xs font-semibold text-[#929c96] underline-offset-2 hover:text-[#b43d3d] hover:underline">피드에서 숨기기</button>}
                  </div>
                </article>
              );
            })}
          </section>
        )}
      </div>
    </main>
  );
}
