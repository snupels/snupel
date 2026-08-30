"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { type FormEvent, useEffect, useState } from "react";
import { api } from "@/lib/api/service";
import type { AuthProvider } from "@/lib/api/dto";
import { ApiError } from "@/lib/api/repository";
import { AppIcon } from "./AppIcon";
import { SiteFooter } from "./SiteFooter";

const OAUTH_KEY = "sportspassport-oauth";

export function LoginPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [signup, setSignup] = useState(false);
  const [pending, setPending] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const code = searchParams.get("code");
    const state = searchParams.get("state");
    const saved = sessionStorage.getItem(OAUTH_KEY);
    if (!code || !state || !saved) return;

    const { provider, redirectUri } = JSON.parse(saved) as { provider: AuthProvider; redirectUri: string };
    api.oauthLogin(provider, { code, state, redirectUri })
      .then(() => {
        sessionStorage.removeItem(OAUTH_KEY);
        router.replace("/mypage");
      })
      .catch(showError)
      .finally(() => setPending(false));
  }, [router, searchParams]);

  function showError(reason: unknown) {
    setError(reason instanceof ApiError && reason.status === 401 ? "이메일 또는 비밀번호를 확인해 주세요." : "요청을 처리하지 못했습니다. 잠시 후 다시 시도해 주세요.");
  }

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setPending(true);
    setError("");
    const form = new FormData(event.currentTarget);
    try {
      if (signup) {
        await api.signup({
          email: String(form.get("email")),
          password: String(form.get("password")),
          birthDate: String(form.get("birthDate") || "") || undefined,
          gender: (String(form.get("gender") || "") || undefined) as "male" | "female" | "other" | "unknown" | undefined,
        });
      } else {
        await api.login({ email: String(form.get("email")), password: String(form.get("password")) });
      }
      router.replace("/mypage");
    } catch (reason) {
      showError(reason);
    } finally {
      setPending(false);
    }
  }

  async function oauth(provider: AuthProvider) {
    setPending(true);
    setError("");
    try {
      const redirectUri = new URL("/login/", location.origin).toString();
      const result = await api.authorize(provider, redirectUri);
      sessionStorage.setItem(OAUTH_KEY, JSON.stringify({ provider, redirectUri }));
      location.assign(result.authorizationUrl);
    } catch (reason) {
      showError(reason);
      setPending(false);
    }
  }

  return (
    <div className="flex min-h-screen flex-col">
      <main className="grid flex-1 place-items-center bg-gradient-to-br from-[#e6f0e9] via-white to-[#f3f7f4] px-4 py-10">
        <div className="w-full max-w-md rounded-[28px] border border-white bg-white/95 p-7 shadow-[0_28px_80px_rgba(24,67,47,0.16)] sm:p-9">
          <Link href="/" className="mx-auto flex w-fit items-center gap-3" aria-label="메인 페이지로 이동"><span className="flex size-12 items-center justify-center rounded-full bg-[#008f45] text-white"><AppIcon name="mountain" className="size-6" /></span><span><strong className="block text-[#008f45]">강원 스포츠 패스포트</strong><span className="text-[10px] tracking-[0.08em] text-[#738078]">GANGWON SPORTS PASSPORT</span></span></Link>
          <div className="mt-8 text-center"><h1 className="text-2xl font-bold">{signup ? "회원가입" : "로그인"}</h1><p className="mt-2 text-sm text-[#6f7a87]">스탬프와 미션 기록을 이어서 관리하세요.</p></div>
          <form onSubmit={submit} className="mt-8 space-y-5">
            <div><label htmlFor="email" className="text-sm font-semibold">이메일</label><input id="email" name="email" type="email" required autoComplete="email" placeholder="example@email.com" className="mt-2 h-12 w-full rounded-xl border border-[#dfe5e1] bg-[#f6f8f7] px-4 text-sm outline-none focus:border-[#008f45] focus:ring-2 focus:ring-[#008f45]/15" /></div>
            <div><label htmlFor="password" className="text-sm font-semibold">비밀번호</label><input id="password" name="password" type="password" required minLength={signup ? 8 : 1} maxLength={128} autoComplete={signup ? "new-password" : "current-password"} placeholder="비밀번호를 입력하세요" className="mt-2 h-12 w-full rounded-xl border border-[#dfe5e1] bg-[#f6f8f7] px-4 text-sm outline-none focus:border-[#008f45] focus:ring-2 focus:ring-[#008f45]/15" /></div>
            {signup && <div className="grid grid-cols-2 gap-3"><div><label htmlFor="birthDate" className="text-sm font-semibold">생년월일</label><input id="birthDate" name="birthDate" type="date" className="mt-2 h-12 w-full rounded-xl border border-[#dfe5e1] bg-[#f6f8f7] px-3 text-sm" /></div><div><label htmlFor="gender" className="text-sm font-semibold">성별</label><select id="gender" name="gender" className="mt-2 h-12 w-full rounded-xl border border-[#dfe5e1] bg-[#f6f8f7] px-3 text-sm"><option value="">선택 안 함</option><option value="male">남성</option><option value="female">여성</option><option value="other">기타</option><option value="unknown">미상</option></select></div></div>}
            {error && <p role="alert" className="text-sm text-red-600">{error}</p>}
            <button type="submit" disabled={pending} className="h-12 w-full rounded-xl bg-[#008f45] text-sm font-semibold text-white transition hover:bg-[#00783a] disabled:opacity-60">{pending ? "처리 중…" : signup ? "가입하기" : "로그인"}</button>
          </form>
          {!signup && <div className="mt-4 flex items-center justify-center gap-3 text-sm text-[#68736d]"><Link href="/account-help?mode=id" className="hover:text-[#008f45]">아이디 찾기</Link><span className="h-3 w-px bg-[#d7ddd9]" /><Link href="/account-help?mode=password" className="hover:text-[#008f45]">비밀번호 찾기</Link></div>}
          <div className="my-6 flex items-center gap-3 text-xs text-[#98a19c]"><span className="h-px flex-1 bg-[#e4e9e6]" />또는<span className="h-px flex-1 bg-[#e4e9e6]" /></div>
          <div className="grid gap-3"><button type="button" disabled={pending} onClick={() => oauth("google")} className="h-11 rounded-xl border border-[#dfe5e1] text-sm font-medium hover:bg-[#f6f8f7]">Google로 로그인</button><button type="button" disabled={pending} onClick={() => oauth("kakao")} className="h-11 rounded-xl bg-[#fee500] text-sm font-medium text-[#191919]">카카오로 로그인</button></div>
          <p className="mt-7 text-center text-sm text-[#7a8491]">{signup ? "이미 계정이 있으신가요?" : "계정이 없으신가요?"} <button type="button" onClick={() => { setSignup(!signup); setError(""); }} className="font-semibold text-[#008f45]">{signup ? "로그인" : "회원가입"}</button></p>
          <Link href="/" className="mt-5 flex items-center justify-center gap-1 text-sm font-semibold text-[#52605a]">로그인 없이 둘러보기<AppIcon name="arrowRight" /></Link>
        </div>
      </main>
      <SiteFooter />
    </div>
  );
}
