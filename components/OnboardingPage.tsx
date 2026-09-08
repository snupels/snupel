"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { type FormEvent, useEffect, useRef, useState } from "react";
import { usernameSchema, type AuthUser } from "@/lib/api/dto";
import { api } from "@/lib/api/service";
import { ApiError } from "@/lib/api/repository";
import { authErrorMessage, loginHref, safeReturnPath } from "@/lib/auth-flow";
import { ConsentDocumentModal, type ConsentDocument } from "./ConsentDocumentModal";
import { AddressFields } from "./AddressFields";
import { readAccountAddress } from "@/lib/accountAddress";
import { UsernameField } from "./UsernameField";

export function OnboardingPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const next = safeReturnPath(searchParams.get("next"));
  const [user, setUser] = useState<AuthUser | null>(null);
  const [photo, setPhoto] = useState<File | null>(null);
  const [consents, setConsents] = useState({ terms: false, privacy: false, email: false, sns: false });
  const [pending, setPending] = useState(true);
  const [error, setError] = useState("");
  const [consentDocument, setConsentDocument] = useState<ConsentDocument>(null);
  const activeSession = useRef(false);
  const sessionVersion = useRef(0);
  const submitting = useRef(false);
  const [checkedUsername, setCheckedUsername] = useState<string | null>(null);

  useEffect(() => {
    activeSession.current = true;
    const version = ++sessionVersion.current;
    let ownerId = api.currentUser()?.id;
    const isCurrent = () => activeSession.current && version === sessionVersion.current && api.hasToken();
    const onAuthChange = () => {
      if (api.hasToken() && (ownerId === undefined || api.currentUser()?.id === ownerId)) return;
      sessionVersion.current += 1;
      setUser(null);
      setPhoto(null);
      setConsents({ terms: false, privacy: false, email: false, sns: false });
      setError("");
      setCheckedUsername(null);
      setPending(false);
      router.replace(api.hasToken() ? "/mypage/" : loginHref(next));
    };
    window.addEventListener("sportspassport-auth-change", onAuthChange);
    const cleanup = () => {
      activeSession.current = false;
      sessionVersion.current += 1;
      window.removeEventListener("sportspassport-auth-change", onAuthChange);
    };
    if (!api.hasToken()) { onAuthChange(); return cleanup; }
    api.me().then((profile) => {
      if (!isCurrent() || (ownerId !== undefined && profile.id !== ownerId)) return;
      ownerId = profile.id;
      if (!profile.onboardingRequired) { router.replace(next); return; }
      setUser(profile);
      setConsents((current) => ({ ...current, email: profile.marketingEmailAgreed, sns: profile.marketingSnsAgreed }));
    }).catch((reason) => {
      if (!isCurrent()) return;
      if (reason instanceof ApiError && reason.status === 401) router.replace(loginHref(next));
      else setError("가입 정보를 불러오지 못했습니다. 연결을 확인하고 새로고침해 주세요.");
    }).finally(() => { if (isCurrent()) setPending(false); });
    return cleanup;
  }, [router, next]);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!user || pending || submitting.current) return;
    const version = sessionVersion.current;
    const isCurrent = () => activeSession.current && version === sessionVersion.current
      && api.hasToken() && api.currentUser()?.id === user.id;
    if (!isCurrent()) return;
    const form = new FormData(event.currentTarget);
    const parsedUsername = usernameSchema.safeParse(String(form.get("username") || ""));
    const username = parsedUsername.success ? parsedUsername.data : "";
    if (!user.username && (!username || checkedUsername !== username)) {
      setError("사용할 아이디를 입력하고 중복 확인을 완료해 주세요.");
      return;
    }
    submitting.current = true;
    setPending(true); setError("");
    try {
      let profileImageKey: string | undefined;
      if (photo) {
        const upload = await api.createProfileUploadUrl({ contentType: photo.type as "image/jpeg" | "image/png" | "image/webp" });
        if (!isCurrent()) return;
        const body = new FormData();
        Object.entries(upload.fields).forEach(([key, value]) => body.append(key, value));
        body.append("file", photo);
        const uploaded = await fetch(upload.uploadUrl, { method: "POST", body });
        if (!isCurrent()) return;
        if (!uploaded.ok) throw new Error("upload failed");
        profileImageKey = upload.objectKey;
      }
      if (!isCurrent()) return;
      const updated = await api.updateProfile({
        ...(!user.username ? { username } : {}),
        nickname: String(form.get("nickname")).trim(),
        phoneNumber: String(form.get("phoneNumber")).trim(),
        ...readAccountAddress(form),
        agreeTerms: true,
        agreePrivacy: true,
        agreeMarketingEmail: consents.email,
        agreeMarketingSns: consents.sns,
        ...(profileImageKey ? { profileImageKey } : {}),
      });
      if (!isCurrent()) return;
      if (updated.onboardingRequired) throw new Error("onboarding incomplete");
      router.replace(next);
    } catch (reason) { if (isCurrent()) setError(authErrorMessage(reason)); }
    finally { submitting.current = false; if (isCurrent()) setPending(false); }
  }

  if (!user) return <div className="grid min-h-screen place-items-center bg-[#f3f7f4] p-6 text-center text-sm text-[#6f7a87]"><div>{error ? <><p role="alert">{error}</p><button type="button" onClick={() => location.reload()} className="mt-4 font-bold text-[#008f45]">다시 불러오기</button><Link href="/" className="ml-4 underline">홈으로</Link></> : "가입 정보를 불러오는 중…"}</div></div>;

  return <div className="min-h-screen bg-gradient-to-br from-[#e6f0e9] via-white to-[#f3f7f4] px-4 py-10"><form onSubmit={submit} className="mx-auto w-full max-w-xl rounded-[28px] border border-white bg-white p-7 shadow-[0_28px_80px_rgba(24,67,47,0.16)] sm:p-9"><div className="text-center"><p className="text-sm font-bold text-[#008f45]">WELCOME</p><h1 className="mt-2 text-3xl font-bold">회원가입 마무리</h1><p className="mt-2 text-sm text-[#6f7a87]">아이디, 닉네임과 전화번호를 설정하고 필수 약관에 동의해 주세요. 프로필 사진과 주소는 선택사항입니다.</p></div><div className="mt-8 space-y-5">{!user.username && <UsernameField idPrefix="onboarding" disabled={pending} onVerifiedChange={setCheckedUsername} />}<div><label htmlFor="onboardingNickname" className="text-sm font-bold">닉네임</label><input id="onboardingNickname" name="nickname" required minLength={2} maxLength={30} defaultValue={user.nickname ?? ""} className="mt-2 h-12 w-full rounded-xl border border-[#dfe5e1] px-4 text-sm" /></div><div><label htmlFor="onboardingPhone" className="text-sm font-bold">전화번호</label><input id="onboardingPhone" name="phoneNumber" type="tel" required inputMode="tel" autoComplete="tel" pattern="01[016789]-?[0-9]{3,4}-?[0-9]{4}" defaultValue={user.phoneNumber ?? ""} placeholder="010-1234-5678" className="mt-2 h-12 w-full rounded-xl border border-[#dfe5e1] px-4 text-sm" /></div><AddressFields idPrefix="onboarding" value={user} disabled={pending} /><div><label htmlFor="onboardingPhoto" className="text-sm font-bold">프로필 사진 <span className="font-normal text-[#7c8781]">(선택)</span></label><input id="onboardingPhoto" type="file" accept="image/jpeg,image/png,image/webp" onChange={(event) => setPhoto(event.target.files?.[0] ?? null)} className="mt-2 block w-full rounded-xl border border-[#dfe5e1] p-3 text-sm file:mr-3 file:rounded-lg file:border-0 file:bg-[#e7f4ec] file:px-3 file:py-2 file:font-bold file:text-[#008f45]" /></div><fieldset className="space-y-3 rounded-2xl border border-[#dfe5e1] bg-[#f8faf9] p-4"><label className="flex items-center gap-2 border-b border-[#e3e8e5] pb-3 text-sm font-bold"><input type="checkbox" checked={Object.values(consents).every(Boolean)} onChange={(event) => setConsents({ terms: event.target.checked, privacy: event.target.checked, email: event.target.checked, sns: event.target.checked })} className="size-4 accent-[#008f45]" />전체 동의</label><label className="flex gap-2 text-sm"><input type="checkbox" required checked={consents.terms} onChange={(event) => setConsents({ ...consents, terms: event.target.checked })} className="size-4 accent-[#008f45]" /><span><strong>[필수]</strong> 이용약관 동의 <button type="button" onClick={() => setConsentDocument("service")} className="text-[#008f45] underline">보기</button></span></label><label className="flex gap-2 text-sm"><input type="checkbox" required checked={consents.privacy} onChange={(event) => setConsents({ ...consents, privacy: event.target.checked })} className="size-4 accent-[#008f45]" /><span><strong>[필수]</strong> 개인정보 수집·이용 동의 <button type="button" onClick={() => setConsentDocument("privacy")} className="text-[#008f45] underline">보기</button></span></label><label className="flex gap-2 text-sm"><input type="checkbox" checked={consents.email} onChange={(event) => setConsents({ ...consents, email: event.target.checked })} className="size-4 accent-[#008f45]" /><span>[선택] 이메일 마케팅 수신 동의 <button type="button" onClick={() => setConsentDocument("marketingEmail")} className="ml-1 text-[#008f45] underline">보기</button></span></label><label className="flex gap-2 text-sm"><input type="checkbox" checked={consents.sns} onChange={(event) => setConsents({ ...consents, sns: event.target.checked })} className="size-4 accent-[#008f45]" /><span>[선택] SMS 마케팅 수신 동의 <button type="button" onClick={() => setConsentDocument("marketingSms")} className="ml-1 text-[#008f45] underline">보기</button></span></label></fieldset></div>{error && <p role="alert" className="mt-5 rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700">{error}</p>}<button disabled={pending} className="mt-7 h-12 w-full rounded-xl bg-[#008f45] text-sm font-bold text-white disabled:opacity-60">{pending ? "저장 중…" : "가입 완료"}</button></form><ConsentDocumentModal document={consentDocument} onClose={() => setConsentDocument(null)} /></div>;
}
