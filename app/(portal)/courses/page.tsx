import type { Metadata } from "next";
import { PortalPage } from "@/components/PortalPage";

export const metadata: Metadata = { title: "맞춤 코스", description: "지역, 스포츠, 테마와 여행 시간에 맞는 강원 스포츠 코스를 추천받으세요." };

export default function CoursesPage() {
  return <PortalPage page="courses" />;
}
