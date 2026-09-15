import type { Metadata } from "next";
import { Suspense } from "react";
import { OnboardingPage } from "@/components/OnboardingPage";

export const metadata: Metadata = { title: "회원가입 마무리", description: "강원 스포츠 패스포트 계정의 필수 정보를 설정하세요." };

export default function Onboarding() {
  return <Suspense fallback={<main className="grid min-h-screen place-items-center bg-[#f3f7f4] text-sm text-[#6f7a87]">가입 정보를 준비하고 있습니다…</main>}><OnboardingPage /></Suspense>;
}
