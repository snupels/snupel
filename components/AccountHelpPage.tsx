"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { type FormEvent, useState } from "react";
import { api } from "@/lib/api/service";

export function AccountHelpPage() {
  const searchParams = useSearchParams();
  const [mode, setMode] = useState<"id" | "password">(searchParams.get("mode") === "id" ? "id" : "password");
  const [step, setStep] = useState<"request" | "confirm" | "done">("request");
  const [email, setEmail] = useState("");
  const [pending, setPending] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  function changeMode(next: "id" | "password") { setMode(next); setStep("request"); setMessage(""); setError(""); }

  async function request(event: FormEvent<HTMLFormElement>) {
    event.preventDefault(); setPending(true); setError(""); setMessage("");
    const form = new FormData(event.currentTarget); const address = String(form.get("email")); setEmail(address);
    try {
      if (mode === "id") { await api.accountReminder(address); setMessage("가입된 계정이 있다면 아이디 안내 메일을 발송했습니다."); }
      else { await api.requestPasswordReset(address); setStep("confirm"); setMessage("가입된 계정이 있다면 6자리 인증번호를 발송했습니다."); }
    } catch { setError("메일을 발송하지 못했습니다. 잠시 후 다시 시도해 주세요."); }
    finally { setPending(false); }
  }

  async function confirm(event: FormEvent<HTMLFormElement>) {
    event.preventDefault(); setPending(true); setError("");
    const form = new FormData(event.currentTarget);
    if (String(form.get("password")) !== String(form.get("passwordConfirm"))) { setError("새 비밀번호가 일치하지 않습니다."); setPending(false); return; }
    try { await api.confirmPasswordReset({ email, code: String(form.get("code")), newPassword: String(form.get("password")) }); setStep("done"); setMessage("비밀번호를 변경했습니다. 새 비밀번호로 로그인해 주세요."); }
    catch { setError("인증번호가 올바르지 않거나 유효시간이 지났습니다."); }
    finally { setPending(false); }
  }

  return (
    <div className="grid min-h-[calc(100vh-64px)] place-items-center bg-gradient-to-br from-[#e7f2eb] via-white to-[#f4f8f5] px-4 py-12">
      <div className="w-full max-w-md rounded-[28px] border border-white bg-white p-7 shadow-[0_24px_70px_rgba(24,67,47,0.14)] sm:p-9">
        <h1 className="text-center text-2xl font-bold">계정 찾기</h1><p className="mt-2 text-center text-sm text-[#6f7a87]">아이디를 확인하거나 비밀번호를 다시 설정하세요.</p>
        <div className="mt-7 grid grid-cols-2 rounded-xl bg-[#f0f4f1] p-1"><button type="button" onClick={() => changeMode("id")} className={`h-10 rounded-lg text-sm font-bold ${mode === "id" ? "bg-white text-[#008f45] shadow-sm" : "text-[#6f7974]"}`}>아이디 찾기</button><button type="button" onClick={() => changeMode("password")} className={`h-10 rounded-lg text-sm font-bold ${mode === "password" ? "bg-white text-[#008f45] shadow-sm" : "text-[#6f7974]"}`}>비밀번호 찾기</button></div>

        {step === "request" && <form onSubmit={request} className="mt-7"><label htmlFor="helpEmail" className="text-sm font-bold">가입할 때 사용한 이메일</label><input id="helpEmail" name="email" type="email" required autoComplete="email" placeholder="example@email.com" className="mt-2 h-12 w-full rounded-xl border border-[#dce4df] px-4 text-sm outline-none focus:border-[#008f45] focus:ring-2 focus:ring-[#008f45]/15" /><p className="mt-3 text-xs leading-5 text-[#7a8580]">{mode === "id" ? "입력한 이메일로 가입된 계정이 있으면 아이디 안내를 보내드립니다." : "입력한 이메일로 비밀번호 변경용 6자리 인증번호를 보내드립니다."}</p><button disabled={pending} className="mt-6 h-12 w-full rounded-xl bg-[#008f45] text-sm font-bold text-white disabled:opacity-60">{pending ? "발송 중…" : "이메일로 안내받기"}</button></form>}
        {step === "confirm" && <form onSubmit={confirm} className="mt-7 space-y-4"><p className="rounded-xl bg-[#f1f7f3] px-4 py-3 text-sm text-[#4f5f56]">{email}로 전송된 인증번호를 입력하세요.</p><div><label htmlFor="code" className="text-sm font-bold">인증번호</label><input id="code" name="code" inputMode="numeric" pattern="[0-9]{6}" maxLength={6} required placeholder="6자리 숫자" className="mt-2 h-12 w-full rounded-xl border border-[#dce4df] px-4 text-sm" /></div><div><label htmlFor="newPassword" className="text-sm font-bold">새 비밀번호</label><input id="newPassword" name="password" type="password" minLength={8} maxLength={128} required className="mt-2 h-12 w-full rounded-xl border border-[#dce4df] px-4 text-sm" /></div><div><label htmlFor="passwordConfirm" className="text-sm font-bold">새 비밀번호 확인</label><input id="passwordConfirm" name="passwordConfirm" type="password" minLength={8} maxLength={128} required className="mt-2 h-12 w-full rounded-xl border border-[#dce4df] px-4 text-sm" /></div><button disabled={pending} className="h-12 w-full rounded-xl bg-[#008f45] text-sm font-bold text-white disabled:opacity-60">{pending ? "변경 중…" : "비밀번호 변경"}</button></form>}
        {step === "done" && <Link href="/login" className="mt-7 flex h-12 items-center justify-center rounded-xl bg-[#008f45] text-sm font-bold text-white">로그인하러 가기</Link>}
        {message && <p role="status" className="mt-5 rounded-xl bg-[#e9f7ee] px-4 py-3 text-sm text-[#00783a]">{message}</p>}{error && <p role="alert" className="mt-5 rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700">{error}</p>}
        <Link href="/login" className="mt-6 block text-center text-sm font-semibold text-[#647169]">로그인으로 돌아가기</Link>
      </div>
    </div>
  );
}
