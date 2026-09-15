import type { Metadata } from "next";
import { PassportPage } from "@/components/PassportPage";

export const metadata: Metadata = { title: "스탬프북", description: "획득한 강원 스포츠 스탬프와 인증 가능한 미션을 확인하세요." };

export default function StampBookRoutePage() {
  return <PassportPage />;
}
