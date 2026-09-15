import type { Metadata } from "next";
import { ActivityDetailPage } from "@/components/ActivityDetailPage";

export const metadata: Metadata = { title: "활동 상세", description: "미션 인증 사진과 승인·반려 상태를 확인하세요." };

export default function ActivityDetailRoutePage() {
  return <ActivityDetailPage />;
}
