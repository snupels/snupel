import type { Metadata } from "next";
import { SportsMapPage } from "@/components/SportsMapPage";

export const metadata: Metadata = { title: "지역별 스포츠 지도", description: "강원 18개 시군의 스포츠 시설을 지도와 접근 가능한 목록으로 확인하세요." };

export default function MapPage() {
  return <SportsMapPage />;
}
