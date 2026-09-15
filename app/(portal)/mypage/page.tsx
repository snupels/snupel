import type { Metadata } from "next";
import { MyPassportPage } from "@/components/MyPassportPage";

export const metadata: Metadata = { title: "나의 패스포트", description: "내 스탬프, 배지, 미션 활동과 저장한 행사를 확인하세요." };

export default function MyPage() {
  return <MyPassportPage />;
}
