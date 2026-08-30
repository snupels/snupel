"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { type FormEvent, useEffect, useState } from "react";
import { api } from "@/lib/api/service";
import type { AuthUser } from "@/lib/api/dto";
import { AppIcon } from "./AppIcon";

export function AccountPage() {
  const router = useRouter();
  const [user, setUser] = useState<AuthUser | null>(null);
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState("");
  const [pending, setPending] = useState(true);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    if (!api.hasToken()) {
      router.replace("/login");
      return;
    }
    api.me().then((profile) => {
      if (profile.onboardingRequired) { router.replace("/onboarding"); return; }
      setUser(profile);
    }).catch(() => router.replace("/login")).finally(() => setPending(false));
  }, [router]);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!user) return;
    setPending(true);
    setMessage("");
    setError("");
    const form = new FormData(event.currentTarget);
    try {
      let profileImageKey: string | undefined;
      if (file) {
        const upload = await api.createProfileUploadUrl({ contentType: file.type as "image/jpeg" | "image/png" | "image/webp" });
        const uploadBody = new FormData();
        Object.entries(upload.fields).forEach(([key, value]) => uploadBody.append(key, value));
        uploadBody.append("file", file);
        const uploaded = await fetch(upload.uploadUrl, { method: "POST", body: uploadBody });
        if (!uploaded.ok) throw new Error("upload failed");
        profileImageKey = upload.objectKey;
      }
      const updated = await api.updateProfile({
        nickname: String(form.get("nickname") || "").trim() || null,
        birthDate: String(form.get("birthDate") || "") || null,
        gender: (String(form.get("gender") || "") || null) as "male" | "female" | "other" | "unknown" | null,
        agreeMarketingEmail: form.get("agreeMarketingEmail") === "on",
        agreeMarketingSns: form.get("agreeMarketingSns") === "on",
        ...(profileImageKey ? { profileImageKey } : {}),
      });
      setUser(updated);
      setFile(null);
      setPreview("");
      setMessage("계정 정보가 저장되었습니다.");
    } catch {
      setError("계정 정보를 저장하지 못했습니다. 입력 내용과 사진 형식을 확인해 주세요.");
    } finally {
      setPending(false);
    }
  }

  function logout() {
    api.logout();
    router.replace("/");
    router.refresh();
  }

  if (!user) return <div className="grid min-h-[60vh] place-items-center text-sm text-[#6f7a87]">{pending ? "계정 정보를 불러오는 중…" : "로그인이 필요합니다."}</div>;

  const shownImage = preview || user.profileImageUrl || "";
  const displayName = user.nickname || user.email.split("@")[0];

  return (
    <div className="bg-[#f3f7f4] px-4 py-12 sm:px-6">
      <div className="mx-auto max-w-[980px]">
        <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
          <div><p className="text-sm font-bold text-[#008f45]">MY ACCOUNT</p><h1 className="mt-2 text-3xl font-bold tracking-[-0.03em]">마이페이지</h1><p className="mt-2 text-sm text-[#68736d]">내 계정 정보와 공개 프로필을 관리하세요.</p></div>
          <Link href="/mypage" className="inline-flex h-11 items-center justify-center gap-2 rounded-xl border border-[#bad4c4] bg-white px-5 text-sm font-bold text-[#008f45]">나의 패스포트 보기<AppIcon name="arrowRight" /></Link>
        </div>

        <div className="mt-8 grid gap-6 lg:grid-cols-[300px_minmax(0,1fr)]">
          <aside className="rounded-[24px] border border-[#dfe7e1] bg-white p-6 text-center shadow-sm">
            <div className="mx-auto flex size-28 items-center justify-center overflow-hidden rounded-full bg-[#e7f4ec] text-4xl font-bold text-[#008f45] shadow-inner" style={shownImage ? { backgroundImage: `url(${shownImage})`, backgroundPosition: "center", backgroundSize: "cover" } : undefined}>{!shownImage && displayName.slice(0, 1).toUpperCase()}</div>
            <h2 className="mt-5 text-xl font-bold">{displayName}</h2><p className="mt-1 break-all text-sm text-[#7b8580]">{user.email}</p>
            <Link href="/account-help?mode=password" className="mt-6 flex h-10 items-center justify-center rounded-xl bg-[#f1f7f3] text-sm font-bold text-[#008f45]">비밀번호 변경</Link>
            <button type="button" onClick={logout} className="mt-3 h-10 w-full rounded-xl border border-[#e0e5e2] text-sm font-semibold text-[#6a746f] hover:bg-[#f7f9f8]">로그아웃</button>
          </aside>

          <form onSubmit={submit} className="rounded-[24px] border border-[#dfe7e1] bg-white p-6 shadow-sm sm:p-8">
            <h2 className="text-xl font-bold">계정 정보 수정</h2>
            <div className="mt-7 space-y-5">
              <div><label className="text-sm font-bold" htmlFor="email">아이디(이메일)</label><input id="email" value={user.email} readOnly className="mt-2 h-12 w-full rounded-xl border border-[#e1e6e3] bg-[#f4f6f5] px-4 text-sm text-[#6f7974]" /></div>
              <div><label className="text-sm font-bold" htmlFor="nickname">닉네임</label><input id="nickname" name="nickname" defaultValue={user.nickname ?? ""} minLength={2} maxLength={30} placeholder="2~30자로 입력해 주세요" className="mt-2 h-12 w-full rounded-xl border border-[#dce4df] px-4 text-sm outline-none focus:border-[#008f45] focus:ring-2 focus:ring-[#008f45]/15" /></div>
              <div><label className="text-sm font-bold" htmlFor="profilePhoto">프로필 사진</label><input id="profilePhoto" type="file" accept="image/jpeg,image/png,image/webp" onChange={(event) => { const selected = event.target.files?.[0] ?? null; if (selected && selected.size > 10 * 1024 * 1024) { setError("프로필 사진은 10MB 이하만 가능합니다."); event.target.value = ""; return; } setError(""); setFile(selected); if (!selected) { setPreview(""); return; } const reader = new FileReader(); reader.onload = () => setPreview(typeof reader.result === "string" ? reader.result : ""); reader.readAsDataURL(selected); }} className="mt-2 block w-full rounded-xl border border-[#dce4df] p-3 text-sm file:mr-4 file:rounded-lg file:border-0 file:bg-[#e7f4ec] file:px-4 file:py-2 file:font-bold file:text-[#008f45]" /><p className="mt-2 text-xs text-[#7c8781]">JPG, PNG, WebP · 최대 10MB</p></div>
              <div className="grid gap-4 sm:grid-cols-2"><div><label className="text-sm font-bold" htmlFor="birthDate">생년월일</label><input id="birthDate" name="birthDate" type="date" defaultValue={user.birthDate ?? ""} className="mt-2 h-12 w-full rounded-xl border border-[#dce4df] px-4 text-sm" /></div><div><label className="text-sm font-bold" htmlFor="gender">성별</label><select id="gender" name="gender" defaultValue={user.gender ?? ""} className="mt-2 h-12 w-full rounded-xl border border-[#dce4df] px-4 text-sm"><option value="">선택 안 함</option><option value="male">남성</option><option value="female">여성</option><option value="other">기타</option><option value="unknown">미상</option></select></div></div>
              <fieldset className="rounded-2xl border border-[#dce4df] bg-[#f8faf9] p-4"><legend className="px-1 text-sm font-bold">홍보 수신 설정</legend><label className="mt-2 flex items-center gap-2 text-sm"><input name="agreeMarketingEmail" type="checkbox" defaultChecked={user.marketingEmailAgreed} className="size-4 accent-[#008f45]" />스포츠 행사·혜택 이메일 수신</label><label className="mt-3 flex items-center gap-2 text-sm"><input name="agreeMarketingSns" type="checkbox" defaultChecked={user.marketingSnsAgreed} className="size-4 accent-[#008f45]" />스포츠 행사·혜택 SNS 수신</label><Link href="/terms" target="_blank" className="mt-3 inline-block text-xs font-semibold text-[#008f45] underline">약관 및 개인정보 수집 내용 보기</Link></fieldset>
            </div>
            {message && <p role="status" className="mt-5 rounded-xl bg-[#e9f7ee] px-4 py-3 text-sm font-semibold text-[#00783a]">{message}</p>}
            {error && <p role="alert" className="mt-5 rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700">{error}</p>}
            <button type="submit" disabled={pending} className="mt-7 h-12 w-full rounded-xl bg-[#008f45] text-sm font-bold text-white hover:bg-[#00783a] disabled:opacity-60">{pending ? "저장 중…" : "변경사항 저장"}</button>
          </form>
        </div>
      </div>
    </div>
  );
}
