import type { Metadata } from "next";
import { ActivityHistoryPage } from "@/components/ActivityHistoryPage";

export const metadata: Metadata = { title: "활동 이력", description: "미션 인증과 스탬프 활동의 처리 상태를 확인하세요." };

export default function Page() {
  return <ActivityHistoryPage />;
}
