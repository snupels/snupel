"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { type FormEvent, useEffect, useState } from "react";
import { api } from "@/lib/api/service";
import { AppIcon } from "./AppIcon";

export function PasswordChangePage() {
  const router = useRouter();
  const [authChecked, setAuthChecked] = useState(false);
  const [pending, setPending] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    if (!api.hasToken()) {
      router.replace("/login");
      return;
    }
    api.me().then(() => setAuthChecked(true)).catch(() => router.replace("/login"));
  }, [router]);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setPending(true);
    setMessage("");
    setError("");
    const form = new FormData(event.currentTarget);
    const currentPassword = String(form.get("currentPassword"));
    const newPassword = String(form.get("newPassword"));
    if (newPassword !== String(form.get("newPasswordConfirm"))) {
      setError("새 비밀번호가 일치하지 않습니다.");
      setPending(false);
      return;
    }
    try {
      await api.changePassword({ currentPassword, newPassword });
      event.currentTarget.reset();
      setMessage("비밀번호가 변경되었습니다.");
    } catch {
      setError("현재 비밀번호가 올바르지 않습니다. 소셜 로그인 계정은 해당 로그인 수단을 이용해 주세요.");
    } finally {
      setPending(false);
    }
  }

  if (!authChecked) return <div className="grid min-h-[60vh] place-items-center bg-[#f3f7f4] text-sm text-[#6f7a87]">계정 정보를 확인하는 중…</div>;

  return (
    <div className="grid min-h-[70vh] place-items-center bg-[#f3f7f4] px-4 py-12">
      <form onSubmit={submit} className="w-full max-w-md rounded-[24px] border border-[#dfe7e1] bg-white p-7 shadow-sm sm:p-8">
        <span className="mx-auto flex size-14 items-center justify-center rounded-full bg-[#e7f4ec] text-[#008f45]"><AppIcon name="lock" className="size-6" /></span>
        <h1 className="mt-5 text-center text-2xl font-bold">비밀번호 변경</h1>
        <p className="mt-2 text-center text-sm leading-6 text-[#6f7a87]">현재 비밀번호를 확인한 뒤 새 비밀번호로 변경합니다.</p>
        <div className="mt-7 space-y-5">
          <div><label htmlFor="currentPassword" className="text-sm font-bold">현재 비밀번호</label><input id="currentPassword" name="currentPassword" type="password" required autoComplete="current-password" className="mt-2 h-12 w-full rounded-xl border border-[#dce4df] px-4 text-sm outline-none focus:border-[#008f45] focus:ring-2 focus:ring-[#008f45]/15" /></div>
          <div><label htmlFor="newPassword" className="text-sm font-bold">새 비밀번호</label><input id="newPassword" name="newPassword" type="password" required minLength={8} maxLength={128} autoComplete="new-password" className="mt-2 h-12 w-full rounded-xl border border-[#dce4df] px-4 text-sm outline-none focus:border-[#008f45] focus:ring-2 focus:ring-[#008f45]/15" /></div>
          <div><label htmlFor="newPasswordConfirm" className="text-sm font-bold">새 비밀번호 확인</label><input id="newPasswordConfirm" name="newPasswordConfirm" type="password" required minLength={8} maxLength={128} autoComplete="new-password" className="mt-2 h-12 w-full rounded-xl border border-[#dce4df] px-4 text-sm outline-none focus:border-[#008f45] focus:ring-2 focus:ring-[#008f45]/15" /></div>
        </div>
        {message && <p role="status" className="mt-5 rounded-xl bg-[#e9f7ee] px-4 py-3 text-sm font-semibold text-[#00783a]">{message}</p>}
        {error && <p role="alert" className="mt-5 rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700">{error}</p>}
        <button disabled={pending} className="mt-6 h-12 w-full rounded-xl bg-[#008f45] text-sm font-bold text-white disabled:opacity-60">{pending ? "변경 중…" : "비밀번호 변경"}</button>
        <Link href="/account" className="mt-3 flex h-11 items-center justify-center text-sm font-semibold text-[#6f7a87]">마이페이지로 돌아가기</Link>
      </form>
    </div>
  );
}
