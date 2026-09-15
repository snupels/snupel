"use client";

import { useSearchParams } from "next/navigation";

export function SupportRequestTarget() {
  const searchParams = useSearchParams();
  const target = searchParams.get("target")?.trim() ?? "";
  if (!/^(?:post|comment)-[1-9][0-9]*$/.test(target)) return null;
  const [kind, id] = target.split("-");
  return <p role="status" className="mt-4 rounded-xl bg-[#fff7e6] px-4 py-3 text-sm font-bold text-[#755716]">신고 대상: {kind === "post" ? "게시물" : "댓글"} #{id}</p>;
}
