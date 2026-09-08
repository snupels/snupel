"use client";

import { useEffect, useRef, useState } from "react";
import { api } from "@/lib/api/service";
import { usernameSchema } from "@/lib/api/dto";

type CheckStatus = "idle" | "checking" | "available" | "unavailable" | "error";

export function UsernameField({ idPrefix, disabled = false, required = true, onVerifiedChange }: {
  idPrefix: string;
  disabled?: boolean;
  required?: boolean;
  onVerifiedChange: (username: string | null) => void;
}) {
  const [value, setValue] = useState("");
  const [status, setStatus] = useState<CheckStatus>("idle");
  const requestVersion = useRef(0);
  const active = useRef(true);
  const valid = usernameSchema.safeParse(value).success;
  const inputId = `${idPrefix}-username`;

  useEffect(() => {
    active.current = true;
    return () => { active.current = false; requestVersion.current += 1; };
  }, []);

  function change(raw: string) {
    requestVersion.current += 1;
    setValue(raw.trim().replace(/[A-Z]/g, (letter) => letter.toLowerCase()));
    setStatus("idle");
    onVerifiedChange(null);
  }

  async function check() {
    if (disabled || !valid) return;
    const version = ++requestVersion.current;
    setStatus("checking");
    onVerifiedChange(null);
    try {
      const result = await api.checkUsername(value);
      if (!active.current || version !== requestVersion.current) return;
      const available = result.available && result.username === value;
      setStatus(available ? "available" : "unavailable");
      onVerifiedChange(available ? value : null);
    } catch {
      if (active.current && version === requestVersion.current) setStatus("error");
    }
  }

  const message = status === "checking" ? "아이디 사용 가능 여부를 확인하고 있습니다."
    : status === "available" ? "사용 가능한 아이디입니다. 최종 등록 시 다시 확인합니다."
    : status === "unavailable" ? "사용할 수 없는 아이디입니다. 다른 아이디를 입력해 주세요."
    : status === "error" ? "중복 확인을 하지 못했습니다. 잠시 후 다시 시도해 주세요."
    : value && !valid ? "영문 소문자, 숫자, 밑줄(_)을 사용해 4~20자로 입력해 주세요."
    : "아이디를 입력한 뒤 중복 확인을 눌러 주세요.";

  return <div>
    <label htmlFor={inputId} className="text-sm font-semibold">아이디{!required && <span className="ml-1 font-normal text-[#7c8781]">(선택)</span>}</label>
    <div className="mt-2 flex gap-2">
      <input id={inputId} name="username" value={value} onChange={(event) => change(event.target.value)} required={required} disabled={disabled} minLength={4} maxLength={20} pattern="[a-z0-9_]{4,20}" autoComplete="username" autoCapitalize="none" autoCorrect="off" spellCheck={false} placeholder="영문 소문자·숫자·_ 4~20자" aria-describedby={`${inputId}-hint ${inputId}-status`} aria-invalid={Boolean(value && !valid) || status === "unavailable"} className="h-12 min-w-0 flex-1 rounded-xl border border-[#dfe5e1] bg-[#f6f8f7] px-3 text-sm outline-none focus:border-[#008f45] focus:ring-2 focus:ring-[#008f45]/15 disabled:opacity-60" />
      <button type="button" disabled={disabled || !valid || status === "checking"} onClick={check} className="shrink-0 rounded-xl border border-[#b8d9c6] px-3 text-sm font-semibold text-[#00783a] hover:bg-[#eff7f2] disabled:opacity-50">{status === "checking" ? "확인 중…" : "중복 확인"}</button>
    </div>
    <p id={`${inputId}-hint`} className="mt-2 text-xs leading-5 text-[#7a8580]">영문 소문자·숫자·밑줄(_) 4~20자. 등록한 아이디는 변경할 수 없습니다.{!required && " 설정하지 않아도 기존 이메일로 로그인할 수 있습니다."}</p>
    <p id={`${inputId}-status`} role="status" aria-live="polite" className={`mt-1 text-xs leading-5 ${status === "unavailable" || status === "error" ? "text-red-600" : status === "available" ? "text-[#00783a]" : "text-[#6f7a87]"}`}>{message}</p>
  </div>;
}
