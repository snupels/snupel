import type { Metadata } from "next";
import { Suspense } from "react";
import { MissionDetailPage } from "@/components/MissionDetailPage";

export const metadata: Metadata = { title: "미션 상세", description: "강원 스포츠 패스포트 미션의 참여 기간, 인증 조건과 스탬프 보상을 확인하세요." };

export default function MissionDetailRoute() {
  return <Suspense fallback={<main className="grid min-h-[65vh] place-items-center bg-[#f3f7f4]">미션을 불러오는 중...</main>}><MissionDetailPage /></Suspense>;
}
