import type { Metadata } from "next";
import { SportsDetailPage } from "@/components/SportsDetailPage";

export const metadata: Metadata = { title: "스포츠 장소 상세", description: "강원 스포츠 장소의 주소, 이용정보, 공식 홈페이지와 지도 위치를 확인하세요." };

export default function SportsDetailRoute() {
  return <SportsDetailPage />;
}
