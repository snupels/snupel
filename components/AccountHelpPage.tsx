"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { type FormEvent, useEffect, useRef, useState } from "react";
import { api } from "@/lib/api/service";

export function AccountHelpPage() {
  const searchParams = useSearchParams();
  const [mode, setMode] = useState<"id" | "password">(searchParams.get("mode") === "id" ? "id" : "password");
  const [step, setStep] = useState<"request" | "confirm" | "done">("request");
  const [identity, setIdentity] = useState({ username: "", email: "" });
  const [pending, setPending] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const submitting = useRef(false);
  const active = useRef(true);
  const requestVersion = useRef(0);

  useEffect(() => {
    active.current = true;
    return () => { active.current = false; requestVersion.current += 1; };
  }, []);

  function changeMode(next: "id" | "password") {
    if (submitting.current) return;
    requestVersion.current += 1;
    setMode(next); setStep("request"); setIdentity({ username: "", email: "" }); setMessage(""); setError("");
  }

  async function request(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (pending || submitting.current) return;
    submitting.current = true;
    const version = ++requestVersion.current;
    const isCurrent = () => active.current && version === requestVersion.current;
    setPending(true); setError(""); setMessage("");
    const form = new FormData(event.currentTarget);
    const pair = { username: String(form.get("username") || "").trim(), email: String(form.get("email") || "").trim() };
    try {
      if (mode === "id") { await api.accountReminder(pair.email); }
      else {
        await api.requestPasswordReset(pair);
        if (isCurrent()) { setIdentity(pair); setStep("confirm"); }
      }
      if (isCurrent()) setMessage("요청을 접수했습니다. 가입 정보가 일치하면 이메일로 안내를 받으실 수 있습니다. 메일이 없으면 스팸함을 확인하거나 잠시 후 다시 시도해 주세요.");
    } catch { if (isCurrent()) setError("요청을 처리하지 못했습니다. 잠시 후 다시 시도해 주세요."); }
    finally { submitting.current = false; if (isCurrent()) setPending(false); }
  }

  async function confirm(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (pending || submitting.current) return;
    const form = new FormData(event.currentTarget);
    if (String(form.get("password")) !== String(form.get("passwordConfirm"))) { setError("새 비밀번호가 일치하지 않습니다."); return; }
    submitting.current = true;
    const version = ++requestVersion.current;
    const isCurrent = () => active.current && version === requestVersion.current;
    setPending(true); setError("");
    try {
      await api.confirmPasswordReset({ ...identity, code: String(form.get("code") || "").trim(), newPassword: String(form.get("password")) });
      if (isCurrent()) { setStep("done"); setMessage("비밀번호를 변경했습니다. 새 비밀번호로 로그인해 주세요."); }
    } catch { if (isCurrent()) setError("입력 정보 또는 인증번호가 올바르지 않거나 유효시간이 지났습니다."); }
    finally { submitting.current = false; if (isCurrent()) setPending(false); }
  }

  function restart() {
    if (submitting.current) return;
    requestVersion.current += 1;
    setStep("request"); setError(""); setMessage("");
  }

  return (
    <div className="grid min-h-[calc(100vh-64px)] place-items-center bg-gradient-to-br from-[#e7f2eb] via-white to-[#f4f8f5] px-4 py-12">
      <div className="w-full max-w-md rounded-[28px] border border-white bg-white p-7 shadow-[0_24px_70px_rgba(24,67,47,0.14)] sm:p-9">
        <h1 className="text-center text-2xl font-bold">계정 찾기</h1><p className="mt-2 text-center text-sm text-[#6f7a87]">아이디를 확인하거나 비밀번호를 다시 설정하세요.</p>
        <div className="mt-7 grid grid-cols-2 rounded-xl bg-[#f0f4f1] p-1"><button type="button" disabled={pending} onClick={() => changeMode("id")} className={`h-10 rounded-lg text-sm font-bold disabled:opacity-60 ${mode === "id" ? "bg-white text-[#008f45] shadow-sm" : "text-[#6f7974]"}`}>아이디 찾기</button><button type="button" disabled={pending} onClick={() => changeMode("password")} className={`h-10 rounded-lg text-sm font-bold disabled:opacity-60 ${mode === "password" ? "bg-white text-[#008f45] shadow-sm" : "text-[#6f7974]"}`}>비밀번호 찾기</button></div>

        {step === "request" && <form key={mode} onSubmit={request} className="mt-7 space-y-4">
          {mode === "password" && <div><label htmlFor="helpUsername" className="text-sm font-bold">아이디</label><input id="helpUsername" name="username" type="text" required disabled={pending} maxLength={254} autoComplete="username" autoCapitalize="none" autoCorrect="off" spellCheck={false} defaultValue={identity.username} placeholder="아이디 또는 기존 로그인 이메일" aria-describedby="helpUsernameHint" className="mt-2 h-12 w-full rounded-xl border border-[#dce4df] px-4 text-sm outline-none focus:border-[#008f45] focus:ring-2 focus:ring-[#008f45]/15" /><p id="helpUsernameHint" className="mt-2 text-xs leading-5 text-[#7a8580]">아이디를 아직 설정하지 않은 기존 회원은 로그인 이메일을 입력해 주세요.</p></div>}
          <div><label htmlFor="helpEmail" className="text-sm font-bold">가입할 때 사용한 이메일</label><input id="helpEmail" name="email" type="email" required disabled={pending} autoComplete="email" defaultValue={identity.email} placeholder="example@email.com" className="mt-2 h-12 w-full rounded-xl border border-[#dce4df] px-4 text-sm outline-none focus:border-[#008f45] focus:ring-2 focus:ring-[#008f45]/15" /></div>
          <p className="text-xs leading-5 text-[#7a8580]">{mode === "id" ? "가입할 때 사용한 이메일로 아이디 안내를 요청합니다." : "아이디와 이메일이 일치하는 계정에 비밀번호 변경용 인증번호를 요청합니다. 소셜 계정은 Google·카카오 로그인 버튼을 이용해 주세요."}</p>
          <button disabled={pending} className="h-12 w-full rounded-xl bg-[#008f45] text-sm font-bold text-white disabled:opacity-60">{pending ? "요청 중…" : "이메일로 안내받기"}</button>
        </form>}
        {step === "confirm" && <form onSubmit={confirm} className="mt-7 space-y-4"><p className="break-all rounded-xl bg-[#f1f7f3] px-4 py-3 text-sm text-[#4f5f56]">입력한 정보가 일치한다면 {identity.email}에서 인증번호를 확인해 주세요. 메일이 없으면 입력 정보와 스팸함을 확인해 주세요.</p><div><label htmlFor="code" className="text-sm font-bold">인증번호</label><input id="code" name="code" disabled={pending} autoComplete="one-time-code" inputMode="numeric" pattern="[0-9]{6}" maxLength={6} required placeholder="6자리 숫자" className="mt-2 h-12 w-full rounded-xl border border-[#dce4df] px-4 text-sm" /></div><div><label htmlFor="newPassword" className="text-sm font-bold">새 비밀번호</label><input id="newPassword" name="password" type="password" disabled={pending} autoComplete="new-password" minLength={8} maxLength={128} required className="mt-2 h-12 w-full rounded-xl border border-[#dce4df] px-4 text-sm" /></div><div><label htmlFor="passwordConfirm" className="text-sm font-bold">새 비밀번호 확인</label><input id="passwordConfirm" name="passwordConfirm" type="password" disabled={pending} autoComplete="new-password" minLength={8} maxLength={128} required className="mt-2 h-12 w-full rounded-xl border border-[#dce4df] px-4 text-sm" /></div><button disabled={pending} className="h-12 w-full rounded-xl bg-[#008f45] text-sm font-bold text-white disabled:opacity-60">{pending ? "변경 중…" : "비밀번호 변경"}</button><button type="button" disabled={pending} onClick={restart} className="block w-full text-sm font-semibold text-[#647169] disabled:opacity-60">입력 정보 수정·인증번호 다시 받기</button></form>}
        {step === "done" && <Link href="/login" className="mt-7 flex h-12 items-center justify-center rounded-xl bg-[#008f45] text-sm font-bold text-white">로그인하러 가기</Link>}
        {message && <p role="status" className="mt-5 rounded-xl bg-[#e9f7ee] px-4 py-3 text-sm text-[#00783a]">{message}</p>}{error && <p role="alert" className="mt-5 rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700">{error}</p>}
        <Link href="/login" className="mt-6 block text-center text-sm font-semibold text-[#647169]">로그인으로 돌아가기</Link>
      </div>
    </div>
  );
}
