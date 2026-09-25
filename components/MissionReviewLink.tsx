"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { api } from "@/lib/api/service";

export function MissionReviewLink() {
  const [allowed, setAllowed] = useState(false);
  useEffect(() => {
    let active = true;
    let version = 0;
    const check = () => {
      const current = ++version;
      setAllowed(false);
      if (api.hasToken()) void api.adminStampSubmissions.permission()
        .then(result => { if (active && current === version) setAllowed(result.canReviewMissions); })
        .catch(() => { if (active && current === version) setAllowed(false); });
    };
    check();
    window.addEventListener("sportspassport-auth-change", check);
    return () => { active = false; window.removeEventListener("sportspassport-auth-change", check); };
  }, []);
  return allowed ? <Link href="/mission-review/" className="my-4 inline-flex cursor-pointer rounded-xl bg-[#173a2d] px-5 py-3 text-sm font-bold text-white">운영자 · 미션 인증 관리 →</Link> : null;
}
