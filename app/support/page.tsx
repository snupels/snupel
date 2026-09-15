import type { Metadata } from "next";
import { SupportPage } from "@/components/SupportPage";

export const metadata: Metadata = {
  title: "운영정보와 고객지원",
  description: "강원 스포츠 패스포트의 운영정보, 회원 탈퇴, 개인정보와 스포츠 피드 신고 절차를 확인하세요.",
};

export default function SupportRoute() {
  return <SupportPage />;
}
