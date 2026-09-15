import type { Metadata } from "next";
import { ActivityHistoryPage } from "@/components/ActivityHistoryPage";

export const metadata: Metadata = { title: "활동 이력", description: "미션 인증, 스탬프와 관심 활동의 처리 상태를 확인하세요." };

export default function ActivityHistoryRoutePage() {
  return <ActivityHistoryPage />;
}
