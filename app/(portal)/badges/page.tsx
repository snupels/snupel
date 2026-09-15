import type { Metadata } from "next";
import { BadgesPage } from "@/components/BadgesPage";

export const metadata: Metadata = { title: "나의 배지", description: "스포츠 미션으로 획득한 디지털 배지와 실물 배지 배송 상태를 확인하세요." };

export default function BadgesRoute() {
  return <BadgesPage />;
}
