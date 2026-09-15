import type { Metadata } from "next";
import { PrivacyPolicyPage } from "@/components/PrivacyPolicyPage";

export const metadata: Metadata = {
  title: "개인정보 처리방침",
  description: "강원 스포츠 패스포트의 개인정보 처리 목적, 항목, 보유기간과 이용자 권리를 확인하세요.",
};

export default function PrivacyTerms() {
  return <PrivacyPolicyPage />;
}
