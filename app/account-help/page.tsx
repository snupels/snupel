import type { Metadata } from "next";
import { Suspense } from "react";
import { AccountHelpPage } from "@/components/AccountHelpPage";

export const metadata: Metadata = { title: "계정 찾기", description: "아이디를 확인하거나 비밀번호 재설정 절차를 시작하세요." };

export default function AccountHelp() {
  return <Suspense fallback={<main className="grid min-h-screen place-items-center bg-[#f3f7f4] text-sm text-[#6f7a87]">계정 도움말을 준비하고 있습니다…</main>}><AccountHelpPage /></Suspense>;
}
