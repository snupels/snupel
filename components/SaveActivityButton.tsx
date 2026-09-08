"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { api } from "@/lib/api/service";
import { AppIcon } from "./AppIcon";

export function SaveActivityButton({ activityId }: { activityId: number }) {
  const [saved, setSaved] = useState(false);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (!api.hasToken()) return;
    api.savedActivities.list(1, 100).then((items) => setSaved(items.some((item) => item.activityId === activityId))).catch(() => undefined);
  }, [activityId]);

  if (!api.hasToken()) return <Link href="/login" className="mt-3 flex h-11 w-full items-center justify-center rounded-xl border border-[#9dcdb0] text-sm font-bold text-[#00783a]">로그인 후 저장</Link>;

  async function toggle() {
    setBusy(true);
    try {
      if (saved) await api.savedActivities.remove(activityId);
      else await api.savedActivities.save(activityId);
      setSaved(!saved);
    } finally {
      setBusy(false);
    }
  }

  return <button type="button" onClick={toggle} disabled={busy} aria-pressed={saved} className="mt-3 flex h-11 w-full items-center justify-center gap-2 rounded-xl border border-[#008f45] bg-white text-sm font-bold text-[#008f45] disabled:opacity-60"><AppIcon name={saved ? "checkCircle" : "award"} />{busy ? "처리 중…" : saved ? "저장됨" : "관심 활동 저장"}</button>;
}
