"use client";

import Image from "next/image";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Suspense, useCallback, useEffect, useRef, useState } from "react";
import { type CommunityFeedResponse, type FeedCommentResponse, type CommunityProfileResponse } from "@/lib/api/dto";
import { api } from "@/lib/api/service";
import { ApiError } from "@/lib/api/repository";
import { loginHref } from "@/lib/auth-flow";
import { AppIcon } from "./AppIcon";
import { ProofGallery } from "./ProofGallery";

type FeedTab = "all" | "mine" | "following" | "liked";

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

function CommunityPageContent() {
  const searchParams = useSearchParams();
  const postId = Number(searchParams.get("post"));
  const viewingPost = searchParams.has("post");
  const profileUserId = Number(searchParams.get("user"));
  const viewingProfile = Number.isInteger(profileUserId) && profileUserId > 0;
  const [tab, setTab] = useState<FeedTab>("all");
  const [posts, setPosts] = useState<CommunityFeedResponse[]>([]);
  const [profiles, setProfiles] = useState<Record<number, CommunityProfileResponse>>({});
  const [busyUsers, setBusyUsers] = useState<number[]>([]);
  const [expandedComments, setExpandedComments] = useState<number[]>([]);
  const [commentPages, setCommentPages] = useState<Record<number, number>>({});
  const [loadingComments, setLoadingComments] = useState<number[]>([]);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const requestId = useRef(0);
  const followLocks = useRef(new Set<number>());
  const postLocks = useRef(new Set<number>());
  const [comments, setComments] = useState<Record<number, FeedCommentResponse[]>>({});
  const [commentDrafts, setCommentDrafts] = useState<Record<number, string>>({});
  const [busyPostIds, setBusyPostIds] = useState<number[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [actionMessage, setActionMessage] = useState("");
  const [user, setUser] = useState<{ id: number; email: string } | null>(
    () => api.hasToken() ? api.currentUser() ?? null : null,
  );
  const loginUrl = loginHref(`/community/?${searchParams.toString()}`);

  useEffect(() => {
    const sync = () => {
      requestId.current++;
      setCommentDrafts({}); setProfiles({}); setActionMessage("");
      setUser(api.hasToken() ? api.currentUser() ?? null : null);
    };
    window.addEventListener("sportspassport-auth-change", sync);
    return () => window.removeEventListener("sportspassport-auth-change", sync);
  }, []);

  const loadFeed = useCallback(async (nextTab: FeedTab, nextPage = 1) => {
    const request = ++requestId.current;
    if (nextPage === 1) setLoading(true); else setLoadingMore(true);
    setError("");
    try {
      const result = viewingPost
        ? [await api.communityFeed.get(postId)]
        : viewingProfile
        ? await api.communityFeed.byUser(profileUserId, nextPage, 20)
        : nextTab === "mine"
        ? await api.communityFeed.mine(nextPage, 20)
        : nextTab === "liked" ? await api.communityFeed.liked(nextPage, 20)
        : nextTab === "following" ? await api.communityFeed.following(nextPage, 20)
        : await api.communityFeed.list(nextPage, 20);
      if (request !== requestId.current) return;
      setPosts(current => nextPage === 1 ? result : [...new Map([...current, ...result].map(post => [post.id, post])).values()]);
      setPage(nextPage); setHasMore(!viewingPost && result.length === 20);
      const ids = [...new Set([...result.map(post => post.authorId), ...(viewingProfile ? [profileUserId] : []), ...(user ? [user.id] : [])])];
      const entries = await Promise.all(ids.map(async id => {
        try { return [id, await api.communityFeed.profile(id)] as const; } catch { return null; }
      }));
      if (request === requestId.current) setProfiles(current => ({ ...current, ...Object.fromEntries(entries.filter(entry => entry !== null)) }));
    } catch (failure) {
      if (request !== requestId.current) return;
      if (nextPage === 1) { setPosts([]); setError(failure instanceof ApiError && failure.status === 404 ? "삭제되었거나 비공개로 변경된 게시글입니다." : "피드를 불러오지 못했습니다. 잠시 후 다시 시도해 주세요."); }
      else setActionMessage("추가 피드를 불러오지 못했습니다. 다시 시도해 주세요.");
    } finally {
      if (request === requestId.current) { setLoading(false); setLoadingMore(false); }
    }
  }, [profileUserId, viewingProfile, viewingPost, postId, user]);

  useEffect(() => {
    const timer = window.setTimeout(() => { setTab("all"); void loadFeed("all"); }, 0);
    return () => { window.clearTimeout(timer); requestId.current++; };
  }, [loadFeed]);

  function selectTab(nextTab: FeedTab) {
    setTab(nextTab);
    if (nextTab !== "all" && !user) {
      requestId.current++;
      setPosts([]);
      setLoading(false);
      setError("");
      return;
    }
    void loadFeed(nextTab);
  }

  async function toggleFollow(id: number) {
    if (!user) { setActionMessage("팔로우하려면 먼저 로그인해 주세요."); return; }
    if (!profiles[id] || followLocks.current.has(id) || id === user.id) return;
    followLocks.current.add(id); setBusyUsers(current => [...current, id]);
    try {
      const updated = profiles[id].followedByMe ? await api.communityFeed.unfollow(id) : await api.communityFeed.follow(id);
      setProfiles(current => ({ ...current, [id]: updated }));
      const ownProfile = await api.communityFeed.profile(user.id).catch(() => null);
      if (ownProfile) setProfiles(current => ({ ...current, [user.id]: ownProfile }));
      if (tab === "following" && !updated.followedByMe) setPosts(current => current.filter(post => post.authorId !== id));
    } catch { setActionMessage("팔로우 상태를 변경하지 못했습니다. 다시 시도해 주세요."); }
    finally { followLocks.current.delete(id); setBusyUsers(current => current.filter(value => value !== id)); }
  }

  async function loadComments(id: number, more = false) {
    if (loadingComments.includes(id)) return;
    setExpandedComments(current => [...new Set([...current, id])]);
    setLoadingComments(current => [...current, id]);
    const next = more ? (commentPages[id] ?? 0) + 1 : 1;
    try {
      const result = await api.communityFeed.comments(id, next, 20);
      setComments(current => ({ ...current, [id]: next === 1 ? result : [...new Map([...(current[id] ?? []), ...result].map(item => [item.id, item])).values()] }));
      setCommentPages(current => ({ ...current, [id]: next }));
    } catch { setActionMessage("댓글을 불러오지 못했습니다. 다시 시도해 주세요."); }
    finally { setLoadingComments(current => current.filter(value => value !== id)); }
  }

  useEffect(() => {
    if (!viewingPost || !Number.isInteger(postId) || postId < 1) return;
    let active = true;
    api.communityFeed.comments(postId, 1, 20).then(result => {
      if (!active) return;
      setComments({ [postId]: result }); setCommentPages({ [postId]: 1 }); setExpandedComments([postId]);
    }).catch(() => { if (active) setActionMessage("댓글을 불러오지 못했습니다. 댓글 보기를 눌러 다시 시도해 주세요."); });
    return () => { active = false; };
  }, [viewingPost, postId]);

  const followButton = (id: number) => user?.id === id ? null : <button type="button" disabled={!profiles[id] || busyUsers.includes(id)} aria-pressed={profiles[id]?.followedByMe ?? false} onClick={() => void toggleFollow(id)} className={`shrink-0 cursor-pointer rounded-full px-3 py-1.5 text-xs font-bold disabled:opacity-40 ${profiles[id]?.followedByMe ? "bg-[#edf2ef] text-[#59675f]" : "bg-[#008f45] text-white"}`}>{profiles[id]?.followedByMe ? "팔로잉 · 취소" : "팔로우"}</button>;

  async function toggleLike(post: CommunityFeedResponse) {
    if (!user) {
      setActionMessage("좋아요를 누르려면 먼저 로그인해 주세요.");
      return;
    }
    if (postLocks.current.has(post.id)) return;
    postLocks.current.add(post.id);
    setBusyPostIds((current) => [...current, post.id]);
    try {
      const engagement = post.likedByMe
        ? await api.communityFeed.unlike(post.id)
        : await api.communityFeed.like(post.id);
      setPosts((current) => current.map((item) => item.id === post.id
        ? { ...item, ...engagement }
        : item));
    } catch {
      setActionMessage("좋아요를 반영하지 못했습니다. 잠시 후 다시 시도해 주세요.");
    } finally {
      postLocks.current.delete(post.id);
      setBusyPostIds((current) => current.filter((id) => id !== post.id));
    }
  }

  async function submitComment(postId: number) {
    const content = commentDrafts[postId]?.trim();
    if (!user) {
      setActionMessage("댓글을 작성하려면 먼저 로그인해 주세요.");
      return;
    }
    if (!content || postLocks.current.has(postId)) return;
    postLocks.current.add(postId);
    setBusyPostIds((current) => [...current, postId]);
    try {
      const comment = await api.communityFeed.addComment(postId, content);
      setComments((current) => ({
        ...current,
        [postId]: [...(current[postId] ?? []), comment],
      }));
      setPosts((current) => current.map((post) => post.id === postId
        ? { ...post, commentCount: post.commentCount + 1 }
        : post));
      setCommentDrafts((current) => ({ ...current, [postId]: "" }));
      void loadComments(postId);
    } catch {
      setActionMessage("댓글을 등록하지 못했습니다. 잠시 후 다시 시도해 주세요.");
    } finally {
      postLocks.current.delete(postId);
      setBusyPostIds((current) => current.filter((id) => id !== postId));
    }
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
            <h1 className="mt-2 text-3xl font-bold tracking-[-0.04em] sm:text-4xl">{viewingPost ? "스포츠 순간" : viewingProfile ? `${profiles[profileUserId]?.name ?? posts[0]?.authorName ?? "사용자"}님의 스포츠 피드` : "강원 스포츠 피드"}</h1>
            <p className="mt-3 max-w-xl text-sm leading-6 text-[#66736c]">
              강원에서 즐긴 스포츠 순간을 나누고, 관심 있는 탐험가를 팔로우해 보세요.
            </p>
            {!viewingProfile && user && <Link href={`/community?user=${user.id}`} className="mt-5 inline-flex flex-wrap items-center gap-4 rounded-2xl border border-[#dce5df] bg-[#f6faf7] px-5 py-3 text-sm transition hover:border-[#008f45]">
              {profiles[user.id]?.profileImageUrl && <Image src={profiles[user.id].profileImageUrl!} alt="내 프로필" width={44} height={44} className="size-11 rounded-full object-cover" />}
              <strong>{profiles[user.id]?.name ?? "내 프로필"}</strong>
              {profiles[user.id] ? <><span>팔로워 <strong>{profiles[user.id].followerCount}</strong></span><span>팔로잉 <strong>{profiles[user.id].followingCount}</strong></span></> : <span className="text-xs text-[#66736c]">프로필에서 팔로우 정보 확인</span>}
              <span className="text-xs font-bold text-[#008f45]">내 피드 보기 →</span>
            </Link>}
            {viewingProfile && profiles[profileUserId] && <div className="mt-4 flex flex-wrap items-center gap-4 text-sm">
              {profiles[profileUserId].profileImageUrl && <Image src={profiles[profileUserId].profileImageUrl!} alt="작성자 프로필" width={56} height={56} className="size-14 rounded-full object-cover" />}
              <span>팔로워 <strong>{profiles[profileUserId].followerCount}</strong></span><span>팔로잉 <strong>{profiles[profileUserId].followingCount}</strong></span>
              {profiles[profileUserId].isOperator && <span className="font-bold text-[#008f45]">운영자</span>}{followButton(profileUserId)}
            </div>}
          </div>
          <Link href={viewingPost || viewingProfile ? "/community" : "/missions"} className="inline-flex h-12 cursor-pointer items-center justify-center gap-2 rounded-xl bg-[#008f45] px-6 text-sm font-bold text-white shadow-sm transition hover:bg-[#00753a] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#008f45]">
            <AppIcon name={viewingPost || viewingProfile ? "chevronLeft" : "checkCircle"} className="size-5" />{viewingPost || viewingProfile ? "전체 피드로 돌아가기" : "미션 인증하러 가기"}
          </Link>
        </div>
      </section>

      <div className="mx-auto max-w-[1120px] px-4 pt-8 sm:px-6">
        {!viewingPost && !viewingProfile && <section className="flex items-center justify-between gap-4 border-b border-[#dce5df]">
          <div className="flex">
            <button type="button" onClick={() => selectTab("following")} aria-pressed={tab === "following"} className={`h-12 cursor-pointer border-b-2 px-5 text-sm font-bold ${tab === "following" ? "border-[#008f45] text-[#008f45]" : "border-transparent text-[#7a867f]"}`}>팔로잉</button>
            <button type="button" onClick={() => selectTab("all")} className={`h-12 cursor-pointer border-b-2 px-5 text-sm font-bold transition ${tab === "all" ? "border-[#008f45] text-[#008f45]" : "border-transparent text-[#7a867f] hover:text-[#34423a]"}`}>전체 피드</button>
            <button type="button" onClick={() => selectTab("mine")} className={`h-12 cursor-pointer border-b-2 px-5 text-sm font-bold transition ${(tab === "mine" || tab === "liked") ? "border-[#008f45] text-[#008f45]" : "border-transparent text-[#7a867f] hover:text-[#34423a]"}`}>내 피드</button>
          </div>
          <p className="hidden text-xs text-[#89948e] sm:block">공개 동의·승인된 인증과 운영자 안내</p>
        </section>}
        {!viewingPost && !viewingProfile && (tab === "mine" || tab === "liked") && <nav aria-label="내 피드" className="mt-5 flex gap-3">
          {(["mine", "liked"] as const).map(value => <button key={value} onClick={() => selectTab(value)} aria-pressed={tab === value} className={`cursor-pointer rounded-full px-5 py-2 text-sm font-bold ${tab === value ? "bg-[#173a2d] text-white" : "bg-white text-[#66736c]"}`}>{value === "mine" ? "내 게시글" : "좋아요한 게시글"}</button>)}
        </nav>}
        {actionMessage && <div role="status" className="mt-4 flex items-center justify-between gap-3 rounded-xl bg-[#fff7e6] px-4 py-3 text-sm font-semibold text-[#815f16]"><span>{actionMessage}</span>{!user && <Link href={loginUrl} className="shrink-0 font-black underline underline-offset-2">로그인</Link>}<button type="button" aria-label="알림 닫기" onClick={() => setActionMessage("")} className="ml-auto cursor-pointer text-lg">×</button></div>}

        {tab !== "all" && !viewingPost && !viewingProfile && !user ? (
          <section className="mt-8 rounded-[24px] border border-[#dce5df] bg-white px-6 py-16 text-center">
            <span className="mx-auto flex size-14 items-center justify-center rounded-full bg-[#e9f5ed] text-[#008f45]"><AppIcon name="person" className="size-7" /></span>
            <h2 className="mt-5 text-xl font-bold">로그인하고 내 인증 피드를 확인하세요</h2>
            <p className="mt-2 text-sm text-[#748078]">공개에 동의한 승인 완료 인증만 내 피드에 표시됩니다.</p>
            <Link href={loginUrl} className="mt-6 inline-flex h-11 items-center justify-center rounded-xl bg-[#008f45] px-6 text-sm font-bold text-white">로그인하기</Link>
          </section>
        ) : loading ? (
          <section className="mt-8 grid gap-5 sm:grid-cols-2 xl:grid-cols-4" aria-label="피드 불러오는 중">
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
            <h2 className="mt-5 text-xl font-bold">{tab === "liked" ? "좋아요한 게시글이 아직 없어요" : tab === "following" ? "팔로우한 탐험가의 게시글이 여기에 모여요" : "아직 공개된 인증 사진이 없어요"}</h2>
            <p className="mt-2 text-sm text-[#748078]">미션 인증 시 피드 공개를 선택하면 승인 후 이곳에 표시됩니다.</p>
            <Link href="/missions" className="mt-6 inline-flex h-11 items-center justify-center rounded-xl bg-[#008f45] px-6 text-sm font-bold text-white">미션 보러 가기</Link>
          </section>
        ) : (
          <section className={viewingPost ? "mt-8" : "mt-8 grid grid-cols-2 items-start gap-2 sm:gap-4 xl:grid-cols-4"}>
            {posts.map((post) => {
              const liked = post.likedByMe;
              const postTags = tags(post);
              if (!viewingPost) return <article key={post.id} className="relative"><Link href={`/community?post=${post.id}`} aria-label={`${post.authorName}님의 ${post.placeName ?? "스포츠"} 게시글 보기`} className="relative block aspect-square cursor-pointer overflow-hidden rounded-xl bg-[#e7ece8] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#008f45]">
                {post.proofUrl ? <Image src={post.proofUrl} alt={post.isDemo ? "운영자 데모 안내" : `${post.placeName ?? "강원 스포츠"} 인증 사진`} fill sizes="(max-width: 1280px) 50vw, 25vw" className="object-cover transition hover:scale-105" /> : <span className="flex h-full items-center justify-center text-sm text-[#66736c]">사진을 불러올 수 없습니다</span>}
                {post.isDemo && <span className="absolute left-2 top-2 rounded-full bg-white/95 px-2 py-1 text-[10px] font-bold text-[#12653d]">운영자 DEMO</span>}
                {(post.proofUrls?.length ?? 0) > 1 && <span className="absolute right-2 top-2 rounded-full bg-black/60 px-2 py-1 text-xs font-bold text-white">사진 {post.proofUrls!.length}장</span>}
              </Link><Link href={`/community?user=${post.authorId}`} aria-label={`${post.authorName}의 프로필 보기`} className="absolute bottom-2 left-2 flex max-w-[90%] items-center gap-2 rounded-full bg-white/95 py-1 pl-1 pr-3 text-xs font-bold text-[#173a2d] shadow hover:bg-white">{post.authorProfileImageUrl ? <Image src={post.authorProfileImageUrl} alt="" width={28} height={28} className="size-7 rounded-full object-cover" /> : <span className="flex size-7 items-center justify-center rounded-full bg-[#e2efe7] text-[10px]">{initials(post.authorName)}</span>}<span className="truncate">{post.authorName}</span></Link></article>;
              return (
                <article key={post.id} className="overflow-hidden rounded-[22px] border border-[#dde6e0] bg-white shadow-[0_4px_16px_rgba(23,58,45,0.07)]">
                  <header className="flex items-center gap-3 px-4 py-3.5">
                    <Link href={`/community?user=${post.authorId}`} aria-label={`${post.authorName}의 피드 보기`} className="shrink-0 cursor-pointer rounded-full focus-visible:outline-2 focus-visible:outline-[#008f45]">{post.authorProfileImageUrl ? <span className="relative block size-9 overflow-hidden rounded-full bg-[#e7ece8]"><Image src={post.authorProfileImageUrl} alt={`${post.authorName} 프로필 사진`} fill sizes="36px" className="object-cover" /></span> : <span className="flex size-9 items-center justify-center rounded-full bg-[#173a2d] text-xs font-bold text-white">{initials(post.authorName)}</span>}</Link>
                    <div className="min-w-0 flex-1">
                      <h2 className="truncate text-sm font-bold"><Link href={`/community?user=${post.authorId}`} className="cursor-pointer hover:text-[#008f45] hover:underline">{post.authorName}</Link></h2>
                      <p className="mt-0.5 truncate text-[11px] text-[#7a867f]">{profiles[post.authorId]?.isOperator ? "운영자 · " : ""}{post.isDemo ? "기능 체험용 데모" : post.placeName ?? post.sigun ?? "강원특별자치도"}</p>
                    </div>
                    {followButton(post.authorId)}
                  </header>
                  <div className="relative">
                    <ProofGallery key={post.id} urls={post.proofUrls?.length ? post.proofUrls : post.proofUrl ? [post.proofUrl] : []} label={post.isDemo ? "운영자 데모 안내 이미지" : `${post.placeName ?? "강원 스포츠"} 인증 사진`} />
                    {post.isDemo && <span className="absolute left-3 top-3 rounded-full bg-white/95 px-3 py-1 text-[10px] font-bold text-[#12653d]">운영자 DEMO · 실제 인증 아님</span>}
                  </div>
                  <div className="p-4">
                    <div className="flex items-center gap-2">
                      <button type="button" aria-label={liked ? "좋아요 취소" : "좋아요"} aria-pressed={liked} onClick={() => void toggleLike(post)} disabled={busyPostIds.includes(post.id)} className={`inline-flex size-9 cursor-pointer items-center justify-center rounded-full transition disabled:opacity-50 ${liked ? "bg-[#fff0f0] text-[#e04444]" : "bg-[#f3f6f4] text-[#4f5d55] hover:text-[#e04444]"}`}><AppIcon name="heart" className={`size-5 ${liked ? "fill-current" : ""}`} /></button>
                      <span className="text-xs font-bold text-[#4f5d55]">{post.likeCount}</span>
                      <button type="button" onClick={() => expandedComments.includes(post.id) ? setExpandedComments(current => current.filter(id => id !== post.id)) : void loadComments(post.id)} aria-label="댓글 펼치기" className="ml-1 inline-flex cursor-pointer items-center gap-1 text-xs font-bold text-[#4f5d55]"><AppIcon name="messageCircle" className="size-5" />{post.commentCount}</button>

                    </div>
                    <p className="mt-3 whitespace-pre-line break-words text-sm leading-6"><strong className="mr-2">{post.isDemo ? "운영자 안내" : post.placeName ?? "강원 스포츠 인증"}</strong>{post.caption ?? "미션 인증을 완료했습니다."}</p>
                    {postTags.length > 0 && <p className="mt-2 text-xs font-semibold text-[#008f45]">{postTags.map((tag) => `#${tag}`).join(" ")}</p>}
                    <div className="mt-4 space-y-3 border-t border-[#edf1ee] pt-3">
                      <button onClick={() => void loadComments(post.id)} className="cursor-pointer text-xs text-[#79867e]">댓글 {post.commentCount}개 보기</button>
                      {expandedComments.includes(post.id) && (comments[post.id] ?? []).map((comment) => <div key={comment.id} className="flex gap-2.5 text-sm">
                        <Link href={`/community?user=${comment.authorId}`} aria-label={`${comment.authorName}의 피드 보기`} className="shrink-0 cursor-pointer rounded-full">{comment.authorProfileImageUrl ? <span className="relative mt-0.5 block size-7 overflow-hidden rounded-full bg-[#e7ece8]"><Image src={comment.authorProfileImageUrl} alt={`${comment.authorName} 프로필 사진`} fill sizes="28px" className="object-cover" /></span> : <span className="mt-0.5 flex size-7 items-center justify-center rounded-full bg-[#e9f3ec] text-[9px] font-black text-[#17633d]">{initials(comment.authorName)}</span>}</Link>
                        <p className="min-w-0 leading-5"><strong className="mr-1.5"><Link href={`/community?user=${comment.authorId}`} className="cursor-pointer hover:text-[#008f45] hover:underline">{comment.authorName}</Link></strong><span className="break-words text-[#58655e]">{comment.content}</span></p>
                      </div>)}
                      {expandedComments.includes(post.id) && ((comments[post.id]?.length ?? 0) < post.commentCount || loadingComments.includes(post.id)) && <button disabled={loadingComments.includes(post.id)} onClick={() => void loadComments(post.id, true)} className="cursor-pointer text-xs text-[#008f45] disabled:opacity-50">{loadingComments.includes(post.id) ? "불러오는 중…" : "댓글 더 보기"}</button>}
                      <form onSubmit={(event) => { event.preventDefault(); void submitComment(post.id); }} className="flex items-center gap-2">
                        <input aria-label="댓글 내용" value={commentDrafts[post.id] ?? ""} onChange={(event) => setCommentDrafts((current) => ({ ...current, [post.id]: event.target.value }))} maxLength={500} placeholder={user ? "댓글 달기..." : "로그인 후 댓글을 남겨보세요"} className="h-10 min-w-0 flex-1 rounded-full border border-[#dce5df] bg-[#f8faf8] px-4 text-sm outline-none transition focus:border-[#008f45]" />
                        <button type="submit" disabled={!commentDrafts[post.id]?.trim() || busyPostIds.includes(post.id)} className="h-9 cursor-pointer rounded-full px-3 text-xs font-black text-[#008f45] disabled:cursor-not-allowed disabled:text-[#aab4ae]">게시</button>
                      </form>
                    </div>
                    <time className="mt-3 block text-[11px] text-[#9aa39e]">{displayDate(post.approvedAt)}</time>
                    {user?.id === post.authorId && !post.isDemo && <button type="button" onClick={() => void hideFromFeed(post.id)} className="mt-4 cursor-pointer text-xs font-semibold text-[#929c96] underline-offset-2 hover:text-[#b43d3d] hover:underline">피드에서 숨기기</button>}
                  </div>
                </article>
              );
            })}
          </section>
        )}
        {!loading && !error && hasMore && !(tab !== "all" && !user) && <div className="mt-8 text-center"><button disabled={loadingMore} onClick={() => void loadFeed(tab, page + 1)} className="cursor-pointer rounded-full border border-[#cbdcd0] bg-white px-6 py-3 text-sm font-bold disabled:opacity-50">{loadingMore ? "불러오는 중…" : "게시글 더 보기"}</button></div>}
      </div>
    </main>
  );
}

function CommunityRoute() {
  const params = useSearchParams();
  return <CommunityPageContent key={params.toString()} />;
}

export function CommunityPage() {
  return <Suspense><CommunityRoute /></Suspense>;
}
