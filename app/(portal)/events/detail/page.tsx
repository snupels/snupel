import type { Metadata } from "next";
import { EventDetailPage } from "@/components/EventDetailPage";

export const metadata: Metadata = { title: "이벤트 상세", description: "강원 스포츠 이벤트의 일정, 장소, 공식 안내와 캘린더 추가 정보를 확인하세요." };

export default function EventDetailRoute() {
  return <EventDetailPage />;
}
