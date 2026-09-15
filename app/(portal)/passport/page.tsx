import type { Metadata } from "next";
import { PassportPage } from "@/components/PassportPage";

export const metadata: Metadata = { title: "스탬프북", description: "미션 인증으로 모은 강원 스포츠 스탬프와 향후 리워드 계획을 확인하세요." };

export default function PassportRoute() {
  return <PassportPage />;
}
