"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { type FormEvent, useEffect, useState } from "react";
import { api } from "@/lib/api/service";
import type { AuthProvider } from "@/lib/api/dto";
import { ApiError } from "@/lib/api/repository";
import { AppIcon } from "./AppIcon";
import { ConsentDocumentModal, type ConsentDocument } from "./ConsentDocumentModal";
import { SiteFooter } from "./SiteFooter";

const OAUTH_KEY = "sportspassport-oauth";

export function LoginPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [signup, setSignup] = useState(false);
  const [pending, setPending] = useState(false);
  const [error, setError] = useState("");
  const [profilePhoto, setProfilePhoto] = useState<File | null>(null);
  const [consents, setConsents] = useState({ terms: false, privacy: false, email: false, sns: false });
  const [consentDocument, setConsentDocument] = useState<ConsentDocument>(null);

  useEffect(() => {
    const code = searchParams.get("code");
    const state = searchParams.get("state");
    const saved = sessionStorage.getItem(OAUTH_KEY);
    if (!code || !state || !saved) return;

    const { provider, redirectUri } = JSON.parse(saved) as { provider: AuthProvider; redirectUri: string };
    api.oauthLogin(provider, { code, state, redirectUri })
      .then((result) => {
        sessionStorage.removeItem(OAUTH_KEY);
        router.replace(result.user.onboardingRequired ? "/onboarding" : "/mypage");
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
        if (!profilePhoto) {
          setError("프로필 사진을 등록해 주세요.");
          setPending(false);
          return;
        }
        const auth = await api.signup({
          email: String(form.get("email")),
          password: String(form.get("password")),
          birthDate: String(form.get("birthDate") || "") || undefined,
          gender: (String(form.get("gender") || "") || undefined) as "male" | "female" | "other" | "unknown" | undefined,
          nickname: String(form.get("nickname")),
          phoneNumber: String(form.get("phoneNumber")),
          agreeTerms: true,
          agreePrivacy: true,
          agreeMarketingEmail: form.get("agreeMarketingEmail") === "on",
          agreeMarketingSns: form.get("agreeMarketingSns") === "on",
        });
        const upload = await api.createProfileUploadUrl({ contentType: profilePhoto.type as "image/jpeg" | "image/png" | "image/webp" });
        const uploadBody = new FormData();
        Object.entries(upload.fields).forEach(([key, value]) => uploadBody.append(key, value));
        uploadBody.append("file", profilePhoto);
        const uploaded = await fetch(upload.uploadUrl, { method: "POST", body: uploadBody });
        if (!uploaded.ok) throw new Error("profile upload failed");
        await api.updateProfile({ profileImageKey: upload.objectKey });
        if (auth.user.onboardingRequired) await api.me();
      } else {
        await api.login({ email: String(form.get("email")), password: String(form.get("password")) });
      }
      const user = api.currentUser();
      router.replace(user?.onboardingRequired ? "/onboarding" : "/mypage");
    } catch (reason) {
      if (signup && api.hasToken()) {
        router.replace("/onboarding");
        return;
      }
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
            {signup && <div><label htmlFor="phoneNumber" className="text-sm font-semibold">전화번호</label><input id="phoneNumber" name="phoneNumber" type="tel" required inputMode="tel" autoComplete="tel" pattern="01[016789]-?[0-9]{3,4}-?[0-9]{4}" placeholder="010-1234-5678" className="mt-2 h-12 w-full rounded-xl border border-[#dfe5e1] bg-[#f6f8f7] px-4 text-sm" /></div>}
            {signup && <div className="grid grid-cols-2 gap-2"><button type="button" onClick={() => setConsentDocument("service")} className="rounded-xl border border-[#dfe5e1] px-3 py-2 text-center text-xs font-bold text-[#008f45]">이용약관 보기</button><button type="button" onClick={() => setConsentDocument("privacy")} className="rounded-xl border border-[#dfe5e1] px-3 py-2 text-center text-xs font-bold text-[#008f45]">개인정보 동의 보기</button></div>}
            <div><label htmlFor="email" className="text-sm font-semibold">이메일</label><input id="email" name="email" type="email" required autoComplete="email" placeholder="example@email.com" className="mt-2 h-12 w-full rounded-xl border border-[#dfe5e1] bg-[#f6f8f7] px-4 text-sm outline-none focus:border-[#008f45] focus:ring-2 focus:ring-[#008f45]/15" /></div>
            <div><label htmlFor="password" className="text-sm font-semibold">비밀번호</label><input id="password" name="password" type="password" required minLength={signup ? 8 : 1} maxLength={128} autoComplete={signup ? "new-password" : "current-password"} placeholder="비밀번호를 입력하세요" className="mt-2 h-12 w-full rounded-xl border border-[#dfe5e1] bg-[#f6f8f7] px-4 text-sm outline-none focus:border-[#008f45] focus:ring-2 focus:ring-[#008f45]/15" /></div>
            {signup && <><div><label htmlFor="nickname" className="text-sm font-semibold">닉네임</label><input id="nickname" name="nickname" required minLength={2} maxLength={30} placeholder="2~30자로 입력해 주세요" className="mt-2 h-12 w-full rounded-xl border border-[#dfe5e1] bg-[#f6f8f7] px-4 text-sm" /></div><div><label htmlFor="signupPhoto" className="text-sm font-semibold">프로필 사진</label><input id="signupPhoto" type="file" required accept="image/jpeg,image/png,image/webp" onChange={(event) => setProfilePhoto(event.target.files?.[0] ?? null)} className="mt-2 block w-full rounded-xl border border-[#dfe5e1] bg-[#f6f8f7] p-3 text-sm file:mr-3 file:rounded-lg file:border-0 file:bg-[#e7f4ec] file:px-3 file:py-2 file:font-bold file:text-[#008f45]" /></div><div className="grid grid-cols-2 gap-3"><div><label htmlFor="birthDate" className="text-sm font-semibold">생년월일</label><input id="birthDate" name="birthDate" type="date" className="mt-2 h-12 w-full rounded-xl border border-[#dfe5e1] bg-[#f6f8f7] px-3 text-sm" /></div><div><label htmlFor="gender" className="text-sm font-semibold">성별</label><select id="gender" name="gender" className="mt-2 h-12 w-full rounded-xl border border-[#dfe5e1] bg-[#f6f8f7] px-3 text-sm"><option value="">선택 안 함</option><option value="male">남성</option><option value="female">여성</option><option value="other">기타</option><option value="unknown">미상</option></select></div></div><fieldset className="space-y-3 rounded-2xl border border-[#dfe5e1] bg-[#f8faf9] p-4"><label className="flex items-center gap-2 border-b border-[#e3e8e5] pb-3 text-sm font-bold"><input type="checkbox" checked={Object.values(consents).every(Boolean)} onChange={(event) => setConsents({ terms: event.target.checked, privacy: event.target.checked, email: event.target.checked, sns: event.target.checked })} className="size-4 accent-[#008f45]" />전체 동의</label><label className="flex items-start gap-2 text-sm"><input name="agreeTerms" type="checkbox" required checked={consents.terms} onChange={(event) => setConsents({ ...consents, terms: event.target.checked })} className="mt-0.5 size-4 accent-[#008f45]" /><span><strong>[필수]</strong> 이용약관 동의 <button type="button" onClick={() => setConsentDocument("service")} className="ml-1 text-[#008f45] underline">보기</button></span></label><label className="flex items-start gap-2 text-sm"><input name="agreePrivacy" type="checkbox" required checked={consents.privacy} onChange={(event) => setConsents({ ...consents, privacy: event.target.checked })} className="mt-0.5 size-4 accent-[#008f45]" /><span><strong>[필수]</strong> 개인정보 수집·이용 동의 <button type="button" onClick={() => setConsentDocument("privacy")} className="ml-1 text-[#008f45] underline">보기</button></span></label><label className="flex items-start gap-2 text-sm"><input name="agreeMarketingEmail" type="checkbox" checked={consents.email} onChange={(event) => setConsents({ ...consents, email: event.target.checked })} className="mt-0.5 size-4 accent-[#008f45]" /><span>[선택] 이메일 마케팅 수신 동의</span></label><label className="flex items-start gap-2 text-sm"><input name="agreeMarketingSns" type="checkbox" checked={consents.sns} onChange={(event) => setConsents({ ...consents, sns: event.target.checked })} className="mt-0.5 size-4 accent-[#008f45]" /><span>[선택] SMS 마케팅 수신 동의</span></label></fieldset></>}
            {error && <p role="alert" className="text-sm text-red-600">{error}</p>}
            <button type="submit" disabled={pending} className="h-12 w-full rounded-xl bg-[#008f45] text-sm font-semibold text-white transition hover:bg-[#00783a] disabled:opacity-60">{pending ? "처리 중…" : signup ? "가입하기" : "로그인"}</button>
          </form>
          {!signup && <div className="mt-4 flex items-center justify-center gap-3 text-sm text-[#68736d]"><Link href="/account-help?mode=id" className="hover:text-[#008f45]">아이디 찾기</Link><span className="h-3 w-px bg-[#d7ddd9]" /><Link href="/account-help?mode=password" className="hover:text-[#008f45]">비밀번호 찾기</Link></div>}
          <div className="my-6 flex items-center gap-3 text-xs text-[#98a19c]"><span className="h-px flex-1 bg-[#e4e9e6]" />또는<span className="h-px flex-1 bg-[#e4e9e6]" /></div>
          <div className="grid gap-3"><button type="button" disabled={pending} onClick={() => oauth("google")} className="h-11 rounded-xl border border-[#dfe5e1] text-sm font-medium hover:bg-[#f6f8f7]">Google로 로그인·가입</button><button type="button" disabled={pending} onClick={() => oauth("kakao")} className="h-11 rounded-xl bg-[#fee500] text-sm font-medium text-[#191919]">카카오로 로그인·가입</button></div>
          <p className="mt-7 text-center text-sm text-[#7a8491]">{signup ? "이미 계정이 있으신가요?" : "계정이 없으신가요?"} <button type="button" onClick={() => { setSignup(!signup); setError(""); }} className="font-semibold text-[#008f45]">{signup ? "로그인" : "회원가입"}</button></p>
          <Link href="/" className="mt-5 flex items-center justify-center gap-1 text-sm font-semibold text-[#52605a]">로그인 없이 둘러보기<AppIcon name="arrowRight" /></Link>
        </div>
      </main>
      <SiteFooter />
      <ConsentDocumentModal document={consentDocument} onClose={() => setConsentDocument(null)} />
    </div>
  );
}
