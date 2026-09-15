import type { Metadata } from "next";
import { PortalPage } from "@/components/PortalPage";

export const metadata: Metadata = { title: "스포츠 탐색", description: "강원 18개 시군의 스포츠 장소와 이용정보를 지역과 종목별로 찾아보세요." };

export default function SportsPage() {
  return <PortalPage page="sports" />;
}
