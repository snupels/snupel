"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { api } from "@/lib/api/service";
import { loginHref } from "@/lib/auth-flow";
import { AppIcon } from "./AppIcon";

function SaveActivityControl({ activityId, returnTo }: { activityId: number; returnTo: string }) {
  const [saved, setSaved] = useState(false);
  const [busy, setBusy] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [retry, setRetry] = useState(0);
  const lock = useRef(false);

  useEffect(() => {
    if (!api.hasToken()) return;
    let active = true;
    async function load() {
      try {
        // A saved activity may be beyond the first page.
        for (let page = 1; active; page++) {
          const items = await api.savedActivities.list(page, 100);
          if (!active) return;
          if (items.some(item => item.activityId === activityId)) { setSaved(true); break; }
          if (items.length < 100) { setSaved(false); break; }
        }
        if (active) setError("");
      } catch { if (active) setError("저장 상태를 확인하지 못했습니다."); }
      finally { if (active) setLoading(false); }
    }
    void load();
    return () => { active = false; };
  }, [activityId, retry]);

  if (!api.hasToken()) return <Link href={loginHref(returnTo)} className="mt-3 flex h-11 w-full items-center justify-center rounded-xl border border-[#9dcdb0] text-sm font-bold text-[#00783a]">로그인 후 저장</Link>;

  async function toggle() {
    if (lock.current || loading) return;
    lock.current = true; setBusy(true); setError("");
    try {
      if (saved) await api.savedActivities.remove(activityId);
      else await api.savedActivities.save(activityId);
      setSaved(!saved);
    } catch { setError("저장 상태를 변경하지 못했습니다. 잠시 후 다시 시도해 주세요."); }
    finally { lock.current = false; setBusy(false); }
  }

  return <div>
    <button type="button" onClick={() => void toggle()} disabled={busy || loading || Boolean(error)} aria-pressed={saved} className="mt-3 flex h-11 w-full items-center justify-center gap-2 rounded-xl border border-[#008f45] bg-white text-sm font-bold text-[#008f45] disabled:opacity-60"><AppIcon name={saved ? "checkCircle" : "award"} />{loading ? "저장 상태 확인 중…" : busy ? "처리 중…" : saved ? "저장됨 · 취소" : "관심 활동 저장"}</button>
    {error && <p role="alert" className="mt-2 text-sm text-red-700">{error} <button type="button" onClick={() => { setLoading(true); setRetry(value => value + 1); }} className="underline">다시 확인</button></p>}
  </div>;
}

export function SaveActivityButton({ activityId, returnTo = `/events/detail/?id=${activityId}` }: { activityId: number; returnTo?: string }) {
  return <SaveActivityControl key={activityId} activityId={activityId} returnTo={returnTo} />;
}
