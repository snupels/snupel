import type { Metadata } from "next";
import { PortalPage } from "@/components/PortalPage";

export const metadata: Metadata = { title: "이벤트·축제", description: "강원에서 열리는 스포츠 대회, 체험 행사와 지역 축제의 일정과 공식 안내를 확인하세요." };

export default function EventsPage() {
  return <PortalPage page="events" />;
}
